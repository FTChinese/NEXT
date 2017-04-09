var hideEles = document.querySelectorAll('audio,.site-map,.story-theme,.header-container,.overlay-container,.o-nav__placeholder,.story-action-placeholder');
for (var h=0; h<hideEles.length; h++) {
	hideEles[h].style.display = 'none';
}
document.body.style.marginTop = '20px';