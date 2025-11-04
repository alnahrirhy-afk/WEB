// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function(){
  console.log('DOM loaded, initializing modals...');
  
  // عرض المودال
  function showModal(id) {
    console.log('Attempting to show modal:', id);
    
    // إخفاء جميع المودالات أولاً
    hideAllModals();
    
    // البحث عن المودال المطلوب
    const modal = document.getElementById(id);
    if (modal) {
      console.log('Modal found, showing...');
      modal.hidden = false;
      modal.style.display = 'flex';
      modal.classList.add('modal-active');
      
      // تهيئة التابز إذا وجدت
      initTabs(modal);
      
      // منع التمرير في الخلفية
      document.body.style.overflow = 'hidden';
    } else {
      console.error('Modal not found:', id);
    }
  }
  
  // إخفاء جميع المودالات
  function hideAllModals() {
    console.log('Hiding all modals...');
    const allModals = document.querySelectorAll('.modal');
    allModals.forEach(modal => {
      modal.hidden = true;
      modal.style.display = 'none';
      modal.classList.remove('modal-active');
    });
    
    // إعادة التمرير
    document.body.style.overflow = '';
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
  
  // إضافة معالجات الأحداث مباشرة
  document.addEventListener('click', function(e) {
    // فتح المودال عند النقر على أزرار المزيد
    if (e.target.matches('[data-modal]')) {
      e.preventDefault();
      e.stopPropagation();
      const modalId = e.target.getAttribute('data-modal');
      console.log('Button clicked, opening modal:', modalId);
      showModal(modalId);
    }
    
    // إغلاق المودال عند النقر على زر الإغلاق
    if (e.target.matches('.modal-close')) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Close button clicked');
      hideAllModals();
    }
    
    // إغلاق المودال عند النقر خارجها
    if (e.target.classList.contains('modal')) {
      hideAllModals();
    }
  });
  
  // إغلاق المودال بمفتاح Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      hideAllModals();
    }
  });
  
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
});