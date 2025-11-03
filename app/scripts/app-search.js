const searchHistoryKey = 'Search History';

// Open the search page
delegate.on('click', '[data-action="search"]', async function () {
  await showSearchPage();
});

// Submit the search (delegated)
delegate.on('submit', '.app-detail-search-form', async function (event) {

  event.preventDefault();
  const form = this;
  const inputEl = form.querySelector('.app-detail-search');
  const contentEl = inputEl.closest('.app-detail-view').querySelector('.app-detail-content');
  const q = (inputEl && inputEl.value ? String(inputEl.value).trim() : '');
  if (!q) { return; }
  await executeSearch(q, 1, contentEl);

});


// Submit the search (delegated)
delegate.on('click', '[data-search-key]', async function (event) {

  event.preventDefault();
  const q = this.getAttribute('data-search-key');
  if (!q) { return; }
  const p = this.getAttribute('data-search-page') ?? 1;
  const contentEl = this.closest('.app-detail-view').querySelector('.app-detail-content');
  await executeSearch(q, parseInt(p, 10) ?? 1, contentEl);

});


async function executeSearch(q, p, contentEl) {

  try {
    const existingHistoryString = localStorage?.getItem(searchHistoryKey) ?? `[]`;
    let existingHistory = JSON.parse(existingHistoryString);
    existingHistory.unshift(q);
    existingHistory = [...new Set(existingHistory)].slice(0, 10);
    localStorage.setItem(searchHistoryKey, JSON.stringify(existingHistory));
  } catch(err) {
    console.error(`saving search key error:`, err);
  }

  // Payload conforms to your validation rules
  const payload = {
    query: q,                 // required string
    type: 'default',          // one of: default | name | relative_byline | relative_tag
    language: 'cn',           // 'cn' | 'en'
    page: parseInt(p, 10) ?? 1                 // positive int
    // category: '...',       // optional string (omit unless needed)
  };

  try {
    // let api/page/app_search.json
    let url = '/api/search';
    const method = 'POST';
    let options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    };
    if (window.isFrontEndTest) {
        url = '/api/page/app_search.json';
        options = {};
    }
    const res = await fetch(url, options);

    if (!res.ok) {
      console.error('Search request failed:', res.status, res.statusText);
      return;
    }

    const data = await res.json();
    // Finally insert into your page:
    renderSearchResults(q, data, contentEl);

  } catch (err) {
    console.error('Search fetch error:', err);
  }

}

function renderSearchResults(q, data, container) {

  if (!container || !q) { return; }

  const results = data?.data?.results;
  if (!Array.isArray(results) || results.length === 0) {
    container.innerHTML = '<div class="no-result">没有找到相关文章。</div>';
    return;
  }

  // console.log(`data:`, JSON.stringify(data, null, 2));

  let itemsHtml = '';

  for (let i = 0, len = results.length; i < len; i++) {
    const item = results[i] || {};
    const id = item.itemId || '';
    const type = item.type === 'interactive' ? 'interactive' : 'story';
    const title = item.cheadline || '';
    const snippet = item.cbody || item.cshortleadbody || '';
    const author = item.cauthor || '';
    const date = item.publish || item.update || item.pubdate || '';
    // const href = (type === 'story' || type === 'news') ? `/story/${id}` : `/interactive/${id}`;
    const delimiter = (i > 0) ? '<div class="XLT LT ST MT PT"></div>' : '';
    const dateHtml = date ? `<a class="item-time" href="/archiver/${date}" target="_blank">${date}</a>` : `<span class="item-time"></span>`;
    const tag = item?.tag ?? '';
    let subtype = '';
    if (type === 'interactive') {
        if (/FTArticle/gi.test(tag)) {
            subtype = 'bilingual';
        }
    }
    
    itemsHtml += `
      ${delimiter}
      <div class="item-container one-row no-image item-container-app" data-id="${id}" data-type="${type}" data-sub-type="${subtype}" data-keywords="${tag}">
        <div class="item-inner">
          <h2 class="item-headline">
            <a class="item-headline-link" target="_blank">${title}</a>
          </h2>
          <div class="item-lead">${snippet}</div>
          ${dateHtml}
          <span class="item-time">${author}</span>
          <div class="item-bottom"></div>
        </div>
      </div>
    `;

  }


  const totalPages = data?.data?.totalPages ?? 1;
  const currentPage = data?.data?.currentPage ?? 1;

  // console.log(`totalPages: ${totalPages} (${typeof totalPages}), currentPage: ${currentPage} (${typeof currentPage})`);

  const paginationHTML = renderSearchPaginationHTML(q, totalPages, currentPage);

  // console.log(`paginationHTML:`, paginationHTML);

  const html = `
    <div class="block-container">
      <div class="block-inner">
        <div class="list-container">
          <div class="list-inner">
            ${itemsHtml}
          </div>
        </div>
      </div>
    </div>
    ${paginationHTML}
  `;

  container.innerHTML = html;
}


function renderSearchPaginationHTML(q, totalPages, currentPage) {
  if (!q) { return ''; }

  if (!totalPages || !currentPage || totalPages <= 1) {
    return '';
  }
  // Generate pagination detail HTML with proper attributes
  const maxIndex = totalPages;
  const currentIndex = currentPage;
  const indexLength = (window.innerWidth && window.innerWidth > 490) ? 10 : 5;
  let startIndex = Math.max(1, currentIndex - Math.floor(indexLength / 2));
  let endIndex = startIndex + indexLength - 1;
  if (endIndex > maxIndex) {
    endIndex = maxIndex;
    startIndex = Math.max(1, endIndex - indexLength + 1);
  }


  let html = '';
  // First page
  if (startIndex > 1) {
    html += `<a href="#" data-search-key="${q}" data-search-page="1">|&lsaquo;</a>`;
  }

  // Prev page
  if (currentIndex > 1) {
    html += `<a href="#" data-search-key="${q}" data-search-page="${currentIndex - 1}">上一页&lsaquo;&lsaquo;</a>`;
  }

  // Numbered pages
  for (let i = startIndex; i <= endIndex; i++) {
    if (i === currentIndex) {
      html += `<span class="current">${i}</span>`;
    } else {
      html += `<a href="#" data-search-key="${q}" data-search-page="${i}">${i}</a>`;
    }
  }

  // Next page
  if (currentIndex < maxIndex) {
    html += `<a href="#" data-search-key="${q}" data-search-page="${currentIndex + 1}">&rsaquo;&rsaquo;下一页</a>`;
  }

  // Last page
  if (endIndex < maxIndex) {
    html += `<a href="#" data-search-key="${q}" data-search-page="${maxIndex}">&rsaquo;|</a>`;
  }

  return `<div class="pagination-container"><div class="pagination-inner">${html}</div></div>`;

}



// Render the search page
async function showSearchPage() {

  try {

    const appDetailEle = document.createElement('div');
    appDetailEle.className = 'app-detail-view';
    let searchHistoryHTML = '';
    try {
      const searchHistoryString = localStorage.getItem(searchHistoryKey) ?? '[]';
      const searchHistory = JSON.parse(searchHistoryString);
      searchHistoryHTML = [...new Set(searchHistory)].map(q => `<p class="search-key" data-search-key="${q}">${q}</p>`).join('');
    } catch(err) {
      console.error(`search history error:`, err);
    }

    appDetailEle.innerHTML = `
      <div class="app-detail-navigation">
        <div class="app-detail-back"></div>
        <form class="app-detail-search-form" role="search">
          <input type="search" placeholder="input key" class="app-detail-search" name="q" />
        </form>
      </div>
      <div class="app-detail-content api-detail-content-page"><div class="block-container">
        <div class="block-inner">
          <div class="list-container">
            <div class="list-inner">
              ${searchHistoryHTML}
            </div>
          </div>
        </div>
      </div>
    `;
    const stackDepth = document.querySelectorAll('.app-detail-view').length;
    appDetailEle.style.zIndex = String(2 + stackDepth);
    document.body.appendChild(appDetailEle);
    void appDetailEle.offsetHeight;
    appDetailEle.classList.add('on');

    const inputEl = appDetailEle.querySelector('.app-detail-search');
    if (inputEl) { inputEl.focus(); }
  } catch (err) {
    console.error('handle content data error:', err);
  }
}