
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
	//clickedElement.style.opacity = "1";

	if(selectedElement != null){
		selectedElement.style.pointerEvents = "none"
		//selectedElement.style.opacity = "0"
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
  document.getElementById('nav_outer').classList.toggle("open");
  ham_open.classList.toggle("open");
}
