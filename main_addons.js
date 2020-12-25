//For IE support, all new fancy stuff is put into this script
//It will only be used if the browser isn't internet explorer.
//And if you're readying this please don't use Internet Explorer. please.

//called when screen is scrolled past header
var observer = new IntersectionObserver(
  ([e]) => ham_open.classList.toggle("pinned", e.intersectionRatio < 1),
  { threshold: [1] }
);
observer.observe(document.getElementsByClassName("links")[0]);
