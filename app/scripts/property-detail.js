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
    // var isLegalUser = true;
    $('body').on('blur', '#client-email', function () {
        checkUserName();
        // var userName = $('#client-email').val();
        // var isTrue = isEmail(userName)
        // if (userName != ''){
        //      $('#user-hint').css('display', 'block');
        //      if (isTrue === true){
        //         $('#client-email').css('background','#fff');
        //     }
        //     if (isTrue === false){
        //         $('#client-email').val('');//清空内容 
        //         $('#client-email').attr('placeholder','请输入正确格式邮箱！');
        //         $('#client-email').css('background','red');
        //         isLegalUser = false;
        //         return;
        //     }
        //     $.ajax({
        //         type: 'get',
        //         url: '/index.php/property/inquiry',
        //         success: function(data) {
        //             if (data === 'existence') {
        //                 $('#user-hint').html(''+userName+' 用户名已被注册');
        //                 isLegalUser = false;
        //                 return;
        //             }else{
        //                 $('#user-hint').html('用户名可用');
        //                 isLegalUser = true;
        //             }
        //         },
        //         error: function() {
        //             $('#user-hint').html('服务器未能正确响应');
        //             isLegalUser = false;
        //             return;
        //         }
        //     });
        // }
    });

 
    function isEmail(str){ 
        var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/; 
        return reg.test(str); 
    }

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
                $('#user-hint').html('请您输入您的电子邮箱或者联系电话?');
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
                url: '/index.php/property/inquiry',
                dataType: 'json',
                data: {
                       name:name,
                       number:number,
                       email:email,
                       message:message,
                       propertyId:propertyId
                   },
                success: function(data) {
                    if (data === 'existence') {
                        $(this).html('账号已存在，请重新输入！');
                        return;
                    }else{
                        console.log('欢迎您！'+data);
                        $(this).html('欢迎您！'+name).unbind();
                    }
                    
                },
                error: function() {
                     $(this).html('联系失败，请再次提交！');
                    return;
                }
            });
            
            $('#client-name').val('');
            $('#client-number').val('');
            $('#client-email').val('');
            
        }
        
    // var isExistNumber = true;
    // $('body').on('blur', '#client-number', function () {
    //     var number = $('#client-number').val();
    //     if (number != ''){
    //         $.ajax({
    //             type: 'get',
    //             url: '/index.php/property/inquiry',
    //             success: function(data) {
    //                 if (data === 'existence') {
    //                     $('#user-hint').html(''+number+' 电话账号已被注册');
    //                     isExistNumber = false;
    //                     return;
    //                 }else{
    //                     $('#user-hint').html('用户名可用');
    //                     isExistNumber = true;
    //                 }
    //             },
    //             error: function() {
    //                 $('#user-hint').html('服务器未能正确响应');
    //                 isExistNumber = false;
    //                 return;
    //             }
    //         });
    //     }
    // });



    });
   
})(); 