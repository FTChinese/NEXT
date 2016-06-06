/* exported isIE, initSlideShow*/

function recordpv2() {
var hasad='';
var ads = document.querySelectorAll('.mpu-container iframe, .banner-content iframe');
var i;
for (i=0; i<ads.length; i++) {
ads[i].contentWindow.location.reload(true);
hasad = 1;
}
if (hasad===1) {
try{
ga('send', 'pageview');
fa('send', 'pageview');
imgLog(logurl);
}catch(err){
console.log ('ga not sent');
}
}
}

//(function(d) {var b = d.getElementsByTagName('body')[0];b.className = b.className + ' demo-js';})(document);

var gCurrentSlide = 0, gAllSlides = 0, gSlideId = '';
function isIE() { return ((navigator.appName === 'Microsoft Internet Explorer') || ((navigator.appName === 'Netscape') && (new RegExp('Trident/.*rv:([0-9]{1,}[\.0-9]{0,})').exec(navigator.userAgent) !== null)));}
function goToSlide(index) {
    var ele = document.querySelectorAll('#' + gSlideId + ' .o-gallery__item');
    for (var i=0; i<ele.length; i++) {
        ele[i].style.display = 'none';
    }
    ele[index].style.display = 'block';
    gCurrentSlide = index;
    recordpv2();
}
function nextSlide(step) {
    gCurrentSlide = gCurrentSlide + step;
    if (gCurrentSlide === -1) {
        gCurrentSlide = gAllSlides -1;
    } else if (gCurrentSlide >= gAllSlides) {
        gCurrentSlide = 0;
    }
    goToSlide(gCurrentSlide);
}
function initSlideShow (id) {
    var arrowsStyle = {'position':'absolute','top':'50%','margin-top':'-31px','background-color':'#333','background-image':'url(http://static.ftchinese.com/img/nav_sprite.png)','color':'white','height':'62px','width':'44px','font-size':'60px','font-weight':'bold','line-height':'62px','cursor':'pointer','text-align':'center','display':'none'};
    var arrowLeft = {'left':0,'background-position':'0 0'};
    var arrowRight = {'right':0,'text-align':'right','background-position':'-44px 0'};
    gSlideId = id;
    gAllSlides = $('#' + id + ' .o-gallery__item').length;
    $('#' + id + ' .o-gallery__item').hide();
    $('#' + id + ' .o-gallery__item').eq(0).show();
    $('#' + id + ' .o-gallery__item').each(function (index){
        $(this).find('.o-gallery__item__caption').prepend(index + 1  + '/' + gAllSlides + ' ');
    });
    $('#' + id + ' .o-gallery__items').css('position','relative').append('<div id="arrow-prev"></div><div  id="arrow-next"></div>');
    $('#arrow-prev').css(arrowsStyle).css(arrowLeft);
    $('#arrow-next').css(arrowsStyle).css(arrowRight);

    $('#arrow-prev,#arrow-next').bind('click',function(){
        var arrowId=$(this).attr('id');
        if (arrowId === 'arrow-prev') {
            nextSlide(-1);
        } else {
            nextSlide(1);
        }
    });
    $('#' + id).hover(
        function(){
            $('#arrow-prev,#arrow-next').show();
        },
        function(){
            $('#arrow-prev,#arrow-next').hide();
        }
    );
    $('#more-photo-slides').show();
    $('#more-photo-slides .o-gallery__item').css({'display':'inline-block','width':'125px','vertical-align':'top'}).slice(7,14).hide();
    $('.o-gallery--thumbnails.o-gallery--more').css({'margin':'14px auto','width':'969px','background':'transparent'});
}