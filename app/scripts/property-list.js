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
//           console.log("ai-close-container")
        $(this).parent().parent().parent().parent().find('.selected-listing-pointer').hide();
     });

     // var priceRangeStartActive = false;
     // var priceRangeEndActive = false;

     // $('#price-start').click(function () {
     //        $('#price-range-menu').css('display','block');
     //        $('#price-range-menu').css('left','10%');
     //        priceRangeStartActive = true;
     // });
     // $('#price-end').click(function () {
     //    $('#price-range-menu').css('display','block');
     //    $('#price-range-menu').css('left','60%');
     //    priceRangeEndActive = true ;
     // });
     // $('#price-range-menu li').click(function(){ 
     //    if (priceRangeStartActive ) {
     //        $('#price-start').val($(this).find('.text-right').text());  
     //        $('#price-range-menu').css('display','none'); 
     //        priceRangeStartActive = false;
     //    }
     //    if (priceRangeEndActive ) {
     //        $('#price-end').val($(this).find('.text-right').text());  
     //        $('#price-range-menu').css('display','none');
     //        priceRangeEndActive = false ;
     //    }
         
     // });
     
     $('#o-header-link-1').hover(function(){
        $('#o-header-mega-1').css('display','block');
        console.log('display');
    },function(){
        $('#o-header-mega-1').css('display','none');
    });
    $('#o-header-link-2').hover(function(){
        $('#o-header-mega-2').css('display','block');
        console.log('display');
    },function(){
        $('#o-header-mega-2').css('display','none');
    });

    var isDisplayContactNumber=false;   
     $('body').on('click', '.inquiry-agent-call', function () {
         if(!isDisplayContactNumber){
            $(this).next('#inquiry-agent-contact-number').css('display','block'); 
            // $('#inquiry-agent-contact-number').css('display','block');
            isDisplayContactNumber=true;
         }else{
             $(this).next('#inquiry-agent-contact-number').css('display','none'); 
            //  $('#inquiry-agent-contact-number').css('display','none');
            isDisplayContactNumber=false;
         }

    });
   
})(); 