/* exported loadcomment, init_repeat_cmt, showcmt, voteComment, cmt_reply, login, clickToSubmitComment, logout, checkLogin, socialLogin */
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
    const result = data.result;
    
    for (const comment of result) {

        // Clean up the nickname by removing <a> tags
        const nickname = comment.nickname.replace(/<[Aa] .+>(.+)<\/[Aa]>/g, '$1');
        

        // Build the comment HTML using template literals for clarity
        commentsBody += `
        <div class="commentcontainer">
            <dt>
                <span>${comment.dnewdate}</span>
                <b>${nickname}</b> 
                <font class="grey">${comment.user_area}</font>
                <div class="clearfloat"></div>
            </dt>
            <dd>${comment.quote_content || ''}${comment.talk}</dd>
            <div class="replybox" id="re${comment.id}"></div>
            <dt class="replycomment">
                <a href="javascript:cmt_reply('${comment.id}', '');">回复</a> 
                <a id="st${comment.id}" href="javascript:voteComment('${comment.id}', '#st', 'support');">支持</a>(<font id="sts${comment.id}">${comment.support_count}</font>) 
                <a id="dt${comment.id}" href="javascript:voteComment('${comment.id}', '#dt', 'disagree');">反对</a>(<font id="dtd${comment.id}">${comment.disagree_count}</font>)
            </dt>
        </div>`;
    }

    userCommentsEle.innerHTML = commentsBody;

    if ((data.count && data.count > 0)) {
        init_repeat_cmt();
        if (data.result.length > 0 && data.count > data.result.length) {
            userCommentsEle.innerHTML += `<button class="user_comments_more_button" data-id="${id}" data-type="${type}" data-sort="${options?.sort ?? '1'}">显示全部评论</button>`;
        }
    }



}





function init_repeat_cmt() {
    var all_cmt;
    var cmtQuotes = document.querySelectorAll('.cmt_quote');
    for (var i=0; i<cmtQuotes[i]; i++) {
        if (cmtQuotes[i].parentNode.tagName.toUpperCase() === 'DD') {
            cmtQuotes[i].id = 'cmt_quote_'+ Math.round(Math.random() * 1000000);
            if (cmtQuotes[i].childNodes[0].className === 'cmt_quote') {
                cmtQuotes[i].childNodes[0].id = 'cmt_quote_child_'+ Math.round(Math.random() * 1000000);
            }
        } else if (cmtQuotes[i].id !== 'recommendcomment') {
            cmtQuotes[i].style.display = 'none';
        }
    }

    var cmtQuoteChilds = document.querySelectorAll('div[id^="cmt_quote_child_"]');
    for (var j=0; j<cmtQuoteChilds.length; j++) {
        cmtQuoteChilds[j].style.display = '';
        if (cmtQuoteChilds[j].childNodes[0].className === 'cmt_quote') {
            all_cmt = document.querySelectorAll('#'+ cmtQuoteChilds[j].id + ' .cmt_quote').length;
            document.getElementById(cmtQuoteChilds[j].id).innerHTML = '<p onclick="showcmt(this)" class=\'showcmt\'>重复 [ ' + all_cmt + ' ] 条引用已被隐藏,点击展开。</p>' + document.getElementById(cmtQuoteChilds[j].id).innerHTML;
        }
    }
}

function showcmt(ele) {
    document.querySelector('#'+ ele.parentNode.id + ' .cmt_quote').style.display = '';
    ele.style.display = 'none';
}

function voteComment(id, ctype, vote) {
    if (!ctype) {
        ctype = (vote === 'support') ? '#st' : '#dt';
    }
    var i = document.querySelector(ctype + vote[0] + id).innerHTML;
    i = parseInt(i, 10) || 0;
    document.querySelector(ctype + vote[0] + id).innerHTML = i + 1;
    document.querySelector(ctype + id).removeAttribute('href');
    if (vote==='support') {
        document.querySelector(ctype + id).innerHTML = '已支持';
    } else {
        document.querySelector(ctype + id).innerHTML = '已反对';
    }
    var params = 'cmtid=' + id + '&action=' + vote; 
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
    xmlhttp.open('POST', commentFolder + '/addvote/');
    xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlhttp.send(params);
}

function cmt_reply(id,ctype) {
    var pl, usenicknamer;
    ctype = ctype || '';
    var replyBoxes = document.querySelectorAll('.replybox');
    for (var i=0; i<replyBoxes.length; i++) {
        replyBoxes[i].innerHTML = '';
    }
    if (!username) {
        pl = document.querySelector('#nologincomment').innerHTML
          .replace(/username1/g, 'username2')
          .replace(/password1/g, 'password2')
          .replace(/login\(1\)/g, 'login(2)');
        document.querySelector('#re' + ctype + id).innerHTML = pl;
    } else {
        document.querySelector('#re' + ctype + id).innerHTML = '<div id=reply-input-container><b>回复此评论：</b><input type="checkbox" id="anonymous-reply-checkbox" name="anonimous-reply-checkbox" checked="true"><label for="anonymous-reply-checkbox">匿名发表</label><textarea id="replycontent" class="commentTextArea" rows="3"></textarea><span style="display:none;"><input name="use_nicknamer" type="radio" id="namer" onclick="unuseitr(this);"/><label for="namer">匿名</label><input name="use_nicknamer" type="radio" id="useridr" value="0" onclick="useitr(this);" checked/><label for="useridr">昵称</label> <input type="text" class="user_id textinput" id="nick_namer" value="" /></span><input type="button" value="提交回复" class="comment_btn submitbutton button ui-light-btn" id="addnewcommentr"/></div>';
        document.querySelector('#nick_namer').value = document.querySelector('#nick_name').value;
        document.querySelector('#addnewcommentr').onclick = function() {
            usenicknamer = 0;
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        var data = this.responseText;
                        if (data !== 'yes') {
                            presentAlert('非常抱歉，现在我们的网站遇到一些技术故障。您的留言可能没有发表成功，稍后请您试着重新发表一次。', '');
                            return;
                        }
                        document.querySelector('#re' + ctype + id).innerHTML = '';
                        presentAlert('感谢您的参与，您的评论内容已经提交。审核后会立即显示出来！', '');
                    } else { 
                        document.querySelector('#re' + ctype + id).innerHTML = '';
                        presentAlert('很抱歉。由于您的网络的连接发生故障，发表评论失败。稍后请您试着重新发表一次。', '');
                    }
                }
            };
            var isAnomymous = (document.querySelector('#anonymous-reply-checkbox') && document.querySelector('#anonymous-reply-checkbox').checked) ? 1 : 0;
            var nickname = (isAnomymous === 1) ? '匿名用户' : document.querySelector('#nick_namer').value;
            var params = 'storyid=' + window.readingid + '&topic_object_id=' + window.readingid + '&talk=' + document.querySelector('#replycontent').value + '&use_nickname=' + isAnomymous + '&NickName=' + nickname + '&cmtid=' + id + '&type=' + ctype + '&title=&url=';
            xmlhttp.open('POST', commentFolder + '/add');
            xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xmlhttp.send(params);
            this.disabled = true;
        };
    }
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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status !== 'ok') {
                presentAlert('抱歉,现在我们的网站可能出现了一些小故障.您的留言可能没有发表成功,请您稍后再重新尝试发表一次。', '');
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

