// Simple i18n loader (assets version): loads /assets/lang/{ar|it}.json and applies data-translate
(function(){
  const supported = ['ar','it'];
  const defaultLang = 'ar';
  // support older key 'language' (used by login script) and new 'lang'
  let current = localStorage.getItem('lang') || localStorage.getItem('language') || defaultLang;

  async function loadLanguage(lang){
    if(!supported.includes(lang)) lang = defaultLang;
    try{
      const res = await fetch(`/assets/lang/${lang}.json`);
      const translations = await res.json();
      // apply
      document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if(!key) return;
        if(translations[key]){
          el.textContent = translations[key];
        }
      });

      // set dir and font
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      if(lang === 'ar'){
        document.body.style.fontFamily = "'Cairo', 'Noto Kufi Arabic', sans-serif";
      } else {
        document.body.style.fontFamily = "'Poppins', system-ui, sans-serif";
      }

      // store both keys for compatibility
      localStorage.setItem('lang', lang);
      localStorage.setItem('language', lang);
      current = lang;
      // dispatch event
      window.dispatchEvent(new CustomEvent('langChanged', {detail: {lang}}));
    }catch(e){
      console.error('i18n load error', e);
    }
  }

  // toggle helper
  function toggleLang(){
    const newLang = (localStorage.getItem('lang') || current) === 'ar' ? 'it' : 'ar';
    loadLanguage(newLang);
  }

  // bind language menu items (buttons with data-lang)
  function bindLangMenu(){
    document.querySelectorAll('[data-lang]').forEach(btn => {
      btn.addEventListener('click', function(e){
        const l = btn.getAttribute('data-lang');
        if(l) loadLanguage(l);
      });
    });
    // toggle dropdown open/close for header button
    const langBtn = document.getElementById('lang-btn');
    const langMenu = document.getElementById('lang-menu');
    if(langBtn && langMenu){
      langBtn.addEventListener('click', function(e){
        const open = langMenu.hasAttribute('hidden') ? false : true;
        if(open){
          langMenu.hidden = true; langBtn.setAttribute('aria-expanded','false');
        } else {
          langMenu.hidden = false; langBtn.setAttribute('aria-expanded','true');
        }
      });
      // close when clicking outside
      document.addEventListener('click', function(e){
        if(!langMenu.contains(e.target) && e.target !== langBtn){
          langMenu.hidden = true; langBtn.setAttribute('aria-expanded','false');
        }
      });
    }
  }

  // expose to window
  window.i18n = {
    loadLanguage,
    toggleLang,
    get current(){return current}
  };

  // auto-load initial
  document.addEventListener('DOMContentLoaded', function(){
    const initial = localStorage.getItem('lang') || localStorage.getItem('language') || current;
    loadLanguage(initial);
    const btn = document.getElementById('lang-toggle');
    if(btn){ btn.addEventListener('click', function(){ toggleLang(); }); }
    bindLangMenu();
  });
})();
