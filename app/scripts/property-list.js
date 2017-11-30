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
        var isTrue = isEmail(userName)
        if (userName != ''){
            console.log("账户值"+ isTrue + userName)
            if (isTrue === true){
                $('#client-email').css('background','#fff');
                return;
            }else{
                $("#client-email").val("");//清空内容 
                $('#client-email').attr('placeholder','Please enter the correct format email');
                $('#client-email').css('background','#FFEC1A');
            }
        }
    } 
 
    $('body').on('click', '#contact-agent-submit', function () {
        var name = $('#client-name').val(); 
        var number = $('#client-number').val(); 
        var email = $('#client-email').val(); 
        if (name === ""){
            alert("请输入您的称呼");
        }
        if ((email === "")&&(number === "")){
            alert("请您输入您的电子邮箱或者联系电话");
        }
    });
    function checkTel() {
      var obj = document.getElementById("client-number");
      var value = obj.value;
      var regTel2 = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test(value);
      if (value != "") { 
        if (!regTel2) { 
          alert("电话号码输入有误！");
          return ;
        }
      }
      alert("电话号码输入正确！");
      return true;
    }
   
})(); 