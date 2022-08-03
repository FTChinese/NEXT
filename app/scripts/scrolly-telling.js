(function(){
    function initScrollyTelling() {
        var scrollableBlocks = document.querySelectorAll('scrollable-block');
        for (var i = 0; i < scrollableBlocks.length; i++) {
            var scrollableBlock = scrollableBlocks[i];
            console.log(scrollableBlock.innerHTML);
            console.log('--------------------');
            // var scrollableSections = scrollableBlock.querySelectorAll('scrollable-section');
            // console.log(scrollableSections.length);
            // for (var j = 0; j < scrollableSections.length; j++) {
            //     console.log(j);
            // }
        }
    }
    initScrollyTelling()
})();