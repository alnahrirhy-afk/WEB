// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function(){
  // المتغيرات العامة
  const modals = {};
  let activeModal = null;
  
  // تهيئة المودال
  function initModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      const id = modal.id;
      const triggers = Array.from(document.querySelectorAll(`[data-modal="${id}"]`));
      modals[id] = {
        element: modal,
        closeBtn: modal.querySelector('.modal-close'),
        triggers
      };

      // أزرار الفتح
      if(modals[id].triggers && modals[id].triggers.length){
        modals[id].triggers.forEach(t => t.addEventListener('click', (e) => {
          // determine country id from nearest .country-card or data-country or fallback
          const countryId = (t.closest && t.closest('.country-card') && t.closest('.country-card').dataset.country) || t.dataset.country || id.replace('-details','');
          showModal(id, countryId);
        }));
      }

      // زر الإغلاق
      if(modals[id].closeBtn) {
        modals[id].closeBtn.addEventListener('click', () => hideModal(id));
      }

      // إغلاق عند النقر على الخلفية (overlay)
      modal.addEventListener('click', function(e){
        if(e.target === modal){
          hideModal(id);
        }
      });
    });
  }
  
  // عرض المودال
  // cache for country lists per language
  const countryCache = {};
  // currently displayed country id inside modal (used to refresh on language change)
  let currentModalCountryId = null;

  async function fetchCountriesFor(lang){
    if(countryCache[lang]) return countryCache[lang];
    try{
      const resp = await fetch(`/data/countries_${lang}.json`);
      const list = await resp.json();
      countryCache[lang] = list;
      return list;
    }catch(e){
      console.warn('failed to load countries for', lang, e);
      return null;
    }
  }

  // showModal accepts optional countryId to populate modal dynamically
  async function showModal(id, countryId){
    if(!modals[id]) return;
    const modalObj = modals[id];
    // try to populate modal content from language data if possible
    try{
      const lang = (window.i18n && window.i18n.current) || localStorage.getItem('lang') || 'ar';
      const list = await fetchCountriesFor(lang);
      if(list && countryId){
        const item = list.find(c => c.id === countryId);
        if(item){
          // fill modal panel with a historical-styled card
          const panel = modalObj.element.querySelector('.modal-panel') || modalObj.element;
          const content = `
            <div class="country-details" style="direction:${lang==='ar'?'rtl':'ltr'};text-align:${lang==='ar'?'right':'left'}">
              <header style="text-align:${lang==='ar'?'right':'left'}">
                <h2 style="color:var(--gold);">${item.name}</h2>
                <p class="period">${item.period}</p>
              </header>
              <div style="display:flex;gap:1rem;align-items:flex-start;flex-wrap:wrap">
                <div style="flex:1;min-width:210px">
                  <img src="${item.image||'assets/map_high.svg'}" alt="${item.name}" style="width:100%;border-radius:8px;object-fit:cover">
                </div>
                <div style="flex:2;min-width:240px">
                  <p><strong>${lang==='ar'?'العاصمة':'Capitale'}:</strong> ${item.capital || '-'}</p>
                  <p><strong>${lang==='ar'?'المؤسس':'Fondatore'}:</strong> ${item.founder || '-'}</p>
                  <h4 style="margin-top:8px">${lang==='ar'?'أهم الإنجازات':'Principali risultati'}:</h4>
                  <ul>${(item.achievements||[]).map(a=>`<li>${a}</li>`).join('')}</ul>
                </div>
              </div>
              <section style="margin-top:12px">
                <p>${item.description || ''}</p>
              </section>
              <div style="text-align:${lang==='ar'?'right':'left'};margin-top:12px">
                <button class="btn ghost modal-close-inline" style="background:#a57b42;color:#fff;border:0;padding:0.6rem 0.9rem;border-radius:8px">${lang==='ar'?'إغلاق':'Chiudi'}</button>
              </div>
            </div>
          `;
          panel.innerHTML = content;
          // wire the inline close button
          const inlineClose = panel.querySelector('.modal-close-inline');
          if(inlineClose) inlineClose.addEventListener('click', () => hideModal(id));
          // remember which country is currently shown so we can refresh when language changes
          currentModalCountryId = countryId;
        }
      }
    }catch(err){
      console.warn('populate modal error', err);
    }

    // finally show modal
    if(activeModal) {
      hideModal(activeModal);
    }
    modalObj.element.hidden = false;
    activeModal = id;
    initTabs(modalObj.element);
  }
  
  // إخفاء المودال
  function hideModal(id) {
    if(modals[id]) {
      modals[id].element.hidden = true;
      if(activeModal === id) {
        activeModal = null;
      }
    }
  }
  
  // تهيئة التابز
  function initTabs(container) {
    const tabs = container.querySelectorAll('[role="tab"]');
    const panels = container.querySelectorAll('[role="tabpanel"]');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // إخفاء كل Panels
        panels.forEach(panel => panel.hidden = true);
        
        // إلغاء تحديد كل Tabs
        tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
        
        // عرض Panel المحدد
        const panelId = tab.getAttribute('aria-controls');
        const panel = container.querySelector(`#${panelId}`);
        if(panel) {
          panel.hidden = false;
          tab.setAttribute('aria-selected', 'true');
        }
      });
    });
    
    // تفعيل أول تاب
    if(tabs[0]) {
      tabs[0].click();
    }
  }
  
  // تهيئة القائمة المتحركة
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.nav-links');
  if(toggle && menu){
    toggle.addEventListener('click', function(){
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', !expanded);
      if(menu.style.display === 'flex'){
        menu.style.display = '';
      } else {
        menu.style.display = 'flex';
        menu.style.flexDirection = 'column';
      }
    });
  }

  // نهيئ المودالات بعد تعريف الدوال
  try{
    initModals();
  }catch(e){
    console.warn('initModals error', e);
  }

  // إغلاق المودال عند الضغط على Escape
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && activeModal){
      hideModal(activeModal);
    }
  });

  // عندما تتغير اللغة، نمسح الكاش ونعيد تحميل محتوى المودال المفتوح (إن وُجد)
  window.addEventListener('langChanged', function(e){
    try{
      for(const k in countryCache) delete countryCache[k];
      if(activeModal && currentModalCountryId){
        // re-populate the modal content for the new language
        showModal(activeModal, currentModalCountryId);
      }
    }catch(err){
      console.warn('langChanged handler error', err);
    }
  });

  // close mobile menu when a nav link is clicked
  var navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(function(a){
    a.addEventListener('click', function(){
      if(menu && window.getComputedStyle(document.querySelector('.nav-toggle')).display !== 'none'){
        menu.style.display = '';
        if(toggle) toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Smooth scroll for primary CTA
  var cta = document.querySelector('.btn.primary');
  if(cta){
    cta.addEventListener('click', function(e){
      e.preventDefault();
      var target = document.querySelector(this.getAttribute('href'));
      if(target){
        target.scrollIntoView({behavior:'smooth'});
      }
    });
  }

  // Watch intro (placeholder) - can be wired to modal/video later
  var watch = document.getElementById('watchIntro');
  if(watch){
    var modal = document.getElementById('introModal');
    var closeBtn = modal && modal.querySelector('.modal-close');
    watch.addEventListener('click', function(){
      if(modal){
        modal.hidden = false;
        // move focus into modal
        modal.querySelector('.modal-panel').focus();
      } else {
        alert('عرض المقدمة قيد الإعداد. سيتم فتح فيديو هنا لاحقًا.');
      }
    });
    if(closeBtn){
      closeBtn.addEventListener('click', function(){
        modal.hidden = true;
        watch.focus();
      });
    }
    // Close modal with Escape
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && modal && !modal.hidden){
        modal.hidden = true;
        watch.focus();
      }
    });
  }

  // ---------------------------
  // بروفايل المستخدم وميزة تسجيل الخروج
  // ---------------------------
  try{
    // populate header avatar and dropdown
    const user = JSON.parse(localStorage.getItem('userData'));
    const avatarThumb = document.getElementById('avatarThumb');
    const avatarMenu = document.getElementById('avatar-menu');
    const avatarMenuImage = document.getElementById('avatarMenuImage');
    const avatarName = document.getElementById('avatarName');
    const avatarBadges = document.getElementById('avatarBadges');
    const logoutBtnHeader = document.querySelector('#avatar-menu #logoutBtn') || document.getElementById('logoutBtn');

    if(!user){
      // if not logged, show a generic avatar and link to login
      if(avatarThumb) avatarThumb.src = 'assets/images/hittin.png';
      if(avatarMenuImage) avatarMenuImage.src = 'assets/images/hittin.png';
      if(avatarName) avatarName.textContent = 'زائر';
      if(avatarBadges) avatarBadges.textContent = '';
      if(logoutBtnHeader){
        logoutBtnHeader.textContent = 'تسجيل الدخول';
        logoutBtnHeader.addEventListener('click', function(){
          window.location.href = 'login.html';
        });
      }
    } else {
      if(avatarThumb) avatarThumb.src = user.image || 'assets/images/hittin.png';
      if(avatarMenuImage) avatarMenuImage.src = user.image || 'assets/images/hittin.png';
      if(avatarName) avatarName.textContent = user.username || '—';

      // badges based on score (do not show the beginner badge on homepage)
      const quizScore = parseInt(localStorage.getItem('quizScore') || '0', 10);
      if(avatarBadges){
        avatarBadges.innerHTML = '';
        if(quizScore >= 80){
          const span = document.createElement('span'); span.textContent = '🏅 وسام القائد الذهبي'; avatarBadges.appendChild(span);
        } else if(quizScore >= 50){
          const span = document.createElement('span'); span.textContent = '🎖️ وسام الباحث الفضي'; avatarBadges.appendChild(span);
        }
        // scores below 50: intentionally leave avatarBadges empty (no "وسام المبتدئ")
      }

      if(logoutBtnHeader){
        logoutBtnHeader.textContent = 'تسجيل الخروج';
        logoutBtnHeader.addEventListener('click', function(){
          localStorage.removeItem('userData');
          window.location.href = 'login.html';
        });
      }
    }

    // avatar menu toggle
    const avatarBtn = document.getElementById('avatar-btn');
    if(avatarBtn && avatarMenu){
      avatarBtn.addEventListener('click', function(e){
        e.stopPropagation();
        const open = avatarMenu.hasAttribute('hidden') ? false : true;
        if(open){ avatarMenu.hidden = true; avatarBtn.setAttribute('aria-expanded','false'); }
        else { avatarMenu.hidden = false; avatarBtn.setAttribute('aria-expanded','true'); }
      });
      document.addEventListener('click', function(e){ if(!avatarMenu.contains(e.target) && e.target !== avatarBtn){ avatarMenu.hidden = true; avatarBtn.setAttribute('aria-expanded','false'); }});
    }
  }catch(err){
    console.warn('profile init error', err);
  }

  // react to profile changes (so header updates without reload)
  window.addEventListener('profileUpdated', function(e){
    try{
      const detail = e && e.detail ? e.detail : {};
      const avatarThumb = document.getElementById('avatarThumb');
      const avatarName = document.getElementById('avatarName');
      const avatarBadges = document.getElementById('avatarBadges');
      // reload stored userData
      const user = JSON.parse(localStorage.getItem('userData') || 'null');
      if(user && avatarThumb && user.image) avatarThumb.src = user.image;
      if(user && avatarName && (user.username || user.name)) avatarName.textContent = user.username || user.name;
      // badges recalculation
      if(avatarBadges){
        avatarBadges.innerHTML = '';
        const quizScore = parseInt(localStorage.getItem('quizScore') || '0', 10);
        if(quizScore >= 80){ const span = document.createElement('span'); span.textContent = '🏅 وسام القائد الذهبي'; avatarBadges.appendChild(span); }
        else if(quizScore >= 50){ const span = document.createElement('span'); span.textContent = '🎖️ وسام الباحث الفضي'; avatarBadges.appendChild(span); }
      }
    }catch(err){ console.warn('profileUpdated handler error', err); }
  });

});
