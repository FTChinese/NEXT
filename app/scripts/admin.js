var input = document.querySelector( '.inputfile' );
var label = document.querySelector('.inputfile-label');
var labelVal = label.innerHTML;
input.addEventListener( 'change', function( e ){
    var fileName = e.target.value.replace(/^.*\\/g, '');
    if( fileName) {
        label.innerHTML = fileName;
    } else {
        label.innerHTML = labelVal;
    }
});