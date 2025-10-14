/* exported renderMBAGymPageBody */

async function renderPage(pages = [], index = 0) {

  const l = pages.length;
  if (l === 0) {
    return;
  }
  const next = pages[index];
  const prev = Array.from(pages).find(p => p.classList.contains('on'));
  let yourScoreEle = next?.querySelector('#your');
  let viewEle = next.closest('.app-detail-content');

  // all the other cases
  if (yourScoreEle) {
    const accumulatedScore = parseInt(viewEle.getAttribute('data-accumulated-score') ?? '0', 10);
    const accumulatedValue = parseInt(viewEle.getAttribute('data-accumulated-value') ?? '0', 10);
    yourScoreEle.innerHTML = accumulatedScore;
    let topScoreEle = next?.querySelector('#topscore');
    if (topScoreEle) {
      topScoreEle.innerHTML = accumulatedValue;
    }
    let avScoreEle = next?.querySelector('#av');
    if (avScoreEle) {
      avScoreEle.innerHTML = Math.round(accumulatedValue * 0.6);
    }
    // TODO: show the final score percentage rate in in big font
    const percentage = Math.round(100 * accumulatedScore / accumulatedValue);
    let percentageClass = '';
    if (percentage >= 100) {
      percentageClass = 'perfect';
    } else if (percentage >= 90) {
      percentageClass = 'excellent';
    } else if (percentage >= 60) {
      percentageClass = 'good';
    } else {
      percentageClass = 'bad';
    }
    const pageTitleEle = next?.querySelector('.pagetitle');
    const percentageHTML = `<div class="mba-gym-percentage ${percentageClass}"><div>得分率</div><div>${percentage}%</div></div>`;
    if (pageTitleEle) {
      pageTitleEle.insertAdjacentHTML('afterend', percentageHTML);
    }
    // TODO: track user performance in our DB in the future
  } else if (next.querySelector('.quizlist:not(.done)')) {
    // unfinished quiz
    const button = viewEle?.querySelector('.mba-gym-big-button');
    if (button) {
      button.classList.add('is-disabled');
    }
    let options = next.querySelectorAll('.quizlist:not(.done) li');
    // shuffle options
    let parent = options[0]?.parentNode;
    if (parent) {
      // Convert NodeList to array
      let arr = Array.from(options);

      // Fisher–Yates shuffle (best practice)
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }

      // Re-append shuffled elements
      for (const el of arr) {
        parent.appendChild(el);
      }
    }

  }

  // if it's the first page, show immediately (no animation)
  if (index === 0) {
    pages.forEach(p => p.classList.remove('on', 'enter', 'enter-active', 'exit-active'));
    next.classList.add('on');
  } else {
    if (next === prev) {
      return; // nothing to do
    }

    // prepare next
    next.classList.add('enter');
    next.offsetWidth; // force reflow
    next.classList.add('enter-active');

    // animate out previous
    if (prev) {
      prev.classList.remove('on');
      prev.classList.add('exit-active');
      prev.addEventListener('transitionend', () => {
        prev.classList.remove('exit-active');
      }, { once: true });
    }

    // finalize next after transition
    next.addEventListener('transitionend', () => {
      next.classList.remove('enter', 'enter-active');
      next.classList.add('on');
    }, { once: true });
  }

  // update progress bar once
  const progressBarEle = viewEle?.querySelector('.mba-gym-progress-bar-inner');
  if (progressBarEle) {
    progressBarEle.style.width = `${((index + 1) * 100 / l)}%`;
  }

  const button = viewEle?.querySelector('.mba-gym-big-button');
  if (button) {
    if (l === index + 1) {
      button.innerHTML = '回顾';
    } else if (index === 0) {
      button.innerHTML = '开始';
    } else {
      button.innerHTML = '继续';
    }
  }

  // Track page view
  const page_title = viewEle?.getAttribute('data-title') ?? '';
  const url = viewEle?.getAttribute('data-url') ?? ''
  const page_location = `${window.location.origin}${url}/${index}`;
  gtag('event', 'page_view', { page_title, page_location });

}


async function renderMBAGymPageBody(info, appDetailEle) {
  try {
    // -------- 0) Clean up previous observers before replacing the body --------
    const oldTarget = appDetailEle.querySelector('.user_comments_container');
    if (oldTarget && oldTarget.__io) {
      try { oldTarget.__io.disconnect(); } catch (ignore) {}
      oldTarget.__io = null;
      oldTarget.__observed = false;
    }

    const appDetailContentEle = appDetailEle.querySelector('.app-detail-content');
    appDetailEle.querySelector('.app-detail-bottom')?.remove();

    appDetailContentEle.classList.add('app-detail-mba-gym-content');
    appDetailContentEle.setAttribute('data-title', info?.cheadline ?? '');
    appDetailContentEle.setAttribute('data-url', `/${info?.type ?? ''}/${info?.id ?? ''}`);
    appDetailContentEle.innerHTML = `
    <div class="mba-gym-content">${info?.cbody?.replace(/onclick="quizcheck\(this\)"/g, '').replace(/style="width:400px"/g, '')}</div>
    <div class="mba-gym-progress">
      <div class="mba-gym-progress-bar-container"><div class="mba-gym-progress-bar-inner"></div></div>
      <div class="mba-gym-big-button">开始</div>
    </div>
    `;

    let pages = appDetailContentEle?.querySelectorAll('.mba-gym-content>span') ?? [];


    let maxValue = 0;
    let options = appDetailContentEle?.querySelectorAll('.quizlist li') ?? [];
    for (const option of options) {
      const value = parseInt(option.getAttribute('value') ?? '0', 10);
      maxValue += value;
    }
    appDetailContentEle.setAttribute('data-max-value', maxValue);

    if (maxValue > 0) {
      appDetailEle.querySelector('.app-detail-navigation').innerHTML += `<div class="app-detail-score">${'⭐'.repeat(5)}</div>`;
      appDetailEle.querySelector('.app-detail-audio').remove();
    }

    for (let page of pages) {
      const html = page.innerHTML;
      page.innerHTML = `<div class="slide-inner">${html}</div>`;
    }



    await renderPage(pages, 0);
    runLoadImages();
  } catch(err) {
    console.error(`renderMBAGymPageBody error:`, err);
  }
}


delegate.on('click', '.mba-gym-big-button', async function () {
  try {
    if (this.classList.contains('is-disabled')) {
      return;
    }
    let viewEle = this.closest('.app-detail-mba-gym-content');
    if (!viewEle) {return;}
    const currentPageIndex = parseInt(viewEle?.getAttribute('data-current-page-index') ?? '0', 10);
    let pages = viewEle.querySelectorAll('.mba-gym-content>span');
    const pagesLength = pages.length;
    if (pagesLength === 0) {return;}
    const currentPageEle = pages[currentPageIndex];
    let newPageIndex = currentPageIndex;
    let quizList = currentPageEle?.querySelector('.quizlist');
    if (currentPageIndex === pagesLength - 1) {
      // If the page is already the last page
      newPageIndex = 0;
    } else if (quizList) {
      // If the page is a quiz
      if (quizList.classList.contains('done')) {
        // If quiz is done, go to next slide
        newPageIndex += 1;
      } else {
        // Check quiz result
        let options = quizList.querySelectorAll('li');
        let score = 0;
        let maxScore = 0;
        let correctOptionHTML = '';
        for (let option of options) {
          const isSelected = option.classList.contains('option-selected');
          const value = parseInt((option.getAttribute('value') ?? '0'), 10);
          maxScore += value;
          if (isSelected || value > 0) {
            const newClass = value > 0 ? 'is-correct' : 'is-wrong';
            option.classList.add(newClass);
            score += isSelected ? value : 0;
          }
          if (value > 0) {
            correctOptionHTML = option.innerHTML;
          }
        }
        let accumulatedScore = parseInt(viewEle.getAttribute('data-accumulated-score') ?? '0', 10);
        let accumulatedValue = parseInt(viewEle.getAttribute('data-accumulated-value') ?? '0', 10);
        const maxValue = parseInt(viewEle.getAttribute('data-max-value') ?? '0', 10);

        accumulatedScore += score;
        accumulatedValue += maxScore;
        viewEle.setAttribute('data-accumulated-score', accumulatedScore);
        viewEle.setAttribute('data-accumulated-value', accumulatedValue);

        const lostScore = accumulatedValue - accumulatedScore;
        const remainScore = maxValue - lostScore;
        const remainScoreInTen = Math.round(10 * remainScore / maxValue);
        const remainHeartsOfFive = remainScoreInTen / 2;
        const fullStars = Math.ceil(remainHeartsOfFive);
        console.log(`remainHeartsOfFive:`, remainHeartsOfFive);
        // TODO: Visualize the accumulatedScore and accumulatedValue at the top right corner
        let starsHTML = '⭐'.repeat(fullStars);
        if (remainHeartsOfFive > fullStars) {
          starsHTML = `<font class="half-star">⭐</font>${starsHTML}`;
        }
        let scoreEle = this.closest('.app-detail-view')?.querySelector('.app-detail-score');
        if (scoreEle) {
          scoreEle.innerHTML = starsHTML;
        }




        const button = this.closest('.app-detail-content')?.querySelector('.mba-gym-big-button');
        if (button) {
          button.innerHTML = '继续';
          button.classList.remove('is-disabled');
        }

        quizList.classList.add('done');
        let rightAnswer = currentPageEle?.querySelector('.rightanswer');
        if (rightAnswer) {
          const result = score > 0 ? '回答正确' : '回答错误';
          const resultClass = score > 0 ? 'is-correct' : 'is-wrong';
          rightAnswer.innerHTML = `<div class="answer-result ${resultClass}">${result}</div><div>正确答案是：${correctOptionHTML}</div>${rightAnswer.innerHTML}`;
          rightAnswer.classList.add('show');
          // Move the rightAnswer element to the end of currentPageEle
          currentPageEle.appendChild(rightAnswer);

          // Scroll it into view smoothly
          rightAnswer.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }

    } else {
      newPageIndex += 1;
    }

    if (newPageIndex === currentPageIndex) {return;}
    pages[currentPageIndex].classList.remove('on');

    viewEle.setAttribute('data-current-page-index', newPageIndex);
    await renderPage(pages, newPageIndex);    

  } catch (err) {
    console.error('mba gym main button error:', err);
  }
});


delegate.on('click', '.quizlist li', function () {
  let options = this.closest('.quizlist')?.querySelectorAll('li') ?? [];
  for (let option of options) {
    option.classList.remove('option-selected');
  }
  this.classList.add('option-selected');
  const button = this.closest('.app-detail-content')?.querySelector('.mba-gym-big-button');
  if (button) {
    button.innerHTML = '确定';
    button.classList.remove('is-disabled');
  }
});

