document.addEventListener('DOMContentLoaded', function(){
  const form = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const avatarInput = document.getElementById('avatar');
  const warning = document.getElementById('warning');

  function showWarning(msg){
    warning.hidden = false;
    document.addEventListener('DOMContentLoaded', function(){
      const form = document.getElementById('loginForm');
      const usernameInput = document.getElementById('username');
      const passwordInput = document.getElementById('password');
      const avatarInput = document.getElementById('avatar');
      const warning = document.getElementById('warning');
      const languageSelect = document.getElementById('languageSelect');
      const loginTitle = document.getElementById('loginTitle');
      const loginLead = document.getElementById('loginLead');
      const usernameLabel = document.getElementById('usernameLabel');
      const passwordLabel = document.getElementById('passwordLabel');
      const avatarLabel = document.getElementById('avatarLabel');
      const btnLogin = document.getElementById('btnLogin');
      const languageLabel = document.getElementById('languageLabel');

      // ترجمة بسيطة للنصوص
      const translations = {
        document.addEventListener('DOMContentLoaded', function(){
          const form = document.getElementById('loginForm');
          const usernameInput = document.getElementById('username');
          const passwordInput = document.getElementById('password');
          const avatarInput = document.getElementById('avatar');
          const warning = document.getElementById('warning');
          const languageSelect = document.getElementById('languageSelect');
          const loginTitle = document.getElementById('loginTitle');
          const loginLead = document.getElementById('loginLead');
          const usernameLabel = document.getElementById('usernameLabel');
          const passwordLabel = document.getElementById('passwordLabel');
          const avatarLabel = document.getElementById('avatarLabel');
          const btnLogin = document.getElementById('btnLogin');
          const languageLabel = document.getElementById('languageLabel');

          // ترجمة بسيطة للنصوص
          const translations = {
            ar: {
              loginTitle: 'تسجيل الدخول إلى موقع التاريخ الإسلامي',
              loginLead: 'أدخل اسم المستخدم وكلمة المرور للمتابعة',
              username: 'اسم المستخدم',
              password: 'كلمة المرور',
              avatar: 'صورة الملف الشخصي (اختياري)',
              language: 'اللغة',
              loginBtn: 'تسجيل الدخول',
              missing: 'يرجى إدخال اسم المستخدم وكلمة المرور.'
            },
            it: {
              loginTitle: 'Accesso al sito di storia islamica',
              loginLead: 'Inserisci nome utente e password per continuare',
              username: 'Nome utente',
              password: 'Password',
              avatar: 'Immagine profilo (opzionale)',
              language: 'Lingua',
              loginBtn: 'Accedi',
              missing: 'Per favore inserisci nome utente e password.'
            },
            en: {
              loginTitle: 'Login to Islamic History site',
              loginLead: 'Enter username and password to continue',
              username: 'Username',
              password: 'Password',
              avatar: 'Profile image (optional)',
              language: 'Language',
              loginBtn: 'Login',
              missing: 'Please enter username and password.'
            }
          };

          function applyLanguage(lang){
            const t = translations[lang] || translations['ar'];
            if(loginTitle) loginTitle.textContent = t.loginTitle;
            if(loginLead) loginLead.textContent = t.loginLead;
            if(usernameLabel) usernameLabel.textContent = t.username;
            if(passwordLabel) passwordLabel.textContent = t.password;
            if(avatarLabel) avatarLabel.textContent = t.avatar;
            if(languageLabel) languageLabel.textContent = t.language;
            if(btnLogin) btnLogin.textContent = t.loginBtn;
          }

          // تعيين اللغة المبدئية
          const storedLang = localStorage.getItem('language') || 'ar';
          if(languageSelect){
            languageSelect.value = storedLang;
          }
          applyLanguage(storedLang);

          function showWarning(msg){
            if(!warning) return;
            warning.hidden = false;
            warning.textContent = msg;
          }
          function clearWarning(){
            if(!warning) return;
            warning.hidden = true;
            warning.textContent = '';
          }

          if(!form) return;

          form.addEventListener('submit', function(e){
            e.preventDefault();
            clearWarning();

            const username = (usernameInput.value || '').trim();
            const password = (passwordInput.value || '').trim();
            const lang = (languageSelect && languageSelect.value) || storedLang || 'ar';

            if(!username || !password){
              showWarning(translations[lang].missing || translations['ar'].missing);
              return;
            }

            const saveUser = (imageBase64) => {
              const userData = {
                username,
                password,
                image: imageBase64 || null,
                loggedAt: Date.now()
              };
              try{
                localStorage.setItem('userData', JSON.stringify(userData));
                localStorage.setItem('language', lang);
              }catch(err){
                console.warn('localStorage error', err);
              }
              // إعادة التوجيه إلى الصفحة الرئيسية بعد حفظ البيانات
              window.location.href = 'index.html';
            };

            const file = avatarInput.files && avatarInput.files[0];
            if(file){
              const reader = new FileReader();
              reader.onload = function(evt){
                const base64 = evt.target.result; // data:<type>;base64,...
                saveUser(base64);
              };
              reader.onerror = function(){
                // حتى لو فشل تحميل الصورة، نحفظ باقي البيانات
                saveUser(null);
              };
              reader.readAsDataURL(file);
            }else{
              saveUser(null);
            }
          });

          // تغيير اللغة يخزن الاختيار فوراً
          if(languageSelect){
            languageSelect.addEventListener('change', function(){
              const v = languageSelect.value || 'ar';
              localStorage.setItem('language', v);
              applyLanguage(v);
            });
          }

          // إذا كانت الجلسة محفوظة، يتجاوز صفحة الدخول مباشرة
          try{
            const existing = JSON.parse(localStorage.getItem('userData'));
            if(existing){
              window.location.href = 'index.html';
            }
          }catch(e){/* ignore */}

          // تجربة: الضغط على Enter في أي حقل يقدّم النموذج
          [usernameInput, passwordInput].forEach(inp => {
            if(!inp) return;
            inp.addEventListener('keydown', function(e){
              if(e.key === 'Enter'){
                e.preventDefault();
                form.requestSubmit();
              }
            });
          });
        });
            [usernameInput, passwordInput].forEach(inp => {
