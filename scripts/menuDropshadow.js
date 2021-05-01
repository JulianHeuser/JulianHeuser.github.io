//For IE support, all new fancy stuff is put into this script
//It will only be used if the browser isn't internet explorer.
//And if you're readying this please don't use Internet Explorer. please.

//Detect if screen is scrolled past header


var ham_open = document.getElementById("nav_open");
var observer = new IntersectionObserver(
  function([e]){ ham_open.classList.toggle("pinned", e.intersectionRatio < 1);
  document.getElementById("nav_outer").classList.toggle("pinned", e.intersectionRatio < 1);},
  { threshold: [1] }
);
observer.observe(document.getElementsByClassName("links")[0]);
