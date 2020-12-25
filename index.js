//IE11/10 crap - Thank you stackoverflow: https://stackoverflow.com/questions/45758837/script5009-urlsearchparams-is-undefined-in-ie-11
var isIE = (!!window.MSInputMethodContext && !!document.documentMode) || (navigator.userAgent.indexOf('MSIE') > 1);
if(isIE){

	//Define URLSearchParams
	(function (w) {
    	w.URLSearchParams = w.URLSearchParams || function (searchString) {
        	var self = this;
        	self.searchString = searchString;
        	self.get = function (name) {
            	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(self.searchString);
            	if (results == null) {
                	return null;
            	}
            	else {
                	return decodeURI(results[1]) || 0;
            	}
        	};
					self.has = function (name) {
						var results = new RegExp('[\?&]' + name).exec(self.searchString);
						if (results == null) {
							return null;
						}
						else {
							return true;
						}
					}
    	}

		})(window)

		//Define remove function
		Element.prototype.remove = function() {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };

		//Define .children
	(function(constructor) {
  	if (constructor &&
    	constructor.prototype &&
    	constructor.prototype.children == null) {
    	Object.defineProperty(constructor.prototype, 'children', {
      	get: function() {
        	//let i = 0, node, nodes = this.childNodes, children = [];
					var i = 0;
					var node;
					var nodes = this.childNodes;
					var children = [];
        	while (node = nodes[i++]) {
          	if (node.nodeType === 1) {
            	children.push(node);
          	}
        	}
        	return children;
      	}
    	});
  	}
	})(window.Node || window.Element);
}

function createClone(element){
	var clone = isIE ? element.cloneNode(true) : element.content.cloneNode(true);
	if(isIE){
		clone.className = "";
	}
	return clone;
}


//Global vars
var filterParamName = "filter";
var maxShowcasePerRow = 3;
var urlParams = new URLSearchParams(window.location.search);
var temp_showcase = document.getElementsByTagName("template")[0];
var temp_section = document.getElementsByTagName("template")[1];
var temp_about = document.getElementsByTagName("template")[2];
var temp_content = document.getElementsByTagName("template")[3];



//Stuff for mobile devices
var clickElements = document.getElementsByClassName("img_container");
var selectedElement = null;
function setToMobile(){
	for(var i=0; i < clickElements.length; i++) {
		clickElements[i].addEventListener("click", info_show);
		clickElements[i].nextElementSibling.querySelector('.showcase_text').style.pointerEvents = "none";
	}
}

function info_show(event) {
	var clickedElement;

	if(event.target.nodeName == "DIV"){
		clickedElement = event.target.nextElementSibling.querySelector('.showcase_text');
	}
	else{
		clickedElement = event.target.parentElement.nextElementSibling.querySelector('.showcase_text');
	}

	clickedElement.style.pointerEvents = "";
	clickedElement.style.opacity = "1";

	if(selectedElement != null){
		selectedElement.style.pointerEvents = "none"
		selectedElement.style.opacity = "0"
	}
	selectedElement = clickedElement;
}

//Watch if there's any hover input device - if not we do the above code which changes it to click
var mobileQuery = window.matchMedia("(any-hover: none)");
function mobileCheck(x){
	if(x.matches){
		setToMobile();
	}
}

//Mobile hamburger menu
var ham_open = document.getElementById("nav_open");
function openSideBar(){
  document.getElementsByClassName('nav_outer')[0].classList.toggle("open");
  ham_open.classList.toggle("open");
}

//called when screen is scrolled past header
if(!isIE){
var observer = new IntersectionObserver(
  ([e]) => ham_open.classList.toggle("pinned", e.intersectionRatio < 1),
  { threshold: [1] }
);
observer.observe(document.getElementsByClassName("links")[0]);
}
//Template handling
//Open XML
var xhttp = new XMLHttpRequest();

xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
    xmlReady(this);
    }
};
xhttp.open("GET", "showcases.xml", true);
xhttp.send();
var xmlDoc;

//Clears all sections
function deleteAllSections(){
	//document.getElementById("content").innerHTML = "";
	var content = document.getElementById("content");
	var newContent = document.createElement("span");
	newContent.id = "content";
	content.parentNode.insertBefore(newContent, content.nextSibling);
	content.className = "oldcontent";
	content.id = "";
	content.style.maxHeight = (content.scrollHeight).toString() + "px";

	setTimeout(function(){ content.classList.add("anim"); }, 10);
	setTimeout(function(){ content.remove(); }, 510);
}

//Click event to transition between sections
function sectionClick(name){
	window.history.pushState({}, "filter", name);
	dealWithHash();
}

var lastSection = "";

//Creates an "emptyDiv" element for spacing
function createSpaceDiv(location){
		var emptyDiv = document.createElement("div");
		emptyDiv.className = "box_empty";
		location.appendChild(emptyDiv);
}

//Creates and displays a section from XML
function displaySection(name, onlyImportant){
	var section = xmlDoc.getElementsByTagName("root")[0].getElementsByTagName(name)[0];

	//Get showcase rows and template
	var rows = document.getElementsByClassName("showcase_row");
	var start = document.getElementById("content");


	//Add elements to document
	var showcase;
	if(onlyImportant){
		var showcase = section.querySelectorAll("showcase_important");
	}
	else{
		var showcase = section.querySelectorAll("showcase,showcase_important");
	}

	var outerdiv = document.createElement("div");
	outerdiv.className = "box_outer";
	outerdiv.id = section.tagName;

	outerdiv.appendChild(createClone(temp_section));
	var innerContent = start.appendChild(outerdiv);
	innerContent.getElementsByClassName("section_textlabel")[0].innerHTML = section.tagName;

  if(urlParams.has("s") && urlParams.get("s") > 0){
    innerContent.getElementsByClassName("section_showmore")[0].innerHTML = "";
  }
  else{
    if(urlParams.has(filterParamName)){
      innerContent.getElementsByClassName("section_showmore")[0].innerHTML = "Back";
      innerContent.getElementsByClassName("section_showmore")[0].addEventListener("click", function() { sectionClick("?"); }, false);
      lastSection = section.tagName;
	 }
	 else{
      innerContent.getElementsByClassName("section_showmore")[0].innerHTML = "Show All";
		  innerContent.getElementsByClassName("section_showmore")[0].addEventListener("click", function() { sectionClick("?" + filterParamName +"=" + section.tagName); }, false);
	 }
 }

	var row = 0;
	var currentRow = innerContent.getElementsByClassName("showcase_row")[0];
	for(var k=0; k < showcase.length; k++) {
		//Handle rows
		row += 1;
		if (row % (maxShowcasePerRow+1) == 0){
			row = 0;
			var div = document.createElement("div")
			div.className = "showcase_row";
			currentRow = innerContent.getElementsByClassName("box_content")[0].appendChild(div);
		}
		//Create showcase element
		var div = document.createElement("div");
		div.className = "showcase";
		div.appendChild(createClone(temp_showcase))
		var element = currentRow.appendChild(div);
		//Set image
		element.querySelector("img").src = showcase[k].getElementsByTagName("img")[0].childNodes[0].nodeValue;
		//Set title/description
		var labels = element.getElementsByTagName("p");
		labels[0].innerHTML = showcase[k].getElementsByTagName("title")[0].childNodes[0].nodeValue;
		labels[1].innerHTML = showcase[k].getElementsByTagName("desc")[0].childNodes[0].nodeValue;
		//Set link
		element.querySelector("a").href = showcase[k].getElementsByTagName("link")[0].childNodes[0].nodeValue;
	}

	createSpaceDiv(start);

	//if(lastSection != "" && section.tagName == lastSection){
	//	document.getElementById("content").querySelector("#" + lastSection).scrollIntoView({ behavior: "smooth"});
	//}

	mobileCheck(mobileQuery);
}

//Displays the "about" section
function displayAbout(){
	document.getElementById("content").appendChild(createClone(temp_about));
	createSpaceDiv(document.getElementById("content"));
}

//Displays the "contact" section
function displayContact(){
	document.getElementById("content").appendChild(createClone(temp_content));
	createSpaceDiv(document.getElementById("content"));
}

//Display all the sections with row limits - acts as "home page"
function displayAllSections(){
	var sections = xmlDoc.getElementsByTagName("root")[0].children;
	displayAbout();
	for(var i=0; i < sections.length; i++) {
		displaySection(sections[i].tagName, true);
	}
}


//When the url changes
function dealWithHash(){
	urlParams = new URLSearchParams(window.location.search);
	deleteAllSections();
	if(urlParams.has(filterParamName)){
    if(urlParams.get(filterParamName) == "Contact"){
      displayAbout();
      displayContact();
    }
    else{
		  var param = urlParams.get(filterParamName);
		  displaySection(param, false);
    }
	}
	else{
		displayAllSections();
	}
	if(lastSection != "" && !urlParams.has("s")){
		document.getElementById("content").querySelector("#" + lastSection).scrollIntoView({ behavior: "smooth"});
	}
}

//Called when the XML is ready
function xmlReady(xml, limit) {
  xmlDoc = xml.responseXML;
	var sections = xmlDoc.getElementsByTagName("root")[0].children;
	//Add elements to document
	dealWithHash();
	mobileQuery.addListener(mobileCheck);
}

//If the user goes back/forward, the hash might change
window.addEventListener('popstate', function(event) {
	dealWithHash();
}, false);
