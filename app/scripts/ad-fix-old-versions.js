// MARK: - Google upgraded the gpt.js with breaking change and doesn't allow old versions to work. Use this to reverse-engineer the page to reload all ads. 
(function() {
    function loadScript(url, callback) {
        var timeStamp = window.timeStamp || 'v001';
        var script = document.createElement('script');
        script.type = 'text/javascript';
    
        // If the script loads successfully, execute the callback
        script.onload = function() {
            if (callback) {callback();}
        };
    
        // Handle errors in loading the script
        script.onerror = function() {
            console.error('Script load failed: ' + url);
        };
        
        script.src = url + '?' + timeStamp;
        document.head.appendChild(script);
    }
    
    // Function to load the first script and then the second
    function loadScriptsSequentially() {
        loadScript('https://d2785ji6wtdqx8.cloudfront.net/js/gpt.js', function() {
            window.adCodeLoaded = false;
            // MARK: - This is a key step to destroy Google's blockage on ad display
            window.googletag = undefined;
            loadScript('https://d2785ji6wtdqx8.cloudfront.net/n/ad-polyfill.js', function() {
            });
        });
    }
    
    // Load the scripts when the window loads
    loadScriptsSequentially();
})();

