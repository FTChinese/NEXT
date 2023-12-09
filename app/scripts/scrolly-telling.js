(function(){
    function initScrollyTelling() {
        var scrollableBlocks = document.querySelectorAll('.scrollable-block');
        if (!scrollableBlocks) {return;}
        var toggleOverlayOn = false;
        for (var i = 0; i < scrollableBlocks.length; i++) {
            var scrollableBlock = scrollableBlocks[i];
            var scrollableSections = scrollableBlock.querySelectorAll('scrollable-section, .scrollable-section');
            var viewPort = document.createElement('DIV');
            viewPort.classList.add('scrolly-telling-viewport');
            var scrollableSection;
            for (var j = 0; j < scrollableSections.length; j++) {
                scrollableSection = scrollableSections[j];
                scrollableSection.style.display = 'none';
                var figure = scrollableSection.querySelector('figure, picture');
                if (figure) {
                    figure.setAttribute('data-id', j);
                    if (j === 0) {figure.classList.add('visible');}
                    viewPort.appendChild(figure);
                }
            }
            scrollableBlock.appendChild(viewPort);
            for (var k = 0; k < scrollableSections.length; k++) {
                scrollableSection = scrollableSections[k];
                var scrollableSectionText = (scrollableSection.innerText || '').trim().replace(/[\r\n]+/, '<br>');
                var scrollTextEles = scrollableSection.querySelectorAll('scrollable-text');
                if (scrollTextEles.length === 0) {
                    var scrollTextEleNew = document.createElement('DIV');
                    scrollTextEleNew.innerHTML = scrollableSectionText;
                    scrollTextEles = [scrollTextEleNew];
                }
                var scrollTextHTML = '';
                for (var scrollTextEle of scrollTextEles) {
                    scrollTextHTML = scrollTextEle.innerHTML;
                    var scrollTextSlideIndex = k;
                    if (scrollTextHTML !== '') {
                        var scrollTextBlock = document.createElement('DIV');
                        scrollTextBlock.classList.add('scrollable-slide-info');
                        if (/strong/gi.test(scrollTextHTML)) {
                            scrollTextBlock.classList.add('scrollable-slide-detail');
                            scrollTextBlock.classList.add('scrollable-slide-overlay');
                        } else {
                            if (toggleOverlayOn) {
                                scrollTextBlock.classList.add('scrollable-slide-overlay');
                            }
                            toggleOverlayOn = !toggleOverlayOn;
                        }
                        scrollTextBlock.setAttribute('data-id', k);
                        scrollTextBlock.innerHTML = scrollTextHTML;
                        scrollableBlock.appendChild(scrollTextBlock);
                        scrollTextSlideIndex = Math.min(k + 1, scrollableSections.length - 1);
                    }
                    var scrollTextSlide = document.createElement('DIV');
                    scrollTextSlide.classList.add('scrollable-slide');
                    scrollTextSlide.setAttribute('data-id', scrollTextSlideIndex);
                    scrollableBlock.appendChild(scrollTextSlide);
                }
                // MARK: - Add the last scroll slide so that the last image will have longer scrolling distance
                if (k === scrollableSections.length - 1 && scrollTextHTML === '') {
                    var lastScrollTextSlide = document.createElement('DIV');
                    lastScrollTextSlide.classList.add('scrollable-slide');
                    lastScrollTextSlide.setAttribute('data-id', k);
                    scrollableBlock.appendChild(lastScrollTextSlide);
                }
            }
        }
    }
    initScrollyTelling();
})();