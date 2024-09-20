
/* jshint ignore:start */

// MARK: - We only need this to work for modern mobile devices. And this file is alway requested async and not depended by any other process. So I'll use async/await and fetch without needing the jshint, which validates other codes that do need to be backward-compatible. 
(async()=>{

    const maxHours = 6;
    let displaySeconds = 5;
    const maxWidthToDisplay = 490;

    async function checkWebLaunchAd() {

        try {

            if (/dsa/.test(window.location.href)) {
                return;    
            }
            const w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            if (w > maxWidthToDisplay) {return;}
            const hostname = window.location.hostname;
            const url = (hostname === 'localhost') ? '/api/page/weblaunchschedule.json' : '/index.php/jsapi/weblaunchschedule';
            const response = await fetch(url);
            if ((!response.ok)) {return;}
            const creatives = await response.json();

            const creative = pickoutCreative(creatives);
            renderCreative(creative);

        } catch(err) {
            console.log(err);
        }

    }

    function pickoutCreative(creatives) {
        if (creatives.length === 0) {return null};
    
        const priorityOrder = ["sponsorship", "standard", "house"];
        let sortedCreatives = creatives
            .filter(x=>{
                const fileName = x.fileName || '';
                return /\.(jpg|jpeg|png|gif|mp4)$/gi.test(fileName);
            })
            .sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority));

        // console.log(sortedCreatives);
    
        let highestPriorityCreatives = sortedCreatives.filter(c => c.priority === sortedCreatives[0].priority);
        if (highestPriorityCreatives.length === 1) {
            return highestPriorityCreatives[0];
        }
        let totalWeight = highestPriorityCreatives.reduce((acc, c) => acc + parseInt(c.weight), 0);
        let randomNum = Math.floor(Math.random() * totalWeight);
        for (let c of highestPriorityCreatives) {
            randomNum -= parseInt(c.weight);
            if (randomNum < 0) {return c};
        }
    }


    function renderCreative(creative) {
        if (!creative) {return;}
        
        const webLaunchAdTime = getCookie('webLaunchAdTime');
        const currentTime = new Date().getTime();
    
        if (webLaunchAdTime) {
            const hoursDiff = (currentTime - webLaunchAdTime) / (1000 * 60 * 60);
            if (hoursDiff < maxHours) return;
        }
        setCookie('webLaunchAdTime', currentTime);
    
        const adDiv = document.createElement('DIV');
        adDiv.style.position = 'fixed';
        adDiv.style.top = '0';
        adDiv.style.left = '0';
        adDiv.style.width = '100%';
        adDiv.style.height = '100%';
        adDiv.style.zIndex = '9999999';
        adDiv.style.display = 'block';
        adDiv.style.background = 'black';
    
        // Determine if the creative is a video or an image
        if (creative.fileName.endsWith('.mp4')) {
            const video = document.createElement('video');
            video.src = creative.fileName;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'contain'; // Ensure the video is contained within the container without losing its aspect ratio
            video.autoplay = true;
            video.controls = true; // Optionally, add controls
            video.muted = true; // Play the video silently
            adDiv.appendChild(video);

            const videoLink = document.createElement('a');
            videoLink.href = creative.click || '#'; // The URL you want to navigate to on click
            videoLink.target = '_blank';
            videoLink.style.position = 'absolute';
            videoLink.style.display = 'block';
            videoLink.style.top = 0;
            videoLink.style.left = 0;
            videoLink.style.right = 0;
            videoLink.style.bottom = '50px';
            adDiv.appendChild(videoLink);

        } else {
            const adLink = document.createElement('a');
            adLink.style.backgroundColor = 'black';
            adLink.style.backgroundImage = `url(${creative.fileName})`;
            adLink.style.backgroundPosition = 'center';
            adLink.style.backgroundSize = 'contain';
            adLink.style.backgroundRepeat = 'no-repeat';
            adLink.style.width = '100%';
            adLink.style.height = '100%';
            adLink.style.display = 'block';
            adLink.target = '_blank';
    
            const click = creative.click || '';
            if (click !== '') {
                adLink.href = click;
            }
    
            adDiv.appendChild(adLink);
        }
    
        const closeButton = document.createElement('button');
        closeButton.textContent = 'X';
        closeButton.style.fontFamily = 'Arial';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.backgroundColor = 'transparent';
        closeButton.style.color = 'white';
        closeButton.style.fontSize = '32px';
        closeButton.onclick = () => adDiv.remove();
    
        adDiv.appendChild(closeButton);
        document.body.appendChild(adDiv);
    
        ['impression_1', 'impression_2', 'impression_3'].forEach(key => {
            if (creative[key]) {
                const img = new Image();
                const src = creative[key];
                const connector = (src.indexOf('?')>=0) ? '&' : '?';
                img.src = `${src}${connector}ftwebtime=${new Date().getTime()}`;
                img.style.display = 'none'; // Changed to 'none' to ensure these tracking images don't affect layout
                // document.body.appendChild(img); // This line remains commented as before
                console.log(img.src);
            }
        });
    
        setTimeout(() => adDiv.remove(), displaySeconds * 1000);
    }
    
    
    function setCookie(name, value) {
        const date = new Date();
        date.setTime(date.getTime() + (maxHours * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }
    
    function getCookie(name) {
        const value = "; " + document.cookie;
        const parts = value.split("; " + name + "=");
        if (parts.length === 2) return parts.pop().split(";").shift();
    }
    
    await checkWebLaunchAd();
})();

/* jshint ignore:end */