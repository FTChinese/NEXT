// MARK: User Comments

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
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);
            var commentsBody = '';
            
            if (data.hot) {
                for (var i=0; i<data.hot.length; i++) {
                    var user_icon = '';
                    var isvip = '';
                    commentsBody += '<div class="commentcontainer">'
                                + user_icon + '<dt><div class="ding"></div><span>' 
                                + data.hot[i].dnewdate + '</span><b>' 
                                + data.hot[i].nickname.replace(/<[Aa] .+>(.+)<\/[Aa]>/g, '$1') 
                                + isvip + '</b> <font class="grey">' 
                                + data.hot[i].user_area 
                                + '</font><img src=\'/phone/hot_1.gif\' width=\'22\' height=\'14\' /></dt><dd>' 
                                + data.hot[i].quote_content 
                                + data.hot[i].talk + '</dd><div class="replybox" id=reh' 
                                + data.hot[i].id + '></div><dt class=\'replycomment\'><a href=\'javascript:cmt_reply("' 
                                + data.hot[i].id + '","h");\'>回复</a> <a id=hst' 
                                + data.hot[i].id + ' href=\'javascript:voteComment("' 
                                + data.hot[i].id + '","#hst", "support");\'>支持</a>(<font id=\'hsts' 
                                + data.hot[i].id + '\' color=#BA2636>' 
                                + data.hot[i].support_count + '</font>) <a id=hdt' 
                                + data.hot[i].id + ' href=\'javascript:voteComment("' 
                                + data.hot[i].id + '","#hdt","disagree");\'>反对</a>(<font id=\'hdtd' 
                                + data.hot[i].id + '\'>' 
                                + data.hot[i].disagree_count + '</font>)</dt></div>';
                }
            }



            for (var i=0; i<data.result.length; i++) {
                var isvip = '';
                var user_icon = '';
                commentsBody += '<div class=commentcontainer>'
                            + user_icon + '<dt><span>' 
                            + data.result[i].dnewdate + '</span><b>' 
                            + data.result[i].nickname.replace(/<[Aa] .+>(.+)<\/[Aa]>/g, '$1') 
                            + isvip + '</b> <font class=grey>' 
                            + data.result[i].user_area + '</font><div class=clearfloat></div></dt><dd>' 
                            + data.result[i].quote_content 
                            + data.result[i].talk + '</dd><div class=replybox id=re' 
                            + data.result[i].id + '></div><dt class=replycomment><a href=\'javascript:cmt_reply("' 
                            + data.result[i].id + '","");\'>回复</a> <a id=st' 
                            + data.result[i].id + ' href=\'javascript:voteComment("' 
                            + data.result[i].id + '","#st","support");\'>支持</a>(<font id=\'sts' 
                            + data.result[i].id + '\'>' 
                            + data.result[i].support_count + '</font>) <a id=dt' 
                            + data.result[i].id + ' href=\'javascript:voteComment("' 
                            + data.result[i].id + '","#dt","disagree");\'>反对</a>(<font id=\'dtd' 
                            + data.result[i].id + '\'>' 
                            + data.result[i].disagree_count + '</font>)</dt></div>';
                window.unusedEntryIndex = i;
            }


            userCommentsEle.innerHTML = commentsBody;


            if ((data.count && data.count > 0) || type != 'story') {
                // $('#commentcount').html(' ( '+ data.count + ' ) ');
                // $('#commentcount2').html(' [  '+ data.count + ' 条 ] ');
                // $('#readercomment').html('评论[<font style=\'color:#9e2f50;\'>' + data.count + '条</font>]');
                // init_repeat_cmt();
                if (data.count > 20 || data.result.length > 20) {
                    commentnumber = data.count || data.result.length;
                    cftype = (type.indexOf('story') >= 0) ? 'story' : 'common';
                    cfoption = (type.indexOf('storyall') >= 0) ? type.replace(/storyall/g, '') : 1;
                    userCommentsEle.innerHTML += '<div class=fullcomments>'
                        +'<span class=viewfullcomments id=viewfullcomments>查看全部<span class=highlight>' 
                        + commentnumber + '</span>条评论 </span>'
                        +'<select class=commentsortby id=commentsortby value="'
                        +cfoption
                        +'">'
                        +'<option value=1 selected>最新的在上方</option>'
                        +'<option value=2>最早的在上方</option>'
                        +'<option value=3>按热门程度</option></select></div>';
                    
                    document.getElementById('viewfullcomments').onclick = function() {
                        commentsortby =  document.getElementById('commentsortby').value;
                        loadcomment(storyid, theid, cftype + 'all'+ commentsortby);
                    };
                    document.getElementById('commentsortby').onclick = function() {
                        commentsortby =  document.getElementById('commentsortby').value;
                        loadcomment(storyid, theid, cftype + 'all'+ commentsortby);
                    };
                }
            } else { 
                userCommentsEle.innerHTML = '';
            }



            


/*
            if ((data.count && data.count > 0) || type != 'story') {
                $('#commentcount').html(' ( '+ data.count + ' ) ');
                $('#commentcount2').html(' [  '+ data.count + ' 条 ] ');
                $('#readercomment').html('评论[<font style=\'color:#9e2f50;\'>' + data.count + '条</font>]');
                init_repeat_cmt();
                if (data.count > 20 || data.result.length > 20) {
                    commentnumber = data.count || data.result.length;
                    $('#' + theid).append('<div class=fullcomments>'
                        +'<span class=viewfullcomments>查看全部<span class=highlight>' 
                        + commentnumber + '</span>条评论 </span>'
                        +'<select class=commentsortby>'
                        +'<option value=1 selected>最新的在上方</option>'
                        +'<option value=2>最早的在上方</option>'
                        +'<option value=3>按热门程度</option></select></div>');
                    cfoption = (type.indexOf('storyall') >= 0) ? type.replace(/storyall/g, '') : 1;
                    cftype = (type.indexOf('story') >= 0) ? 'story' : 'common';
                    $('.commentsortby').val(cfoption);
                    $('.viewfullcomments').click(function() {
                        storyid = $('#cstoryid').val();
                        theid = $(this).parent().parent().attr('id');
                        commentsortby = $('.commentsortby').val();
                        loadcomment(storyid, theid, cftype + 'all'+ commentsortby);
                    });
                    $('.commentsortby').change(function() {
                        storyid = $('#cstoryid').val();
                        theid = $(this).parent().parent().attr('id');
                        commentsortby = $(this).val();

                        loadcomment(storyid, theid, cftype + 'all'+ commentsortby);
                    });
                }
            } else { 
                $('#' + theid).html('');
            }
*/


        }
        // if (this.status !== 200) {
        //     userCommentsEle.innerHTML = '<span class=\'error\'>' + '很抱歉。由于您与FT服务器之间的连接发生故障，' + '加载评论内容失败。请稍后再尝试。</span>';
        // }




    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();


}

function init_repeat_cmt() {
    var all_cmt;
    $('.cmt_quote').each(function() {
        if (this.parentNode.tagName.toUpperCase() == 'DD') {
            this.id = 'cmt_quote_'+ Math.round(Math.random() * 1000000);
            if (this.childNodes[0].className == 'cmt_quote') {
                this.childNodes[0].id = 'cmt_quote_child_'+ Math.round(Math.random() * 1000000);
            }
        }else {
            if (this.id != 'recommendcomment') {this.style.display = 'none';}
        }
    });
    $('div[id^=\'cmt_quote_child_\']').each(function() {
        this.style.display = '';
        if (this.childNodes[0].className == 'cmt_quote') {
            all_cmt = $('#'+ this.id + ' .cmt_quote').length;
            $('#'+ this.id).prepend('<p class=\'showcmt\'>重复 [ ' + all_cmt + ' ] 条引用已被隐藏,点击展开。</p>');
        }
    });
    $('.showcmt').click(function() {
        $('#'+ this.parentNode.id + ' .cmt_quote').css('display', '');
        this.style.display = 'none';
    });
}

function voteComment(id, ctype, vote) {
    if (!ctype) {ctype = (vote == 'support') ? '#st' : '#dt';}
    var i = $(ctype + vote[0] + id).html();
        i = parseInt(i, 10) || 0;
    $(ctype + vote[0] + id).html(i + 1);
    $('#st'+id+',#dt'+id).removeAttr('href');
    if (vote==='support') {$('#st'+id).html('已支持');} else {$('#st'+id).html('已反对');}
    $.post(commentfolder + '/addvote/', {cmtid: id, action: vote});
}

function cmt_reply(id,ctype) {
    var pl, usenicknamer;
    ctype = ctype || '';
    $('.replybox').empty();
    if (!username) {
        pl = $('#nologincomment').html()
          .replace(/username1/g, 'username2')
          .replace(/password1/g, 'password2')
          .replace(/login\(1\)/g, 'login(2)');
        $('#re' + ctype + id).html(pl);
    } else {
        $('#re' + ctype + id).html('<div id=reply-input-container><b>回复此评论：</b><textarea id="replycontent" class="commentTextArea" rows="3"></textarea><span style="display:none;"><input name="use_nicknamer" type="radio" id="namer" onclick="unuseitr(this);"/><label for="namer">匿名</label><input name="use_nicknamer" type="radio" id="useridr" value="0" onclick="useitr(this);" checked/><label for="useridr">昵称</label> <input type="text" class="user_id textinput" id="nick_namer" value="" /></span><input type="button" value="提交回复" class="comment_btn submitbutton button ui-light-btn" id="addnewcommentr"/></div>');

        $('#nick_namer').attr('value', $('#nick_name').val());
        $('#addnewcommentr').click(function() {
            usenicknamer = 0;
            $.ajax({
                type: 'POST',
                url: commentfolder + '/add',
                data: {storyid: readingid, topic_object_id: readingid, talk: $('#replycontent').val(), use_nickname: usenicknamer, NickName: $('#nick_namer').val()+osVersionMore, cmtid: id, type: 'video', title: '', url: ''} ,
                success: function(data) {
                    if (data != 'yes') {
                        alert('非常抱歉，现在我们的网站遇到一些技术故障。您的留言可能没有发表成功，稍后请您试着重新发表一次。');
                        return;
                    }
                    $('#re' + ctype + id).empty();
                    alert('感谢您的参与，您的评论内容已经提交。审核后会立即显示出来！');
                },
                error: function() {
                    alert('很抱歉。由于您的网络的连接发生故障，发表评论失败。稍后请您试着重新发表一次。');
                    $('#addnewcommentr').attr('disabled', false);
                    return;
                }
            });
            $(this).attr('disabled', true);
        });
        $('#closecomment').click(function() {
            $('.replybox').empty();
        });
    }
}
//读者评论