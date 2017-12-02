/* jshint devel:true */
(function () {
'use strict';
    var isDisplayContactNumber=false;   
     $('body').on('click', '#inquiry-agent-call', function () {
         if(!isDisplayContactNumber){
            $('#inquiry-agent-contact-number').css('display','block');
            isDisplayContactNumber=true;
         }else{
             $('#inquiry-agent-contact-number').css('display','none');
            isDisplayContactNumber=false;
         }

    });

    $('body').on('blur', '#client-email', function () {
        checkUserName();
    });
    // $('body').on('blur', '#client-number', function () {
    //     checkTel();
    // });
 
    function isEmail(str){ 
        var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/; 
        return reg.test(str); 
    }
    // var isTrue = false
    function checkUserName(){
        var userName = $('#client-email').val();
        var isTrue = isEmail(userName);
        if (userName !== ''){
            if (isTrue === true){
                $('#client-email').css('background','#fff');
                // return;
            }else{
                $('#client-email').val('');//清空内容 
                $('#client-email').attr('placeholder','请输入正确格式邮箱！');
                $('#client-email').css('background','red');
            }
        }
    } 
 
    $('body').on('click', '#contact-agent-submit', function () {
        var name = $('#client-name').val(); 
        var number = $('#client-number').val(); 
        var email = $('#client-email').val(); 
        var message = $('#client-message').val(); 
        var propertyId = $('#propertyId').val(); 
        if (name === ''){
            // alert('请输入您的称呼');
            $('#client-name').val('');//清空内容 
            $('#client-name').attr('placeholder','请输入您的称呼！');
            $('#client-name').css('background','red');
        }else{
            $('#client-name').css('background','#fff');
        }
        if ((name !== '')){
            // alert('请您输入您的电子邮箱或者联系电话');
            if ((email === '')&&(number === '')){
                $('#user-hint').css('display', 'block');
                $('#client-name').css('background','#fff');
                $('#client-email').css('background','#fff');
                $('#client-email').attr('placeholder','Email');
            }
            if (number !== ''){
                $('#user-hint').css('display', 'none');
                $('#client-name').css('background','#fff');
                $('#client-email').css('background','#fff');
                $('#client-email').attr('placeholder','Email');
            }
            if (email !== ''){
                $('#user-hint').css('display', 'none');
                $('#client-name').css('background','#fff');
                $('#client-email').css('background','#fff');
                $('#client-email').attr('placeholder','Email');
            }
        }
        if ((name !== '')&&((number !== '')||(email !== ''))){
            $(this).html('正在提交...');
            $.ajax({
                type: 'post',
                url: '/api/inquiry/post',
                // dataType: 'text',
                data: {
                       name:name,
                       number:number,
                       email:email,
                       message:message,
                       propertyId:propertyId
                   },
                success: function(data) {
                    console.log('欢迎您！'+data);
                    $(this).html('欢迎您！'+name).unbind();
                },
                error: function() {
                     $(this).html('注册失败，请再次提交！');
                    return;
                }
            });
            
            $('#client-name').val('');
            $('#client-number').val('');
            $('#client-email').val('');
            
        }
        
    // function checkTel() {
    //   var obj = document.getElementById('client-number');
    //   var value = obj.value;
    //   var regTel2 = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test(value);
    //   if (value !== '') { 
    //     if (!regTel2) { 
    //     //   alert('电话号码输入有误！');
    //       $('#client-number').val('');//清空内容 
    //       $('#client-number').attr('placeholder','请输入正确电话号码！');
    //       $('#client-number').css('background','#FFEC1A');
    //       return ;
    //     }
    //   }
    // //   alert('电话号码输入正确！');
    //   $('#client-number').css('background','#fff');
    //   return true;
    // }
    });
   
})(); 