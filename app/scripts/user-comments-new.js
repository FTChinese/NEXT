/* exported loadcomment, clickToSubmitComment */
// MARK: User Comments on New site
const commentFolder = '/user_comments';
const elementId = 'allcomments';

function loadcomment(id, type, options = {}) {

    const display_all = options?.display === 'all' ? 'yes' : 'no';
    const sort = options?.sort ?? 1;
    let url = `${commentFolder}/${type}/${id}?display_all=${display_all}&sort=${sort}`;

    try {
        document.getElementById('cstoryid').value = id;
        window.readingid = id;
    } catch (ignore) {

    }

    var userCommentsEle = document.getElementById(elementId);
    if (userCommentsEle && display_all !== 'yes') {
        userCommentsEle.innerHTML = '正在获取本文读者评论的数据...';
    }

    // MARK: Construct JSON request
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status === 200) {
                var data = JSON.parse(this.responseText);
                if (typeof webkit === 'object') {
                    // MARK: - For iOS native app, send the comments data to native to convert
                    userCommentsEle.innerHTML = '正在处理本文读者评论的数据...';
                    webkit.messageHandlers.commentsData.postMessage({storyid: id, theid: elementId, type: type, data: data});
                } else {
                    showComment(id, type, data, options);
                }
            } else {
                userCommentsEle.innerHTML = '<span class=\'error\'>' + '很抱歉。由于您与FT服务器之间的连接发生故障，' + '加载评论内容失败。请稍后再尝试。</span>';
            }
        }
    };

    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}


function showComment(id, type, data, options) {

    var commentsBody = '';
    var userCommentsEle = document.getElementById(elementId);
    if (!userCommentsEle) {
        return;
    }
    const comments = data.result;
    
    for (const comment of comments) {

        // Clean up the nickname by removing <a> tags

        const generateOneCommenContentHTML = (comment) => {
            const nickname = comment?.nickname?.replace(/<[Aa] .+>(.+)<\/[Aa]>/g, '$1') ?? '';
            let support_count = comment?.support_count?.toString() ?? '';
            if (support_count === '0') {
                support_count = '';
            }
            if (support_count !== '') {
                support_count = ` ${support_count}`;
            }
            const supported = comment?.supported === true;
            const supportClass = supported ? ' supported' : '';
            const supportStatus = supported ? '已支持' : '支持';

            const support_icon = `<svg class="user_comments_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M5.33014 8.42566H0.830139V21.9257H5.33014V8.42566Z"></path><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M5.33099 20.421C9.88265 20.421 10.2535 22.2335 16.4162 22.6037C18.1465 22.7076 19.3882 22.7972 20.5406 21.3197C23.0714 18.0748 24.287 10.3581 21.8323 10.3581H16.8181C15.7136 10.3581 14.8181 9.46264 14.8181 8.35807V4.46807C14.8181 1.44807 10.4002 -0.136834 10.4002 3.24807C10.4002 5.67566 9.4752 7.34449 7.92993 8.81464C7.17404 9.53378 6.29025 9.91876 5.33099 10.1244"></path></svg>`;
            const reply_icon = `<svg class="user_comments_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs></defs><title>email-action-reply</title><path d="M9.709,6.837a1.5,1.5,0,0,0-2.6-1.018L1.648,11.733a1.5,1.5,0,0,0,0,2.034l5.458,5.914a1.5,1.5,0,0,0,2.6-1.018V15.75h6a7.5,7.5,0,0,1,7.5,7.5v-6a7.5,7.5,0,0,0-7.5-7.5h-6Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
            const report_icon = `<svg class="user_comments_icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0.75 23.25L0.75 0.75" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M.75,17.708l3.154-.97a9.61,9.61,0,0,1,7.864,1A9.615,9.615,0,0,0,19.447,18.8l2.987-.854a1.125,1.125,0,0,0,.816-1.082V5.137a1.126,1.126,0,0,0-1.434-1.082l-2.369.677a9.615,9.615,0,0,1-7.679-1.056,9.61,9.61,0,0,0-7.864-1L.75,3.645" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
            let replyToHTML = '';
            const reply_to = comment?.reply_to ?? '';
            if (reply_to !== '') {
                replyToHTML = `
                <dt>
                    <font class="reply_status">
                    ${reply_icon}
                    回复 
                    </font>
                    <b>${reply_to}</b>
                </dt>`;
            }
            return `<div class="comment_content">
                <dt>
                    <span>${comment.dnewdate}</span>
                    <b>${nickname}</b> 
                    <font class="grey">${comment.user_area ?? ''}</font>
                    <div class="clearfloat"></div>
                </dt>
                ${replyToHTML}
                <dd>${comment.talk}</dd>
                <div class="replybox"></div>
                <dt class="replycomment">
                    <a class="report_comment_action" data-comment-id="${comment.id}">
                    ${report_icon}
                    举报
                    </a>
                    <a class="support_button${supportClass}" data-comment-id="${comment.id}">
                        ${support_icon}
                        <font class="support_status">${supportStatus}</font>
                        <font class="support_count">${support_count}</font>
                    </a>
                    <a class="show_reply_form" data-comment-id="${comment.id}">
                        ${reply_icon}
                        回复
                    </a>
                </dt>
            </div>`;
        };
        
        const generateRepliesHTML = (replies) => {
            if (!replies || replies.length === 0) {return '';}
            let html = '';
            for (const comment of replies) {
                html += `
                <div class="commentcontainer comment_reply">
                    ${generateOneCommenContentHTML(comment)}
                    ${generateRepliesHTML(comment.replies)}
                </div>`;
            }
            return html;
        };

        // Build the comment HTML using template literals for clarity
        commentsBody += `
        <div class="commentcontainer comment_root">
            ${generateOneCommenContentHTML(comment)}
            ${generateRepliesHTML(comment.replies)}
        </div>`;
    }

    userCommentsEle.innerHTML = commentsBody;

    if ((data.count && data.count > 0)) {
        const display_all = options?.display === 'all' ? 'yes' : 'no';
        if (data.result.length > 0 && data.count > data.result.length && display_all === 'no') {
            userCommentsEle.innerHTML += `<button class="user_comments_more_button" data-id="${id}" data-type="${type}" data-sort="${options?.sort ?? '1'}">显示全部评论</button>`;
        }
    }

}

function isUserLoggedIn() {
    return document.documentElement.classList.contains('is-member');
}


function clickToSubmitComment() {
    const ele = document.querySelector('#addnewcomment');
    if (!ele) {return;}

    const toggleButtonState = (button, isDisabled, text) => {
        button.disabled = isDisabled;
        button.value = text;
    };

    ele.onclick = async function () {
        const isAnonymous = document.querySelector('#anonymous-checkbox')?.checked ? 1 : 0;
        const talk = document.querySelector('#Talk').value.trim();
        const nickname = isAnonymous ? '匿名用户' : document.querySelector('#nick_name').value.trim();
        const id = document.querySelector('#content_id')?.value.trim() ?? '';
        const type = document.querySelector('#content_type')?.value.trim() ?? '';


        console.log(`id: ${id}, type: ${type}, talk: ${talk}`);

        if (!id || !type || !talk) {
            presentAlert('请填写完整的评论内容。', '');
            return;
        }

        toggleButtonState(this, true, '正在发布中...');

        const payload = {
            talk,
            use_nickname: isAnonymous,
            display_name: nickname,
            source_id: id,
            source_type: type
        };

        try {
            const response = await fetch(`${commentFolder}/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (data.status !== 'ok') {
                let errors = '';
                if (data.errors && data.errors.length > 0) {
                    errors = data.errors.map(x => x.msg ?? '').filter(x => x !== '').join('\n');
                }
                presentAlert('抱歉，您的留言没有发表成功', errors);
            } else {
                presentAlert('感谢您的参与，您的评论内容已经发表成功。审核后就会立即显示!', '');
                document.querySelector('#Talk').value = ''; // Clear the textarea
                document.querySelector('#Talk').focus(); // Refocus on textarea
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            presentAlert('提交评论时出现问题，请稍后再试。', '');
        } finally {
            toggleButtonState(this, false, '提交评论');
        }
    };
}


function presentAlert(title, message) {
    var alertMessage = {
        title: title,
        message: message
    };
    try {
        webkit.messageHandlers.alert.postMessage(alertMessage);
    } catch (err) {
        alert(`${title}\n${message}`);
    }
}


delegate.on('change', '#commentsortby', function(){
    const commentsortby = this.value;  // Correct way to get the value of the select element
    const id = this.getAttribute('data-id') ?? '';
    const type = this.getAttribute('data-type') ?? 'story';
    const options = { sort: commentsortby };
    loadcomment(id, type, options);  // Ensure `id` and `type` are defined in the current scope
});

delegate.on('click', '.user_comments_more_button', function(){
    const id = this.getAttribute('data-id') ?? '';
    const type = this.getAttribute('data-type') ?? 'story';
    const sort = this.getAttribute('data-sort') ?? '1';
    const options = { sort, display: 'all' };
    this.outerHTML = `加载中...`;
    loadcomment(id, type, options);  // Ensure `id` and `type` are defined in the current scope
});


delegate.on('click', '.show_reply_form', async function() { // must use function not arrow in order to get this object

    // Check if the user is logged in
    if (!isUserLoggedIn()) {
        // If the user is not logged in, display an alert message prompting them to log in
        presentAlert('亲爱的读者，请登录之后再回复评论。');
        return; // Exit the function early if not logged in
    }

    const id = this.getAttribute('data-comment-id') ?? '';

    if (id === '') {
        presentAlert('亲爱的读者，我们的代码有点问题，这不是您的错。请稍后再尝试回复的功能。');
        return;
    }

    // Clear all reply boxes by setting their innerHTML to an empty string
    document.querySelectorAll('.replybox').forEach(box => box.innerHTML = '');

    const replyBox = this.closest('.comment_content')?.querySelector('.replybox');
    if (!replyBox) {return;}
    // Insert the reply box HTML into the appropriate element
    replyBox.innerHTML = `
        <div class="reply-input-container">
            <b>回复此评论：</b>
            <textarea class="commentTextArea" rows="3"></textarea>
            <input type="button" value="提交回复" class="comment_btn submitbutton button ui-light-btn submit_reply_button" data-comment-id="${id}"/>
        </div>`;

});


delegate.on('click', '.submit_reply_button', async function() {

    // Check if the user is logged in
    if (!isUserLoggedIn()) {
        // If the user is not logged in, display an alert message prompting them to log in
        presentAlert('亲爱的读者，请登录之后再回复评论。');
        return; // Exit the function early if not logged in
    }

    // Disable the submit button to prevent multiple submissions
    this.disabled = true;
    this.value = '正在发布中...';

    const id = this.getAttribute('data-comment-id') ?? '';
    if (id === '') {
        return;
    }

    const sourceId = document.querySelector('#content_id')?.value.trim() ?? '';
    if (sourceId === '') {
        return;
    }

    const sourceType = document.querySelector('#content_type')?.value.trim() ?? '';
    if (sourceType === '') {
        return;
    }

    const container = this.closest('.reply-input-container');
    if (!container) {return;}

    const talk = container?.querySelector('textarea')?.value?.trim() ?? '';
    if (talk === '') {
        presentAlert('请填写完整的评论内容。', '');
        this.disabled = false;
        this.value = '提交回复';
        return;
    }

    const payload = {
        talk,
        quote_cmt_id: id,
        source_id: sourceId,
        source_type: sourceType
    };

    try {
        // Send the POST request using fetch
        const response = await fetch(`${commentFolder}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Check the response data for success status
        if (data.status !== 'ok') {
            let errors = '';
            if (data.errors && data.errors.length > 0) {
                errors = data.errors.map(x => x.msg ?? '').filter(x => x !== '').join('\n');
            }
            presentAlert('抱歉，您的留言没有发表成功', errors);
        } else {
            presentAlert('感谢您的参与，您的评论内容已经发表成功。审核后就会立即显示!', '');
            container.innerHTML = ''; // Clear the reply box
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
        presentAlert('提交评论时出现问题，请稍后再试。', '');
    } finally {
        // Re-enable the submit button
        this.disabled = false;
        this.value = '提交回复';
    }
});


delegate.on('click', '.support_button', async function() {


    // Check if the user is logged in
    if (!isUserLoggedIn()) {
        // If the user is not logged in, display an alert message prompting them to log in
        presentAlert('亲爱的读者，请登录之后再支持评论。');
        return; // Exit the function early if not logged in
    }

    const isSupport = !this.classList.contains('supported');

    const comment_id = this.getAttribute('data-comment-id') ?? '';
    if (comment_id === '') {
        console.log(`No comment id! `);
        return;
    }

    const payload = {
        comment_id: comment_id,
        support: isSupport
    };

    try {
        // Send the POST request using fetch
        const response = await fetch(`${commentFolder}/support`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Check the response data for success status
        if (data.status !== 'ok') {
            console.log(`Server side status not updated! `);
            return;
        }

    } catch (error) {
        console.error('Error submitting comment:', error);
        return;
        // presentAlert('提交评论时出现问题，请稍后再试。', '');
    }

    const supportStatusEle = this.querySelector('.support_status');
    const supportCountEle = this.querySelector('.support_count');
    if (!supportCountEle || !supportCountEle) {return;}
    
    supportStatusEle.innerHTML = isSupport ? '已支持' : '支持';

    let supportCountString = supportCountEle.innerHTML ?? '';
    if (supportCountString === '') {
        supportCountString = '0';
    }
    let supportCount = parseInt(supportCountString, 10) ?? 0;
    if (isSupport) {
        supportCount += 1;
    } else {
        supportCount -= 1;
    }
    supportCount = Math.max(0, supportCount);
    supportCountEle.innerHTML = supportCount;
    this.classList.toggle('supported');

});


// Handle the report comment action
delegate.on('click', '.report_comment_action', async function() {
    const comment_id = this.getAttribute('data-comment-id') ?? '';
    if (comment_id === '') {
        console.log(`No comment id! `);
        return;
    }

    // Check if a form is already visible and remove it
    const existingForm = document.querySelector('.report-comment-form');
    if (existingForm) {
        existingForm.remove();
    }

    // Create the report form dynamically with clean HTML
    const reportFormHTML = `
        <div class="report-comment-form" style="border: 1px solid; padding: 20px; margin-top: 10px;">
            <h3>举报此评论</h3>
            <p>你为什么举报此评论？</p>
            
            <div class="report-options">
                <label><input type="radio" name="report_reason" value="offensive"> 该评论具有攻击性</label>
                <label><input type="radio" name="report_reason" value="abusive"> 评论者具有辱骂行为</label>
                <label><input type="radio" name="report_reason" value="disagree"> 我不同意此评论</label>
                <label><input type="radio" name="report_reason" value="ad"> 此评论看起来像广告或营销</label>
                <label><input type="radio" name="report_reason" value="other"> 其他</label>
            </div>
            
            <p><a href="#">此评论包含可能非法的内容</a></p>

            <div class="additional-info-section">
                <label for="additional_info">附加信息（可选）</label>
                <textarea id="additional_info" rows="4" style="width: 100%;" placeholder="请留下任何可能对我们的管理员有帮助的附加信息。"></textarea>
            </div>

            <div class="report-actions" style="margin-top: 10px;">
                <button class="cancel_report">取消</button>
                <button class="submit_report" data-comment-id="${comment_id}">提交</button>
            </div>
        </div>
    `;

    // Find the comment container and insert the form after it
    const commentElement = this.closest('.comment_content');
    commentElement.insertAdjacentHTML('beforeend', reportFormHTML);

    // TODO: Handle form submission logic here
});

// Delegate cancel button functionality
delegate.on('click', '.cancel_report', function() {
    const reportForm = document.querySelector('.report-comment-form');
    if (reportForm) {
        reportForm.remove();
    }
});