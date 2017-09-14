/* exported playVideoOnWifi */

// MARK: This is called by the native app to play the video automatically if the user is on wifi
function playVideoOnWifi() {
	if (window.gConnectionType === 'wifi') {
		if (document.getElementById('replaybtn')) {
			document.getElementById('replaybtn').click();
		} else {
			setTimeout(function(){
				playVideoOnWifi();
			}, 3000);
		}
	}
}