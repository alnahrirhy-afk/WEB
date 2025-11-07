/* checkLogin.js
   Verifica ما إذا كان المستخدم مسجلاً في localStorage.
   - يدعم المفتاحين 'username' و 'userName' للاحتياط (توافق مع login.js القديم).
   - إذا لم يكن المستخدم مسجلاً ويُعرض صفحة غير login.html -> يعيد التوجيه إلى login.html
   - إذا كان المستخدم مسجلاً وكان على login.html -> يعيد التوجيه إلى index.html
*/
(function(){
  'use strict';

  // اجلب أي مفتاح معرف للمستخدم (دعم legacy والمفتاح المطلوب)
  function isLoggedIn(){
    return !!(localStorage.getItem('username') || localStorage.getItem('userName'));
  }

  // اسم الملف الحالي (مثال: index.html أو login.html)
  var path = location.pathname || '';
  var parts = path.split('/');
  var page = parts.pop() || parts.pop() || '';
  page = page.toLowerCase();

  // إذا الصفحة فارغة (قد يحدث عند فتح المجلد) نفترض index.html
  if(!page) page = 'index.html';

  try{
    if(isLoggedIn()){
      // إذا المستخدم مسجل مسبقًا وكان على صفحة تسجيل الدخول، ارسله إلى index
      if(page === 'login.html'){
        window.location.replace('index.html');
      }
      // وإلا اترك الصفحة تعمل كما هي
    }else{
      // غير مسجل: إذا لم يكن على صفحة تسجيل الدخول أعد التوجيه فورًا
      if(page !== 'login.html'){
        // استخدم replace لتجنب إضافة سجل جديد في التاريخ
        window.location.replace('login.html');
      }
    }
  }catch(e){
    // لا نريد أن يكسر أي شيء في الموقع الأصلي
    console.warn('checkLogin error', e);
  }

})();
