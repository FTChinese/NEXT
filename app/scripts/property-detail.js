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
   
})(); 