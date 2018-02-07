
// var itemHeadline = document.querySelectorAll('.item-headline');
// // 应该需要把user_id传给你吧，难道判断登录后，后台就能获得这个cookie？
// // 应该在模板中先是全部锁住，如果既登录又付费了，便把class替换掉
// // 获取包含locked的class名，然后替换
// // 目前在首页能获取paywall模板值么？
//   function payWall(){  
//     var xhrpw = new XMLHttpRequest();
//     xhrpw.open('get', '/index.php/jsapi/paywall');
//     xhrpw.setRequestHeader('Content-Type', 'application/text');
//     xhrpw.onload = function() {
//         if (xhrpw.status === 200) {
//             var data = xhrpw.responseText;
//             var dataObj = JSON.parse(data); 
//             console.log('paywall'+data);
//             if (dataObj.paywall === 1) {
//                 console.log('get paywall1'+data);
//                 updateLockClass();
//             }
//         } else if (xhrpw.status !== 200) {
//             console.log('fail to get paywall');
//         }
//     };
//     xhrpw.send(null);
//   }
// var userId = GetCookie('USER_ID') || GetCookie('uniqueVisitorId');
// if (userId !== null) {
//   payWall();
// }
// console.log('userId:'+userId);


// payWall();

// var getPayHeadline = [];
// // 过滤出包含locked的item-headline数组
// function getPayStory(){
//   // 循环itemHeadline长度数量
//   for (let i = 0; i < itemHeadline.length; i++) {
//         var childNodes = itemHeadline[i].children;
//         // 循环childNodes长度数量
//         for (let j = 0; j < childNodes.length; j++) {
//           if (hasClass(childNodes[j],'locked')){
//             getPayHeadline.push(childNodes[j]);
//           }
//         }
//   }
//   // console.log(getPayHeadline);
// }
// getPayStory();
// // 过滤出包含a的子节点，然后用过滤出的节点增加class
// // function getHeadlineA(ele,clsName){
// //     var childNodes = ele.children;   //HTMLCollection
// //     for (let i = 0; i < childNodes.length; i++) {
// //       if (childNodes[i].tagName.toLowerCase()=='a'){
// //         addClass(childNodes[i], clsName);
// //       }
// //     } 
// // }
// function updateLockClass(){
//     if (getPayHeadline.length>0){
//       for (let i = 0; i < getPayHeadline.length; i++) {
//         removeClass(getPayHeadline[i], 'locked');
//         addClass(getPayHeadline[i], 'unlocked');
//       }
//     }
// }
// // updateLockClass();
// function hasClass(ele, cls) {
//   cls = cls || '';
//   if (cls.replace(/\s/g, '').length === 0) {
//     return false; //当cls没有参数时，返回false
//   }else{
//     return new RegExp(' ' + cls + ' ').test(' ' + ele.className + ' ');
//   }

// }
 
// function addClass(ele, cls) {
//   if (!hasClass(ele, cls)) {
//     ele.className = ele.className === '' ? cls : ele.className + ' ' + cls;
//   }
// }
 
// function removeClass(ele, cls) {
//   if (hasClass(ele, cls)) {
//     var newClass = ' ' + ele.className.replace(/[\t\r\n]/g, '') + ' ';
//     while (newClass.indexOf(' ' + cls + ' ') >= 0) {
//       newClass = newClass.replace(' ' + cls + ' ', ' ');
//     }
//     ele.className = newClass.replace(/^\s+|\s+$/g, '');
//   }
// }