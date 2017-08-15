/* exported loadcomment, init_repeat_cmt, showcmt, voteComment, cmt_reply, login */
// MARK: User Comments

var commentfolder;
function loadcomment(storyid, theid, type) {
    var url, new_comment_prefix, common_comment_prefix, user_icon='', isvip, commentnumber, cfoption, cftype, commentsortby;
    new_comment_prefix = '/index.php/comments/newcommentsbysort/';
    common_comment_prefix = '/index.php/common_comments/newcommentsbysort/';
    switch (type) {
	    case 'story':
	    	commentfolder='/index.php/comments';
	    	url='/index.php/comments/newcomment/' + storyid;
	    	break;
	    case 'storyall1':
	    	url=new_comment_prefix+storyid+'/1?limit=0&rows=500';
	    	break;
	    case 'storyall2':
	    	url=new_comment_prefix+storyid+'/2?limit=0&rows=500';
	    	break;
	    case 'storyall3':
	    	url=new_comment_prefix+storyid+'/3?limit=0&rows=500';
	    	break;
	    case 'commonall1':
	    	url=common_comment_prefix+storyid+'/1?limit=0&rows=500';
      		break;
      		
      	case 'commonall2':
      		url=common_comment_prefix+storyid+'/2?limit=0&rows=500';
      		break;
      	case 'commonall3':
      		url=common_comment_prefix+storyid+'/3?limit=0&rows=500';
      		break;
      	default:
      		commentfolder='/index.php/common_comments';
      		url='/index.php/common_comments/newcomment/' + storyid;
    }
    new_comment_prefix = null;
    common_comment_prefix = null;

    // MARK: for the covenience of test
    if (window.location.hostname === 'localhost') {
        url = '/api/comments/story.json';
    }

    try {
        document.getElementById('cstoryid').value = storyid;
        window.readingid = storyid;
    } catch (ignore) {

    }

    var userCommentsEle = document.getElementById(theid);
    userCommentsEle.innerHTML = '正在获取本文读者评论的数据...';

    // MARK: Construct JSON request
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status === 200) {
                var data = JSON.parse(this.responseText);
                var commentsBody = '';
                
                if (data.hot) {
                    for (var i=0; i<data.hot.length; i++) {
                        user_icon = '';
                        isvip = '';
                        commentsBody += '<div class="commentcontainer">' + user_icon + '<dt><div class="ding"></div><span>' + data.hot[i].dnewdate + '</span><b>' + data.hot[i].nickname.replace(/<[Aa] .+>(.+)<\/[Aa]>/g, '$1') + isvip + '</b> <font class="grey">' + data.hot[i].user_area + '</font><img src=\'/phone/hot_1.gif\' width=\'22\' height=\'14\' /></dt><dd>' + data.hot[i].quote_content + data.hot[i].talk + '</dd><div class="replybox" id=reh' + data.hot[i].id + '></div><dt class=\'replycomment\'><a href=\'javascript:cmt_reply("' + data.hot[i].id + '","h");\'>回复</a> <a id=hst' + data.hot[i].id + ' href=\'javascript:voteComment("' + data.hot[i].id + '","#hst", "support");\'>支持</a>(<font id=\'hsts' + data.hot[i].id + '\' color=#BA2636>' + data.hot[i].support_count + '</font>) <a id=hdt' + data.hot[i].id + ' href=\'javascript:voteComment("' + data.hot[i].id + '","#hdt","disagree");\'>反对</a>(<font id=\'hdtd' + data.hot[i].id + '\'>' + data.hot[i].disagree_count + '</font>)</dt></div>';
                    }
                }

                for (var j=0; j<data.result.length; j++) {
                    isvip = '';
                    user_icon = '';
                    commentsBody += '<div class=commentcontainer>' + user_icon + '<dt><span>' + data.result[j].dnewdate + '</span><b>' + data.result[j].nickname.replace(/<[Aa] .+>(.+)<\/[Aa]>/g, '$1') + isvip + '</b> <font class=grey>' + data.result[j].user_area + '</font><div class=clearfloat></div></dt><dd>' + data.result[j].quote_content + data.result[j].talk + '</dd><div class=replybox id=re' + data.result[j].id + '></div><dt class=replycomment><a href=\'javascript:cmt_reply("' + data.result[j].id + '","");\'>回复</a> <a id=st' + data.result[j].id + ' href=\'javascript:voteComment("' + data.result[j].id + '","#st","support");\'>支持</a>(<font id=\'sts' + data.result[j].id + '\'>' + data.result[j].support_count + '</font>) <a id=dt' + data.result[j].id + ' href=\'javascript:voteComment("' + data.result[j].id + '","#dt","disagree");\'>反对</a>(<font id=\'dtd' + data.result[j].id + '\'>' + data.result[j].disagree_count + '</font>)</dt></div>';
                    window.unusedEntryIndex = j;
                }

                userCommentsEle.innerHTML = commentsBody;

                if ((data.count && data.count > 0) || type !== 'story') {
                    // $('#commentcount').html(' ( '+ data.count + ' ) ');
                    // $('#commentcount2').html(' [  '+ data.count + ' 条 ] ');
                    // $('#readercomment').html('评论[<font style=\'color:#9e2f50;\'>' + data.count + '条</font>]');
                    init_repeat_cmt();
                    if (data.count > 20 || data.result.length > 20) {
                        commentnumber = data.count || data.result.length;
                        cftype = (type.indexOf('story') >= 0) ? 'story' : 'common';
                        cfoption = (type.indexOf('storyall') >= 0) ? type.replace(/storyall/g, '') : 1;
                        userCommentsEle.innerHTML += '<div class=fullcomments>' + '<span class=viewfullcomments id=viewfullcomments>查看全部<span class=highlight>' + commentnumber + '</span>条评论 </span>' +'<select class=commentsortby id=commentsortby value="' + cfoption + '">' + '<option value=1 selected>最新的在上方</option>' + '<option value=2>最早的在上方</option>' + '<option value=3>按热门程度</option></select></div>';
                        
                        document.getElementById('viewfullcomments').onclick = function() {
                            commentsortby =  document.getElementById('commentsortby').value;
                            loadcomment(storyid, theid, cftype + 'all'+ commentsortby);
                        };
                        document.getElementById('commentsortby').onchange = function() {
                            commentsortby =  document.getElementById('commentsortby').value;
                            loadcomment(storyid, theid, cftype + 'all'+ commentsortby);
                        };
                    }
                } else { 
                    userCommentsEle.innerHTML = '';
                }
            } else {
                userCommentsEle.innerHTML = '<span class=\'error\'>' + '很抱歉。由于您与FT服务器之间的连接发生故障，' + '加载评论内容失败。请稍后再尝试。</span>';
            }
        }
    };

    xmlhttp.open('GET', url, true);
    xmlhttp.send();
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
    document.querySelector('#st'+id).removeAttribute('href');
    document.querySelector('#dt'+id).removeAttribute('href');
    if (vote==='support') {
        document.querySelector('#st'+id).innerHTML = '已支持';
    } else {
        document.querySelector('#dt'+id).innerHTML = '已反对';
    }
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
    xmlhttp.open('POST', commentfolder + '/addvote/');
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify({cmtid: id, action: vote}));
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
        document.querySelector('#re' + ctype + id).innerHTML = '<div id=reply-input-container><b>回复此评论：</b><textarea id="replycontent" class="commentTextArea" rows="3"></textarea><span style="display:none;"><input name="use_nicknamer" type="radio" id="namer" onclick="unuseitr(this);"/><label for="namer">匿名</label><input name="use_nicknamer" type="radio" id="useridr" value="0" onclick="useitr(this);" checked/><label for="useridr">昵称</label> <input type="text" class="user_id textinput" id="nick_namer" value="" /></span><input type="button" value="提交回复" class="comment_btn submitbutton button ui-light-btn" id="addnewcommentr"/></div>';
        document.querySelector('#nick_namer').value = document.querySelector('#nick_name').value;
        document.querySelector('#addnewcommentr').onclick = function() {
            usenicknamer = 0;
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        var data = JSON.parse(this.responseText);
                        if (data !== 'yes') {
                            alert('非常抱歉，现在我们的网站遇到一些技术故障。您的留言可能没有发表成功，稍后请您试着重新发表一次。');
                            return;
                        }
                        document.querySelector('#re' + ctype + id).innerHTML = '';
                        alert('感谢您的参与，您的评论内容已经提交。审核后会立即显示出来！');
                    } else { 
                        document.querySelector('#re' + ctype + id).innerHTML = '';
                        alert('很抱歉。由于您的网络的连接发生故障，发表评论失败。稍后请您试着重新发表一次。');
                    }
                }
            };
            var postData = {
                storyid: window.readingid, 
                topic_object_id: window.readingid, 
                talk: document.querySelector('#replycontent').value, 
                use_nickname: usenicknamer, 
                NickName: document.querySelector('#nick_namer').value, 
                cmtid: id, 
                type: ctype, 
                title: '', 
                url: ''
            };
            xmlhttp.open('POST', commentfolder + '/add');
            xmlhttp.setRequestHeader('Content-Type', 'application/json');
            xmlhttp.send(JSON.stringify(postData));
            $(this).attr('disabled', true);
        };
        document.querySelector('#closecomment').onclick = function() {
            document.querySelector('.replybox').innerHTML = '';
        };
    }
}








// MARK: User Login
function login(fromwhere) {
    var u, p;
    if (fromwhere !== undefined) {
        u = document.querySelector('#username'+ fromwhere).value;
        p = document.querySelector('#password'+ fromwhere).value;
    } else {
        u = document.querySelector('#username').value;
        p = document.querySelector('#password').value;
    }
    document.querySelector('.statusmsg').innerHTML = '正在登录中...';
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState === 4) {
            if (this.status === 200) {
                var l = JSON.parse(this.responseText);
                if (l.status && l.status === 'ok') {
                    document.querySelector('.statusmsg').innerHTML = '登录成功！';
                    var nonLoginEles = document.querySelectorAll('#logincomment, #logincommentc, #nologincomment, #nologincommentc, .logged, .notLogged');
                    for (var i=0; i<nonLoginEles.length; i++) {
                        nonLoginEles[i].style.display = 'none';
                    }
                    var loginEles = document.querySelectorAll('#nick_name,.user_id,.user_Name');
                    for (var j=0; j<loginEles; j++) {
                        loginEles[j].value = u;
                        loginEles[j].innerHTML = u;
                    }
                    var loginComments = document.querySelectorAll('#logincomment, #logincommentc, .logged');
                    for (var k=0; k<loginComments.length; k++) {
                        loginComments[k].style.display = 'block';
                    }
                    username = u;
                    document.querySelector('.statusmsg').innerHTML = '';
                } else {
                    document.querySelector('.statusmsg').innerHTML = '<div class="highlight">'+ l.msg + '</div>';
                }
            } else { 
                document.querySelector('.statusmsg').innerHTML = '<div class="highlight">对不起，网络故障。请过一段时间再重新尝试。</div>';
            }
        }
    };
    var postData = { username: u, password: p, saveme: 1};
    xmlhttp.open('POST', '/index.php/users/login/ajax');
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    xmlhttp.send(JSON.stringify(postData));
}

/*
function logout() {
    $('.logged .statusmsg').html('正在登出...');
    $.get('/index.php/users/logout?' + thed, function() {
        $('#logincomment,#nologincomment, .logged, .notLogged').hide();
        $('#nologincomment,.notLogged').show();
        username = '';
        closeOverlay();
        $('#setting').find('.standalonebutton').eq(0).find('button').html('登录');
    });
}

function checkLogin() {
    $('#logincomment, #nologincomment, .logged, .notLogged').hide();
    $('.statusmsg').empty();
    if (!!username) {
        $('#nick_name,.user_id,.user_Name').val(username).html(username);
        $('#logincomment,.logged').show();
        // $('#loginButton').removeClass("blue");
        $('#setting').find('.standalonebutton').eq(0).find('button').html('登出');
    }else {
        $('#nick_name').val('');
        $('#nologincomment,.notLogged').show();
        // $('#loginButton').addClass("blue");
        
    }
}
*/


//读者评论