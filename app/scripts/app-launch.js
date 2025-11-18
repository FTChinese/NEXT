

/* global URL */
// MARK: - We only need this to work for modern mobile devices. 
(async()=>{

    let displaySeconds = 5;
    const maxWidthToDisplay = 490;
    const launchScheduleStorageKey = 'ftc:webLaunchSchedule';
    const supportedCreativeExtensions = /\.(jpg|jpeg|png|gif)$/i; // Add |mp4 when re-enabling video assets
    const LOG_PREFIX = '[launch-ad]';

    function log() {
        const args = Array.prototype.slice.call(arguments);
        args.unshift(LOG_PREFIX);
        console.log.apply(console, args);
    }

    function logError(context, err) {
        console.error(LOG_PREFIX, context, err);
    }

    let launchScreen = document.getElementById('app-launch-screen');


    // Our ads always use Beijing time
    function calcYMD(d, offset, showTime = false) {
        var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        var dateObject = new Date(utc + (3600000*offset));

        // Get the year, month, and day
        const year = dateObject.getFullYear();
        const month = String(dateObject.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
        const day = String(dateObject.getDate()).padStart(2, '0');

        const hour = String(dateObject.getHours()).padStart(2, '0');
        const minute = String(dateObject.getMinutes()).padStart(2, '0');

        const timeString = showTime ? ` ${hour}:${minute}` : '';
        // Return the formatted string
        return `${year}-${month}-${day}${timeString}`;
    }


    async function checkWebLaunchAd() {

        try {
            log('checkWebLaunchAd start');

            if (!isStandalone()) {
                log('Skipping launch ad because display mode is not standalone.');
                closeLaunchScreenSafely(true);
                return;
            }

            const w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            if (w > maxWidthToDisplay) {
                log('Skipping launch ad because width exceeds limit:', w);
                return;
            }


            const cachedCreatives = getCachedLaunchSchedule();
            const creative = Array.isArray(cachedCreatives) ? pickoutCreative(cachedCreatives) : null;
            if (creative) {
                log('Rendering cached creative:', creative.fileName);
                await renderCreative(creative);
            }

            // Refresh schedule/assets in background so next launch is instant.
            const hostname = window.location.hostname;
            const isOnFrontendOnlyNextProject = hostname === 'localhost' && /^\/app\.html/.test(window.location.pathname);
            const url = isOnFrontendOnlyNextProject ? '/api/page/weblaunchschedule.json' : '/api/applaunchschedule';
            log('Using launch schedule endpoint:', url);
            refreshLaunchSchedule(url);

        } catch(err) {
            logError('checkWebLaunchAd failed', err);
        }

    }

    function getCachedLaunchSchedule() {
        if (typeof localStorage === 'undefined') {return null;}
        try {
            const payload = localStorage.getItem(launchScheduleStorageKey);
            if (!payload) {
                log('No cached launch schedule found.');
                return null;
            }
            const parsed = JSON.parse(payload);
            if (parsed && Array.isArray(parsed.creatives)) {
                log('Loaded cached launch schedule entries:', parsed.creatives.length);
                return parsed.creatives;
            }
            log('Cached launch schedule malformed, ignoring.');
            return null;
        } catch (err) {
            logError('getCachedLaunchSchedule failed', err);
            return null;
        }
    }

    async function saveLaunchSchedule(creatives) {
        if (!Array.isArray(creatives) || typeof localStorage === 'undefined') {
            log('saveLaunchSchedule skipped: invalid creatives list or localStorage unavailable.');
            return;
        }
        try {
            log('saveLaunchSchedule invoked with count:', creatives.length);
            const upcomingCreatives = filterUpcomingCreatives(creatives);
            log('Upcoming creatives after filtering:', upcomingCreatives.length);
            const keptCreatives = [];

            for (const creative of upcomingCreatives) {
                log('Ensuring remote asset is reachable for creative:', creative.fileName);
                const ok = await ensureCreativeAsset(creative);
                if (!ok) {
                    log('Skipping creative due to unreachable asset:', creative.fileName);
                    continue;
                }
                keptCreatives.push(creative);
            }

            if (!keptCreatives.length) {
                log('No creatives kept after validation; clearing stored schedule.');
                localStorage.removeItem(launchScheduleStorageKey);
                return;
            }

            localStorage.setItem(launchScheduleStorageKey, JSON.stringify({
                creatives: keptCreatives,
                updatedAt: Date.now()
            }));
            log('Saved launch schedule with creatives:', keptCreatives.length);
        } catch (err) {
            logError('saveLaunchSchedule failed', err);
        }
    }

    async function refreshLaunchSchedule(url) {
        if (!url) {return;}
        try {
            log('Refreshing launch schedule from:', url);
            const response = await fetch(url);
            if (!response.ok) {
                log('Launch schedule refresh skipped due to non-OK response:', response.status);
                return;
            }
            const creatives = await response.json();
            await saveLaunchSchedule(creatives);
            log('Launch schedule refresh complete.');
        } catch (err) {
            logError('refreshLaunchSchedule failed', err);
        }
    }

    function pickoutCreative(creatives) {
        if (creatives.length === 0) {return null;}
        const priorityOrder = ['sponsorship', 'standard', 'house'];
        const ymd = calcYMD(new Date(), 8).slice(0, 10).replace(/-/g, '');

        let sortedCreatives = creatives
            .filter(x=>{
                const fileName = x?.fileName ?? '';
                const dates = x?.dates ?? '';
                const isSupportedFile = supportedCreativeExtensions.test(fileName);
                const isScheduledForToday = dates.includes(ymd);
                return isSupportedFile && isScheduledForToday;
            })
            .sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority));

        // console.log(`sortedCreatives: `, sortedCreatives);

        if (sortedCreatives.length === 0) {
            log('No creatives scheduled for today.');
            return null;
        } 
    
        let highestPriorityCreatives = sortedCreatives.filter(c => c.priority === sortedCreatives[0].priority);
        if (highestPriorityCreatives.length === 1) {
            log('Selected single creative:', highestPriorityCreatives[0].fileName);
            return highestPriorityCreatives[0];
        }
        let totalWeight = highestPriorityCreatives.reduce((acc, c) => acc + parseInt(c.weight), 0);
        let randomNum = Math.floor(Math.random() * totalWeight);
        for (let c of highestPriorityCreatives) {
            randomNum -= parseInt(c.weight);
            if (randomNum < 0) {
                log('Selected weighted creative:', c.fileName);
                return c;
            }
        }
    }


    async function renderCreative(creative) {
        if (!creative) {return;}
        const assetUrl = creative?.fileName ? toAbsoluteAssetUrl(creative.fileName) : '';
        if (!assetUrl) {
            log('Unable to render creative because cached asset is missing:', creative?.fileName);
            closeLaunchScreenSafely(true);
            return;
        }
        log('Rendering creative asset:', creative.fileName, assetUrl);
        let closeTimer;
        let hasClosed = false;
        const closeAd = () => {
            if (hasClosed) {return;}
            hasClosed = true;
            log('Closing launch ad view for:', creative.fileName);
            if (closeTimer) {clearTimeout(closeTimer);}
            closeLaunchScreenSafely(true);
        };
    
        log('continue rendering...');

        launchScreen.classList.add('is-showing-ad');
        launchScreen.innerHTML = '';
    
    
        // Determine if the creative is a video or an image
        if (creative.fileName.endsWith('.mp4')) {
            const video = document.createElement('video');
            video.src = assetUrl;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'contain'; // Ensure the video is contained within the container without losing its aspect ratio
            video.autoplay = true;
            video.controls = true; // Optionally, add controls
            video.muted = true; // Play the video silently
            launchScreen?.appendChild(video);

            const videoLink = document.createElement('a');
            videoLink.href = creative.click || '#'; // The URL you want to navigate to on click
            videoLink.target = '_blank';
            videoLink.style.position = 'absolute';
            videoLink.style.display = 'block';
            videoLink.style.top = 0;
            videoLink.style.left = 0;
            videoLink.style.right = 0;
            videoLink.style.bottom = '50px';
            launchScreen?.appendChild(videoLink);

        } else {
            const adLink = document.createElement('a');
            adLink.style.backgroundColor = 'black';
            adLink.style.backgroundImage = `url(${assetUrl})`;
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
    
            launchScreen?.appendChild(adLink);
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
        closeButton.onclick = closeAd;
    
        launchScreen?.appendChild(closeButton);
    
        ['impression_1', 'impression_2', 'impression_3'].forEach(key => {
            if (creative[key]) {
                fireTrackingPixel(creative[key]);
            }
        });
    
        closeTimer = setTimeout(closeAd, displaySeconds * 1000);
    }
    
    function filterUpcomingCreatives(creatives) {
        if (!Array.isArray(creatives)) {return [];}
        const today = parseInt(calcYMD(new Date(), 8).slice(0, 10).replace(/-/g, ''), 10);
        const filtered = [];
        for (const item of creatives) {
            if (!item) {continue;}
            const dates = parseScheduleDates(item.dates);
            const hasFutureDate = dates.some(date => date >= today);
            if (!hasFutureDate) {continue;}
            const sanitized = {...item};
            delete sanitized.note;
            delete sanitized.fileNames;
            delete sanitized.title;
            filtered.push(sanitized);
        }
        return filtered;
    }

    function parseScheduleDates(dates) {
        if (!dates) {return [];}
        return dates
            .split(',')
            .map(part => parseInt(part.trim(), 10))
            .filter(num => !isNaN(num));
    }

    function toAbsoluteAssetUrl(fileName) {
        if (!fileName) {
            log('Missing fileName for creative asset.');
            return '';
        }
        try {
            return new URL(fileName, window.location.origin).href;
        } catch (err) {
            logError('Failed to create absolute asset URL', err);
            return '';
        }
    }

    function normalizeTrackingUrl(rawSrc) {
        try {
            const urlObj = new URL(rawSrc, window.location.origin);
            if (urlObj.origin === window.location.origin) {
                return urlObj.pathname + urlObj.search;
            }
            return urlObj.pathname + urlObj.search;
        } catch (err) {
            logError('normalizeTrackingUrl failed', err);
            return rawSrc;
        }
    }

    function fireTrackingPixel(rawSrc) {
        const relativeUrl = normalizeTrackingUrl(rawSrc);
        try {
            const connector = (relativeUrl.indexOf('?')>=0) ? '&' : '?';
            const trackingUrl = `${relativeUrl}${connector}ftwebtime=${new Date().getTime()}`;
            if (typeof fetch === 'function') {
                fetch(trackingUrl, {
                    method: 'GET',
                    mode: 'no-cors',
                    credentials: 'omit',
                    keepalive: true
                }).then(() => {
                    log('Fired tracking pixel via fetch:', trackingUrl);
                }).catch(err => {
                    logError('Tracking pixel fetch failed', err);
                });
                return;
            }
            const img = new Image();
            img.referrerPolicy = 'no-referrer';
            img.style.display = 'none';
            img.src = trackingUrl;
            log('Fired tracking pixel via image fallback:', trackingUrl);
        } catch (err) {
            logError('fireTrackingPixel failed', err);
        }
    }

    function prefetchRemoteAsset(assetUrl, isVideoAsset) {
        return new Promise((resolve, reject) => {
            let cancelDownload = null;
            const timeout = setTimeout(() => {
                if (cancelDownload) {cancelDownload();}
                reject(new Error('Asset preload timed out'));
            }, 15000);

            function finish(err) {
                clearTimeout(timeout);
                if (cancelDownload) {
                    cancelDownload();
                    cancelDownload = null;
                }
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }

            if (isVideoAsset) {
                const video = document.createElement('video');
                video.preload = 'auto';
                video.muted = true;
                video.playsInline = true;
                cancelDownload = () => {
                    video.pause();
                    video.removeAttribute('src');
                    video.load();
                };
                const onLoaded = () => {
                    finish();
                };
                const onError = () => {
                    const mediaError = video.error && video.error.code ? new Error('Video preload failed (' + video.error.code + ')') : new Error('Video preload failed');
                    finish(mediaError);
                };
                video.addEventListener('loadeddata', onLoaded, { once: true });
                video.addEventListener('error', onError, { once: true });
                video.src = assetUrl;
                video.load();
                return;
            }

            const img = new Image();
            img.decoding = 'async';
            img.loading = 'eager';
            cancelDownload = () => {
                img.src = '';
            };
            const onImgLoad = () => {
                finish();
            };
            const onImgError = () => {
                finish(new Error('Image preload failed'));
            };
            img.addEventListener('load', onImgLoad, { once: true });
            img.addEventListener('error', onImgError, { once: true });
            img.src = assetUrl;
        });
    }

    async function ensureCreativeAsset(creative) {
        const assetUrl = toAbsoluteAssetUrl(creative?.fileName);
        if (!assetUrl) {return false;}
        const isVideoAsset = /\.mp4$/i.test(assetUrl);
        try {
            await prefetchRemoteAsset(assetUrl, isVideoAsset);
            log('Prefetched remote launch asset:', assetUrl);
            return true;
        } catch (err) {
            logError('ensureCreativeAsset remote preload failed for ' + assetUrl, err);
            return false;
        }
    }

    
    await checkWebLaunchAd();
})();
