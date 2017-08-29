/* jshint devel:true */
(function () {
    'use strict';
//      $('body').on('click', '#thumbnail-a', function () { 
//            console.log( "thumbnail")
//      });
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
//      var isDisplayPriceRangeMenu=false;
     var priceRangeStartActive = false;
     var priceRangeEndActive = false;
//      $('#price-button').click(function () {
//         if(!isDisplayPriceRangeMenu){
//             $('#price-menu').css('display','block');
//             isDisplayPriceRangeMenu=true;
//          }else{
//              $('#price-menu').css('display','none');
//             isDisplayPriceRangeMenu=false;
//          }
//      });
     $('#price-start').click(function () {
            $('#price-range-menu').css('display','block');
            priceRangeStartActive = true;
     });
     $('#price-end').click(function () {
        $('#price-range-menu').css('display','block');
        priceRangeEndActive = true ;
     });
     $('#price-range-menu li').click(function(){ 
        if (priceRangeStartActive ) {
            $('#price-start').val($(this).find('.text-right').text());  
            $('#price-range-menu').css('display','none'); 
            priceRangeStartActive = false;
        }
        if (priceRangeEndActive ) {
            $('#price-end').val($(this).find('.text-right').text());  
            $('#price-range-menu').css('display','none');
            priceRangeEndActive = false ;
        }
         
     });
        

   
})(); 