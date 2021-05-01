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

//More IE support - use other scripts if we're not in IE
//if (!isIE){
//  var script = document.createElement('script');
//  script.src = "/menu_dropshadow.js";
//  document.getElementsByTagName("body")[0].insertBefore(script, document.getElementsByTagName("script")[0]);
//}

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
	//content.style.maxHeight = (content.scrollHeight).toString() + "px";
	content.classList.add("anim");
	setTimeout(function(){ content.remove(); }, 300);
}

//Click event to transition between sections
function sectionClick(name){
	window.history.pushState({}, "filter", name);
	dealWithHash();
}



//Creates an "emptyDiv" element for spacing
function createSpaceDiv(location){
		var emptyDiv = document.createElement("div");
		emptyDiv.className = "box_empty";
		location.appendChild(emptyDiv);
}

//Creates and displays a section from XML
function displaySection(name, onlyImportant){
	var section = xmlDoc.getElementsByTagName("root")[0].getElementsByTagName(name)[0];

	//Get showcase rows and content span
	var rows = document.getElementsByClassName("showcase_row");
	var start = document.getElementById("content");


	//Add elements to document
	var showcase;
	if(onlyImportant){
		showcase = section.querySelectorAll("showcase_important");
	}
	else{
		showcase = section.querySelectorAll("showcase,showcase_important");
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
			//var div = document.createElement("div")
			//div.className = "showcase_row";
			//currentRow = innerContent.getElementsByClassName("box_content")[0].appendChild(div);
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

	mobileCheck(mobileQuery);
}

//Displays the "about" section
function displayAbout(){
	document.getElementById("content").appendChild(createClone(temp_about));
	createSpaceDiv(document.getElementById("content"));
}


//Display all the sections with row limits - acts as "home page"
function displayAllSections(){
	var sections = xmlDoc.getElementsByTagName("root")[0].children;
	//displayAbout();
	for(var i=0; i < sections.length; i++) {
		displaySection(sections[i].tagName, true);
	}
}


//When the url changes
function dealWithHash(){
	urlParams = new URLSearchParams(window.location.search);
	deleteAllSections();
	if(urlParams.has(filterParamName)){
    if(urlParams.get(filterParamName) == "About"){
      displayAbout();
    }
    else{
		  var param = urlParams.get(filterParamName);
		  displaySection(param, false);
    }
	}
	else{
		displayAllSections();
	}
	window.scrollTo({ top: 0, behavior: 'smooth' })
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
