/* exported loadcomment, clickToSubmitComment */
// MARK: User Comments on New site
const commentFolder = '/user_comments';
const elementId = 'allcomments';

if (typeof delegate !== 'object') {
    window.delegate = new Delegate(document.body);
}

async function loadcomment(id, type, options = {}) {

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
        userCommentsEle.innerHTML = await convertChinese('正在获取本文读者评论的数据...', preferredLanguage);
    }

    // MARK: Construct JSON request
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = async function() {
        if (this.readyState === 4) {
            if (this.status === 200) {
                var data = JSON.parse(this.responseText);
                if (typeof webkit === 'object') {
                    // MARK: - For iOS native app, send the comments data to native to convert
                    userCommentsEle.innerHTML = await convertChinese('正在处理本文读者评论的数据...', preferredLanguage);
                    webkit.messageHandlers.commentsData.postMessage({storyid: id, theid: elementId, type: type, data: data});
                } else {
                    try {
                        await showComment(id, type, data, options);
                    } catch (error) {
                        console.error('Error showing comments:', error);
                    }
                }
            } else {
                userCommentsEle.innerHTML = '<span class=\'error\'>' + await convertChinese('很抱歉。由于您与FT服务器之间的连接发生故障，加载评论内容失败。请稍后再尝试。', preferredLanguage) + '</span>';
            }
        }
    };

    xmlhttp.open('GET', url, true);
    xmlhttp.send();
}


async function showComment(id, type, data, options) {

    var commentsBody = '';
    var userCommentsEle = document.getElementById(elementId);
    if (!userCommentsEle) {
        return;
    }
    const userCommentsContainerEle = document.querySelector('.user_comments_container');
    if (!userCommentsContainerEle) {
        return;
    }
    const comments = data.result;

    const support_icon = `<svg class="user_comments_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M5.33014 8.42566H0.830139V21.9257H5.33014V8.42566Z"></path><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M5.33099 20.421C9.88265 20.421 10.2535 22.2335 16.4162 22.6037C18.1465 22.7076 19.3882 22.7972 20.5406 21.3197C23.0714 18.0748 24.287 10.3581 21.8323 10.3581H16.8181C15.7136 10.3581 14.8181 9.46264 14.8181 8.35807V4.46807C14.8181 1.44807 10.4002 -0.136834 10.4002 3.24807C10.4002 5.67566 9.4752 7.34449 7.92993 8.81464C7.17404 9.53378 6.29025 9.91876 5.33099 10.1244"></path></svg>`;
    const reply_icon = `<svg class="user_comments_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs></defs><title>email-action-reply</title><path d="M9.709,6.837a1.5,1.5,0,0,0-2.6-1.018L1.648,11.733a1.5,1.5,0,0,0,0,2.034l5.458,5.914a1.5,1.5,0,0,0,2.6-1.018V15.75h6a7.5,7.5,0,0,1,7.5,7.5v-6a7.5,7.5,0,0,0-7.5-7.5h-6Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
    const report_icon = `<svg class="user_comments_icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0.75 23.25L0.75 0.75" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path><path d="M.75,17.708l3.154-.97a9.61,9.61,0,0,1,7.864,1A9.615,9.615,0,0,0,19.447,18.8l2.987-.854a1.125,1.125,0,0,0,.816-1.082V5.137a1.126,1.126,0,0,0-1.434-1.082l-2.369.677a9.615,9.615,0,0,1-7.679-1.056,9.61,9.61,0,0,0-7.864-1L.75,3.645" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
    const delete_icon = `<svg class="user_comments_icon user_comments_icon_delete" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>`;
    const replyText = await convertChinese('回复', preferredLanguage);
    const reportText = await convertChinese('举报', preferredLanguage);

    const generateOneCommenContentHTML = async (comment) => {
        let nickname = comment?.nickname?.replace(/<[Aa] .+>(.+)<\/[Aa]>/g, '$1') ?? '';
        if (nickname === '我') {
            nickname = `<a href="/my_comments">${nickname}</a>`;
        }
        let status = '';
        const commentStatus = comment?.status;
        const isApproved = commentStatus === 'approved';
        if (commentStatus === 'pending') {
            status = await convertChinese('（等待审核中，仅您可见）', preferredLanguage);
        } else if (commentStatus === 'rejected') {
            status = await convertChinese('（您的评论未符合发布标准，仅您可见。此评论稍后将自动删除。）', preferredLanguage);        
        }

        let replyToHTML = '';
        const reply_to = comment?.reply_to ?? '';
        if (reply_to !== '') {
            const replyToText = await convertChinese('回复', preferredLanguage);
            replyToHTML = `
            <dt>
                <font class="reply_status">
                ${reply_icon}
                ${replyToText} 
                </font>
                <b>${reply_to}</b>
            </dt>`;
        }
        let deleteHTML = '';
        const deleteText = await convertChinese('删除', preferredLanguage);
        // MARK: You can delete your comment if it is not replied yet
        if (comment.isPublishedByMe === true && (comment.replies ?? []).length === 0) {
            deleteHTML = `
            <a class="delete_button" data-comment-id="${comment.id}">
                ${delete_icon}
                ${deleteText}
            </a>`;
        }


        const talk = await convertChinese(comment?.talk ?? '', preferredLanguage);

        let supportHTML = '';
        if (isApproved) {
            let support_count = comment?.support_count?.toString() ?? '';
            if (support_count === '0') {
                support_count = '';
            }
            if (support_count !== '') {
                support_count = ` ${support_count}`;
            }
            const supported = comment?.supported === true;
            const supportClass = supported ? ' supported' : '';
            const supportStatus = supported ? await convertChinese('已支持', preferredLanguage) : await convertChinese('支持', preferredLanguage);    
            supportHTML = `<a class="support_button${supportClass}" data-comment-id="${comment.id}">
                ${support_icon}
                <font class="support_status">${supportStatus}</font>
                <font class="support_count">${support_count}</font>
            </a>`;
        }

        let replyHTML = '';
        if (isApproved) {
            replyHTML = `<a class="show_reply_form" data-comment-id="${comment.id}">
                ${reply_icon}
                ${replyText}
            </a>`;
        }

        let reportHTML = '';
        if (isApproved) {
            reportHTML = `<a class="report_comment_action" data-comment-id="${comment.id}">
                ${report_icon}
                ${reportText}
            </a>`;
        }

        return `<div class="comment_content">
            <dt>
                <span>${comment.dnewdate}</span>
                <b>${nickname}</b>${status}
                <font class="grey">${comment.user_area ?? ''}</font>
                <div class="clearfloat"></div>
            </dt>
            ${replyToHTML}
            <dd>${talk}</dd>
            <div class="replybox"></div>
            <dt class="replycomment">
                ${reportHTML}
                ${supportHTML}
                ${replyHTML}
                ${deleteHTML}
            </dt>
        </div>`;
    };
    
    const generateRepliesHTML = async (replies) => {
        if (!replies || replies.length === 0) {return '';}
        let html = '';
        for (const comment of replies) {
            html += `
            <div class="commentcontainer comment_reply">
                ${await generateOneCommenContentHTML(comment)}
                ${await generateRepliesHTML(comment.replies)}
            </div>`;
        }
        return html;
    };


    for (const comment of comments) {

        commentsBody += `
        <div class="commentcontainer comment_root">
            ${await generateOneCommenContentHTML(comment)}
            ${await generateRepliesHTML(comment.replies)}
        </div>`;
    }

    if (commentsBody === '') {
        userCommentsContainerEle?.classList?.add('hide');
    } else {
        userCommentsContainerEle?.classList?.remove('hide');
    }

    userCommentsEle.innerHTML = commentsBody;

    if ((data.count && data.count > 0)) {
        const display_all = options?.display === 'all' ? 'yes' : 'no';
        if (data.result.length > 0 && data.count > data.result.length && display_all === 'no') {
            const showAllCommentsText = await convertChinese('显示全部评论', preferredLanguage);
            userCommentsEle.innerHTML += `<button class="user_comments_more_button" data-id="${id}" data-type="${type}" data-sort="${options?.sort ?? '1'}">${showAllCommentsText}</button>`;
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
        const nickname = isAnonymous ? await convertChinese('匿名用户', preferredLanguage) : document.querySelector('#nick_name').value.trim();
        const id = document.querySelector('#content_id')?.value.trim() ?? '';
        const type = document.querySelector('#content_type')?.value.trim() ?? '';


        console.log(`id: ${id}, type: ${type}, talk: ${talk}`);

        if (!id || !type || !talk) {
            presentAlert(await convertChinese('请填写完整的评论内容。', preferredLanguage), '');
            return;
        }

        toggleButtonState(this, true, await convertChinese('正在发布中...', preferredLanguage));

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
                presentAlert(await convertChinese('抱歉，您的留言没有发表成功', preferredLanguage), errors);
            } else {
                presentAlert(await convertChinese('感谢您的参与，您的评论内容已经发表成功。审核后就会立即显示!', preferredLanguage), '');
                document.querySelector('#Talk').value = ''; // Clear the textarea
                document.querySelector('#Talk').focus(); // Refocus on textarea
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            presentAlert(await convertChinese('提交评论时出现问题，请稍后再试。', preferredLanguage), '');
        } finally {
            toggleButtonState(this, false, await convertChinese('提交评论', preferredLanguage));
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


delegate.on('change', '#commentsortby', async function(){
    const commentsortby = this.value;
    const id = this.getAttribute('data-id') ?? '';
    const type = this.getAttribute('data-type') ?? 'story';
    const options = { sort: commentsortby };
    await loadcomment(id, type, options);
});

delegate.on('click', '.user_comments_more_button', async function(){
    const id = this.getAttribute('data-id') ?? '';
    const type = this.getAttribute('data-type') ?? 'story';
    const sort = this.getAttribute('data-sort') ?? '1';
    const options = { sort, display: 'all' };
    this.outerHTML = await convertChinese('加载中...', preferredLanguage);
    await loadcomment(id, type, options);
});


delegate.on('click', '.show_reply_form', async function() { // must use function not arrow in order to get this object

    // Check if the user is logged in
    if (!isUserLoggedIn()) {
        // If the user is not logged in, display an alert message prompting them to log in
        presentAlert(await convertChinese('亲爱的读者，请登录之后再回复评论。', preferredLanguage));
        return; // Exit the function early if not logged in
    }

    const id = this.getAttribute('data-comment-id') ?? '';

    if (id === '') {
        presentAlert(await convertChinese('亲爱的读者，我们的代码有点问题，这不是您的错。请稍后再尝试回复的功能。', preferredLanguage));
        return;
    }

    // Clear all reply boxes by setting their innerHTML to an empty string
    document.querySelectorAll('.replybox').forEach(box => box.innerHTML = '');

    const replyBox = this.closest('.comment_content')?.querySelector('.replybox');
    if (!replyBox) {return;}
    // Insert the reply box HTML into the appropriate element
    const replyToCommentText = await convertChinese('回复此评论：', preferredLanguage);
    const submitReplyText = await convertChinese('提交回复', preferredLanguage);
    replyBox.innerHTML = `
        <div class="reply-input-container">
            <b>${replyToCommentText}</b>
            <textarea class="commentTextArea" rows="3"></textarea>
            <input type="button" value="${submitReplyText}" class="comment_btn submitbutton button ui-light-btn submit_reply_button" data-comment-id="${id}"/>
        </div>`;

});


delegate.on('click', '.submit_reply_button', async function() {

    // Check if the user is logged in
    if (!isUserLoggedIn()) {
        // If the user is not logged in, display an alert message prompting them to log in
        presentAlert(await convertChinese('亲爱的读者，请登录之后再回复评论。', preferredLanguage));
        return; // Exit the function early if not logged in
    }

    // Disable the submit button to prevent multiple submissions
    this.disabled = true;
    this.value = await convertChinese('正在发布中...', preferredLanguage);

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
        presentAlert(await convertChinese('请填写完整的评论内容。', preferredLanguage), '');
        this.disabled = false;
        this.value = await convertChinese('提交回复', preferredLanguage);
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
            presentAlert(await convertChinese('抱歉，您的留言没有发表成功', preferredLanguage), errors);
        } else {
            presentAlert(await convertChinese('感谢您的参与，您的评论内容已经发表成功。审核后就会立即显示!', preferredLanguage), '');
            container.innerHTML = ''; // Clear the reply box
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
        presentAlert(await convertChinese('提交评论时出现问题，请稍后再试。', preferredLanguage), '');
    } finally {
        // Re-enable the submit button
        this.disabled = false;
        this.value = await convertChinese('提交回复', preferredLanguage);
    }
});


delegate.on('click', '.support_button', async function() {


    // Check if the user is logged in
    if (!isUserLoggedIn()) {
        // If the user is not logged in, display an alert message prompting them to log in
        presentAlert(await convertChinese('亲爱的读者，请登录之后再支持评论。', preferredLanguage));
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
    }

    const supportStatusEle = this.querySelector('.support_status');
    const supportCountEle = this.querySelector('.support_count');
    if (!supportCountEle || !supportStatusEle) {return;}
    
    const supportText = await convertChinese('支持', preferredLanguage);
    const alreadySupportedText = await convertChinese('已支持', preferredLanguage);

    supportStatusEle.innerHTML = isSupport ? alreadySupportedText : supportText;

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
    supportCountEle.innerHTML = supportCount === 0 ? '' : ` ${supportCount}`;
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

    const reportCommentText = await convertChinese('举报此评论', preferredLanguage);
    const whyReportText = await convertChinese('你为什么举报此评论？', preferredLanguage);
    const offensiveText = await convertChinese('该评论具有攻击性', preferredLanguage);
    const abusiveText = await convertChinese('评论者具有辱骂行为', preferredLanguage);
    const disagreeText = await convertChinese('我不同意此评论', preferredLanguage);
    const adText = await convertChinese('此评论看起来像广告或营销', preferredLanguage);
    const otherText = await convertChinese('其他', preferredLanguage);
    const illegalContentText = await convertChinese('此评论包含可能非法的内容', preferredLanguage);
    const additionalInfoText = await convertChinese('附加信息（可选）', preferredLanguage);
    const additionalInfoPlaceholder = await convertChinese('请留下任何可能对我们的管理员有帮助的附加信息。', preferredLanguage);
    const cancelText = await convertChinese('取消', preferredLanguage);
    const submitText = await convertChinese('提交', preferredLanguage);

    const reportFormHTML = `
        <div class="report-comment-form" style="border: 1px solid; padding: 20px; margin-top: 10px;">
            <h3>${reportCommentText}</h3>
            <p>${whyReportText}</p>
            
            <div class="report-options">
                <label><input type="radio" name="report_reason" value="offensive"> ${offensiveText}</label>
                <label><input type="radio" name="report_reason" value="abusive"> ${abusiveText}</label>
                <label><input type="radio" name="report_reason" value="disagree"> ${disagreeText}</label>
                <label><input type="radio" name="report_reason" value="ad"> ${adText}</label>
                <label><input type="radio" name="report_reason" value="other"> ${otherText}</label>
            </div>
            
            <p><a href="#">${illegalContentText}</a></p>

            <div class="additional-info-section">
                <label for="additional_info">${additionalInfoText}</label>
                <textarea id="additional_info" rows="4" style="width: 100%;" placeholder="${additionalInfoPlaceholder}"></textarea>
            </div>

            <div class="report-actions" style="margin-top: 10px;">
                <button class="cancel_report">${cancelText}</button>
                <button class="submit_report" data-comment-id="${comment_id}">${submitText}</button>
            </div>
        </div>
    `;

    // Find the comment container and insert the form after it
    const commentElement = this.closest('.comment_content');
    commentElement.insertAdjacentHTML('beforeend', reportFormHTML);

});

delegate.on('click', '.cancel_report', function() {
    const reportForm = document.querySelector('.report-comment-form');
    if (reportForm) {
        reportForm.remove();
    }
});

// Delegate event listener for report submission
delegate.on('click', '.submit_report', async function() {
    const comment_id = this.getAttribute('data-comment-id') ?? '';
    if (comment_id === '') {
        console.log('No comment id!');
        return;
    }

    // Get the selected reason for reporting
    const selectedReason = document.querySelector('input[name="report_reason"]:checked');
    if (!selectedReason) {
        console.log('No report reason selected!');
        return;
    }

    const report_reason = selectedReason.value;

    // Get the additional information (if any)
    const additional_info = document.getElementById('additional_info')?.value ?? '';

    // Construct the payload
    const payload = {
        comment_id: comment_id,
        report_reason: report_reason,
        additional_info: additional_info
    };

    try {
        // Post the payload to the report submission endpoint
        const response = await fetch(`${commentFolder}/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result?.status === 'ok') {
            console.log('Report submitted successfully', result);
            // Optionally: Remove the form after successful submission
            document.querySelector('.report-comment-form').remove();
            alert(await convertChinese('举报已成功提交，谢谢您的反馈！', preferredLanguage));
        } else {
            console.error('Error submitting report:', result.error);
            alert(await convertChinese('提交举报时出错，请稍后再试。', preferredLanguage));
        }
    } catch (error) {
        console.error('Failed to submit report:', error);
        alert(await convertChinese('提交举报时出现问题，请检查您的网络连接。', preferredLanguage));
    }
});


delegate.on('click', '.delete_button', async function() {
    const comment_id = this.getAttribute('data-comment-id') ?? '';
    if (comment_id === '') {
        console.log('No comment id!');
        return;
    }

    if (!confirm(await convertChinese('确认删除这条评论？', preferredLanguage))) {return;}

    // Construct the payload
    const payload = {
        comment_id: comment_id
    };

    try {
        // Post the payload to the report submission endpoint
        const response = await fetch(`${commentFolder}/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result?.status === 'ok') {
            this.closest('.commentcontainer')?.remove();
        } else if (typeof result?.error === 'string') {
            alert(await convertChinese(result?.error ?? '删除评论时出错，请稍后再试。', preferredLanguage));
        } else {
            console.error('Error deleting user comments:', result.error);
            alert(await convertChinese('删除评论时出错，请稍后再试。', preferredLanguage));
        }
    } catch (error) {
        console.error('Failed to delete comment:', error);
        alert(await convertChinese('删除评论时出现问题，请检查您的网络连接。', preferredLanguage));
    }
});