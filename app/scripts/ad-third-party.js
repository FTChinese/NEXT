/* exported adReachability,showTextImageForAd, gCanReplaceInstoryWithAd, gReplacedInstroyWithAd, getRandomInt */
var gCanReplaceInstoryWithAd = false;//表征文章内推荐块内容是否准备好，如果准备好，则可以将其用Ad替换
var gReplacedInstroyWithAd = false;//表征文章内推荐块内容已经用Ad替换
function adReachability() {
  return '';
}
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; 
}
