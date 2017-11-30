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