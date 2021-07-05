document.addEventListener('DOMContentLoaded', function(){
    var toogleTitles = document.querySelectorAll('.toggle-title');
    for (var i=0; i<toogleTitles.length; i++) {
        var title = toogleTitles[i];
        title.onclick = function() {
            var currentTitle = this.innerHTML;
            var newTitle = this.getAttribute('data-hide-text') || '';
            this.innerHTML = newTitle;
            this.setAttribute('data-hide-text', currentTitle);
            this.parentNode.classList.toggle('on');
        };
    }
});