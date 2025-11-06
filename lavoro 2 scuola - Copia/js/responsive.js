// responsive.js — hamburger toggle for .sidebar + overflow diagnostics
(function(){
  'use strict';

  // DIAGNOSTIC: find elements wider than viewport and log first 15
  function findOverflowEls(){
    try{
      const docW = document.documentElement.clientWidth;
      const els = Array.from(document.querySelectorAll('*')).filter(el => {
        // ignore html/body
        if(!el || !el.getBoundingClientRect) return false;
        // skip invisible elements
        const style = window.getComputedStyle(el);
        if(style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
        return el.scrollWidth > docW + 1; // small tolerance
      });
      const first = els.slice(0,15);
      if(first.length){
        console.warn('Responsive diagnostic — found overflow elements (first 15):', first);
        first.forEach(el => {
          console.warn('EL:', el, 'selector:', selectorFor(el), 'scrollWidth=', el.scrollWidth, 'viewport=', docW);
        });
      } else {
        console.info('Responsive diagnostic — no obvious overflow elements found');
      }
      return first;
    }catch(e){ console.error('diagnostic error', e); return []; }
  }

  function selectorFor(el){
    if(!(el instanceof Element)) return String(el);
    let sel = el.tagName.toLowerCase();
    if(el.id) sel += '#' + el.id;
    if(el.className && typeof el.className === 'string'){
      const cn = el.className.trim().split(/\s+/).slice(0,3).join('.');
      if(cn) sel += '.' + cn;
    }
    return sel;
  }

  // HAMBURGER / SIDEBAR TOGGLE
  function initHamburger(){
    document.addEventListener('DOMContentLoaded', function(){
      // create hamburger if not present
      if (!document.getElementById('hamburgerBtn')) {
        const btn = document.createElement('button');
        btn.id = 'hamburgerBtn';
        btn.className = 'hamburger';
        btn.setAttribute('aria-label','Open menu');
        // minimal inline style so no CSS changes required
        btn.style.cssText = 'position:fixed;left:12px;top:12px;z-index:1200;background:#fff;border:1px solid #ddd;border-radius:6px;padding:8px;font-size:20px;';
        btn.innerHTML = '☰';
        document.body.appendChild(btn);
      }

      const hamburger = document.getElementById('hamburgerBtn');
      const sidebar = document.querySelector('.sidebar');
      const body = document.documentElement;

      if (!sidebar || !hamburger) {
        // nothing to toggle — run diagnostic only
        // run diagnostic after short delay to let page layout settle
        setTimeout(findOverflowEls, 600);
        return;
      }

      // run diagnostic once on load
      setTimeout(findOverflowEls, 600);

      hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        body.classList.toggle('sidebar-opened');
      });

      // close sidebar when clicking outside on mobile
      document.addEventListener('click', (e) => {
        if (!sidebar.classList.contains('open')) return;
        if (hamburger.contains(e.target) || sidebar.contains(e.target)) return;
        sidebar.classList.remove('open');
        body.classList.remove('sidebar-opened');
      });

      // close on escape
      document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape'){
          sidebar.classList.remove('open');
          body.classList.remove('sidebar-opened');
        }
      });

    });
  }

  // expose diagnostic as global for manual re-run
  window.__findOverflowEls = findOverflowEls;
  initHamburger();
})();
