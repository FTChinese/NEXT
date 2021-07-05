(function(){
    function isMSIE() {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf('MSIE ');
        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
            return true;
        }
        return false;
    }
    if (isMSIE() === false) {return;}
    var gridContainers = document.querySelectorAll('.card-grid');
    for (var j=0; j<gridContainers.length; j++) {
        var itemContainers = gridContainers[j].querySelectorAll('.item-container');
        gridContainers[j].style.display = 'block';
        for (var i=0; i<itemContainers.length; i++) {
            var container = itemContainers[i];
            container.classList.add('XL4', 'L4', 'M6', 'S6', 'P12');
            if (i === 0) {continue;}
            var clearFloatClasses = [];
            if (i % 3 === 0) {
                clearFloatClasses.push('XLT');
                clearFloatClasses.push('LT');
            }
            if (i % 2 === 0) {
                clearFloatClasses.push('MT');
                clearFloatClasses.push('ST');
            }
            clearFloatClasses.push('PT');
            var line = document.createElement('DIV');
            line.className = clearFloatClasses.join(' ');
            gridContainers[j].insertBefore(line, container);
        }
    }
})();