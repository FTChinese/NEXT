// Global Constants
const key = 'my-ft-follow';
const last_sync_time_key = 'last_sync_time';

// follow and unfollow topic

// click events
try {
    if (typeof delegate === 'undefined') { 
        window.delegate = new Delegate(document.body);
    }

    delegate.on('click', '.myft-follow', async function () {
        const isFollowed = !this.classList.contains('plus');

        const dataTag = this.getAttribute('data-tag') || '';
        const dataType = this.getAttribute('data-type') || 'tag';
        if (!dataTag) {
            alert('亲爱的读者，我们无法识别您关注的标签，请您刷新页面重新试试。');
            return;
        }

        // Update local storage immediately
        const savedFollowList = localStorage.getItem(key);
        let savedFollowListJSON = JSON.parse(savedFollowList) || {};

        if (!Array.isArray(savedFollowListJSON[dataType])) {
            savedFollowListJSON[dataType] = [];
        }

        const savedTagsSet = new Set(savedFollowListJSON[dataType]);

        if (isFollowed) {
            savedTagsSet.delete(dataTag);
        } else {
            savedTagsSet.add(dataTag);
        }

        savedFollowListJSON[dataType] = [...savedTagsSet];
        localStorage.setItem(key, JSON.stringify(savedFollowListJSON));

        // Optimistically update UI immediately
        if (isFollowed) {
            this.classList.add('plus');
            this.classList.remove('tick');
            this.innerHTML = '关注';
        } else {
            this.classList.remove('plus');
            this.classList.add('tick');
            this.innerHTML = '已关注';
        }

        // Send follow/unfollow request to the server in the background
        if (hasLoggedIn()) {
            try {
                const action = isFollowed ? 'unfollow' : 'follow';
                const url = `/myft_follow`;
                const payload = { type: dataType, name: dataTag, action };
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    console.warn('Server failed to process follow/unfollow action:', await response.text());
                }
            } catch (err) {
                console.error(`MyFT follow error: `, err);
            }
        }

        // Sync follows after the update
        await checkFollow();
    });

} catch (ignore) {}

function hasLoggedIn() {
    return typeof GetCookie('subscription_type') === 'string';
}

function timeToSync() {
    try {
        const last_sync_unix_time_stamp_string = localStorage.getItem(last_sync_time_key);
        if (!last_sync_unix_time_stamp_string) {
            return true; // Sync if there's no recorded sync time
        }

        const last_sync_unix_time_stamp = parseInt(last_sync_unix_time_stamp_string, 10);
        return new Date().getTime() - last_sync_unix_time_stamp > 3 * 60 * 1000;
    } catch (ignore) {
        return true; // Default to true if an error occurs
    }
}

async function syncLocalFollowsWithServer() {
    try {
        const savedFollowList = localStorage.getItem(key);
        const savedFollowListJSON = JSON.parse(savedFollowList) || {};

        if (!savedFollowListJSON || Object.keys(savedFollowListJSON).length === 0) {
            return;
        }

        // Send the local follows to the server for syncing
        const response = await fetch('/sync_myft_follows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(savedFollowListJSON),
        });

        if (response.ok) {
            console.log('Local follows synced successfully');
            localStorage.setItem(last_sync_time_key, new Date().getTime()); // Update only if sync is successful
        } else {
            console.warn('Failed to sync follows:', await response.text());
        }
    } catch (err) {
        console.error(`Sync follow error: `, err);
    }
}

async function checkFollow() {
    let savedFollowListJSON = JSON.parse(localStorage.getItem(key)) || {};

    if (hasLoggedIn() && timeToSync()) {
        try {
            await syncLocalFollowsWithServer(); // Ensure local follows are synced first.
            const response = await fetch('/get_myft_follows');
            if (response.ok) {
                const serverData = await response.json();

                if (serverData && typeof serverData === 'object') {
                    savedFollowListJSON = serverData; // Only use valid server data
                    console.log('Using server follow data:', savedFollowListJSON);
                }
            } else {
                console.warn('Failed to fetch follows from server, falling back to local storage.');
            }
        } catch (err) {
            console.error(`check follow error: `, err);
        }
    }

    // Update UI based on final follow data (server preferred, local fallback)
    const followButtons = document.querySelectorAll('button.myft-follow');

    for (const btn of followButtons) {
        const dataType = btn.getAttribute('data-type');
        let dataTag = btn.getAttribute('data-tag');

        if (dataTag.includes('%')) {
            dataTag = decodeURIComponent(dataTag);
            btn.setAttribute('data-tag', dataTag);
        }

        if (!Array.isArray(savedFollowListJSON[dataType])) {
            continue;
        }

        if (savedFollowListJSON[dataType].includes(dataTag)) {
            btn.innerHTML = '已关注';
            btn.classList.remove('plus');
            btn.classList.add('tick');
        } else {
            btn.innerHTML = '关注';
            btn.classList.remove('tick');
            btn.classList.add('plus');
        }
    }
}

checkFollow();
