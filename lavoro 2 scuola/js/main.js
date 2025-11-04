// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function(){
  // المتغيرات العامة
  const modals = {};
  let activeModal = null;
  
  // تهيئة المودال
  function initModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      const id = modal.id;
      modals[id] = {
        element: modal,
        closeBtn: modal.querySelector('.modal-close'),
        trigger: document.querySelector(`[data-modal="${id}"]`)
      };
      
      // أزرار الفتح والإغلاق
      if(modals[id].trigger) {
        modals[id].trigger.addEventListener('click', () => showModal(id));
      }
      if(modals[id].closeBtn) {
        modals[id].closeBtn.addEventListener('click', () => hideModal(id));
      }
    });
  }
  
  // عرض المودال
  function showModal(id) {
    if(modals[id]) {
      if(activeModal) {
        hideModal(activeModal);
      }
      modals[id].element.hidden = false;
      activeModal = id;
      
      // تهيئة التابز إذا وجدت
      initTabs(modals[id].element);
    }
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
    const user = JSON.parse(localStorage.getItem('userData'));
    const profileEl = document.getElementById('userProfile');
    if(!user){
      // إذا لم يوجد مستخدم، نُخفي لوحة البروفايل إن وُجدت
      if(profileEl) profileEl.style.display = 'none';
    } else {
      if(profileEl) profileEl.style.display = 'flex';
      const nameEl = document.getElementById('userNameDisplay');
      const imageEl = document.getElementById('userImageDisplay');
      const badgesList = document.getElementById('badgesList');
      const achievementsTitle = document.getElementById('achievementsTitle');
      const logoutBtn = document.getElementById('logoutBtn');

      if(nameEl) nameEl.textContent = user.username || '';
      if(imageEl) imageEl.src = user.image || 'assets/images/hittin.png';

      // نظام الأوسمة المبسط بناءً على نتيجة الاختبار المخزنة
      const quizScore = parseInt(localStorage.getItem('quizScore') || '0', 10);
      if(badgesList){
        badgesList.innerHTML = '';
        if(quizScore >= 80){
          const li = document.createElement('li'); li.textContent = '🏅 وسام القائد الذهبي'; badgesList.appendChild(li);
        } else if(quizScore >= 50){
          const li = document.createElement('li'); li.textContent = '🎖️ وسام الباحث الفضي'; badgesList.appendChild(li);
        }
        // For scores below 50 we intentionally do not display the "وسام المبتدئ" beginner badge on the homepage.
      }

      // تبديل اللغة وفقًا لما تم حفظه
      const translations = {
        ar: { achievements: 'الإنجازات', logout: 'تسجيل الخروج', welcome: 'مرحباً بك' },
        it: { achievements: 'Risultati', logout: 'Disconnetti', welcome: 'Benvenuto' },
        en: { achievements: 'Achievements', logout: 'Logout', welcome: 'Welcome' }
      };
      const lang = localStorage.getItem('language') || 'ar';
      const t = translations[lang] || translations['ar'];
      if(achievementsTitle) achievementsTitle.textContent = t.achievements;
      if(logoutBtn) logoutBtn.textContent = t.logout;

      // زر تسجيل الخروج (يحذف بيانات المستخدم فقط، لا يمس اللغة)
      if(logoutBtn){
        logoutBtn.addEventListener('click', function(){
          localStorage.removeItem('userData');
          // نعيد التوجيه لصفحة الدخول
          window.location.href = 'login.html';
        });
      }
    }
  }catch(err){
    console.warn('profile init error', err);
  }

});