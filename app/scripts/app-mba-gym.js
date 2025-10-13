async function renderMBAGymPageBody(info, appDetailEle, langSel, langValue) {
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
  appDetailContentEle.innerHTML = `<div class="mba-gym-content">${info?.cbody}</div><div class="mba-gym-progress"></div>`;

  let pages = appDetailContentEle.querySelectorAll('.mba-gym-content span');

  if (pages.length > 0) {
    pages?.[0].classList.add('on');
  }

  runLoadImages();

}