/* jshint devel:true */
(function () {

'use strict';

$('body').on('click', '#list-search-button', function () { 
    console.log( 'list-search-button');
    var propertyNature=$('#property-nature').val();
    var propertyPosition=$('#property-position').val();
    var bedNum=$('#bed-num').val();
    var bathNum=$('#bath-num').val();
    var priceUnit=$('#price-unit').val();
    var priceStart=$('#price-start').val();
    var priceEnd=$('#price-end').val();
   
    window.location = '/index.php/ft/property/list?property-nature='+propertyNature+'&property-position='+propertyPosition+'&bed-num='+bedNum+'&bath-num='+bathNum+'&price-unit='+priceUnit+'&price-start='+priceStart+'&price-end='+priceEnd;
});
  $('body').on('click', '.thumbnail', function () { 
         $($(this).parents().find('.ai-listing-detail-spa-container')).each(function(){
              $(this).hide();
              $(this).prev().find('.selected-listing-pointer').hide();
        });
        $(this).parent().parent().find('.ai-listing-detail-spa-container').show();
        $(this).next().show();
   });
// .ai-close-container a不能这么使

     $('body').on('click', '.ai-close-container', function () { 
         $(this).parent().parent().parent().hide();
        $(this).parent().parent().parent().parent().find('.selected-listing-pointer').hide();
     });

     
     $('#o-header-link-1').hover(function(){
        $('#o-header-mega-1').css('display','block');
    },function(){
        $('#o-header-mega-1').css('display','none');
    });
    $('#o-header-link-2').hover(function(){
        $('#o-header-mega-2').css('display','block');
    },function(){
        $('#o-header-mega-2').css('display','none');
    });

    var isDisplayContactNumber=false;   
     $('body').on('click', '.inquiry-agent-call', function () {
         if(!isDisplayContactNumber){
            $(this).next('#inquiry-agent-contact-number').css('display','block'); 
            isDisplayContactNumber=true;
         }else{
             $(this).next('#inquiry-agent-contact-number').css('display','none'); 
            isDisplayContactNumber=false;
         }

    });
    // $('body').on('click', '.nav-link', function () {
    //     $(this).attr('href','/index.php/ft/property/list');
    // });
    $('body').on('click', '#reset-search-data', function () { 
        // window.location = '/index.php/ft/property/list?';
        $(this).attr('href','/index.php/ft/property/list');
    });

    $('body').on('blur', '#client-email', function () {
        checkUserName();
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
    });

   
})(); 