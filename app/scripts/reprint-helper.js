(function(){
    if (!window.userId) {return;}
    window.isReprint = true;
    var reprintButton = document.createElement('button');
    reprintButton.innerHTML = '复制';
    reprintButton.className = 'button-reprint';
    var s = reprintButton.style;
    s.position = 'fixed';
    s.bottom = '15px';
    s.right = '15px';
    s.width = '60px';
    s.height = '60px';
    s.borderRadius = '30px';
    s.backgroundColor = '#9E2F50';
    s.color = 'white';
    var reprintTextArea = document.createElement('textarea');
    reprintTextArea.style.display = 'none';
    reprintButton.onclick = function() {
        var storyHeadline = document.querySelector('.story-headline').innerText;
        var storyBody = document.querySelector('#story-body-container').innerText;
        reprintTextArea.value = storyHeadline + '\n\n' + storyBody;
        reprintTextArea.style.display = 'block';
        reprintTextArea.select();
        reprintTextArea.setSelectionRange(0, 99999);
        document.execCommand('copy');
        reprintTextArea.style.display = 'none';
        var el = window.userId || 'unknown';
        var ea = window.ftItemId || 'unknown';
        var parameters = {'send_page_view': false};
        gtag('config', window.gaMeasurementId, parameters);
        gtag('event', ea, {'event_label': el, 'event_category': 'Reprint'});
    };
    document.body.append(reprintButton);
    document.body.append(reprintTextArea);
})();