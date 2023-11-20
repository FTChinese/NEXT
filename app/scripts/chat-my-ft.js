/* jshint ignore:start */

const populars = ['China', 'Companies', 'Markets', 'Opinion', 'Podcasts', 'Videos', 'Life & Arts', 'Work & Careers', 'Artificial Intelligence', 'Technology Sector'];
const regions = ['China', 'United States', 'United Kingdom', 'Europe', 'Asia', 'America', 'Africa', 'Middle East'];

// function getMyPreference() {
//     let myPreference = {};
//     const myPreferenceString = localStorage.getItem('preference');
//     if (myPreferenceString && myPreferenceString !== '') {
//         try {
//             myPreference = JSON.parse(myPreferenceString);
//         } catch(ignore) {}
//     }
//     return myPreference;
// }

function createHTMLFromNames(names) {
    const myPreference = getMyPreference();
    const myInterests = myPreference[myInterestsKey] || [];
    return names
    .map(name=>{
        let buttonClass = 'plus';
        let buttonHTML = localize('Follow');
        if (myInterests.indexOf(name)>=0) {
            buttonClass = 'tick';
            buttonHTML = localize('Unfollow');
        }
        return `
        <div class="input-container">
            <div class="input-name">${localize(name)}</div>
            <button class="myft-follow ${buttonClass}" data-action="add-interest" data-name="${name}">${buttonHTML}</button>
        </div>`;
    })
    .join('');
}

delegate.on('click', '[data-action="add-interests"]', async (event) => {
    const ele = document.createElement('DIV');
    ele.classList.add('overlay-container');
    ele.classList.add('on');
    ele.innerHTML = `
    <div class="overlay-inner">
    <div class="overlay-bg" data-parentid="overlay-login"></div>
    <div class="overlay-content-outer">
    <div class="overlay-content-inner">
    <div class="overlay-content">
    <div class="overlay-title">${localize('Add Interests')}<i class="overlay-close" data-action="close-overlay">×</i></div>
    <div class="input-title">${localize('Popular')}</div>
    ${createHTMLFromNames(populars)}
    <div class="input-title">${localize('Regions')}</div>
    ${createHTMLFromNames(regions)}
    </div>
    </div>
    </div>
    </div>
    `;
    document.body.append(ele);
});

// MARK: - The Follow button in the overlay interface
delegate.on('click', '[data-action="add-interest"]', async (event) => {
    const ele = event.target;
    const name = ele.getAttribute('data-name');
    if (!name) {return;}
    
    let myPreference = getMyPreference();
    let myInterests = myPreference[myInterestsKey] || [];
    // MARK: - There might be duplicated buttons with the same names
    let allButtons = document.querySelectorAll(`[data-action="add-interest"][data-name="${name}"]`);
    for (let button of allButtons) {
        if (button.classList.contains('plus')) {
            if (myInterests.indexOf(name) === -1) {
                myInterests.push(name);
            }
            button.innerHTML = localize('Followed');
            button.classList.remove('plus');
            button.classList.add('tick');
        } else {
            const index = myInterests.indexOf(name);
            if (index > -1) {
                myInterests.splice(index, 1);
            }
            button.innerHTML = localize('Follow');
            button.classList.add('plus');
            button.classList.remove('tick');
        }
    }
    myPreference[myInterestsKey] = myInterests;
    console.log('Update myPreference');
    console.log(myPreference);
    localStorage.setItem('preference', JSON.stringify(myPreference));
    const followedAnnotations = getFollowedAnnotations(myPreference, myInterestsKey);
    let eles = document.querySelectorAll(`.annotations-container[data-id="${myInterestsKey}"]`);
    console.log(eles);
    for (let ele of eles) {
        ele.innerHTML = followedAnnotations;
    }
});

delegate.on('click', '[data-action="close-overlay"]', async (event) => {
    const overlayContainers = document.querySelectorAll('.overlay-container'); 
    for (let i = 0; i < overlayContainers.length; i++) {
      overlayContainers[i].remove();
    }
});

/* jshint ignore:end */