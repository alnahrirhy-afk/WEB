// Interactive Book JS - Improved (finalized)
// Enhancements: richer pages, keyboard navigation, search debounce, flip sound, export/import admin, export history, admin shortcut, ARIA improvements

document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('.book-section');
  if (!section) return;

  // Default pages (editable via admin)
  const defaultPages = [
    { id: 'p1', title: 'مقدمة', content: `<p>تأسست الخلافات الإسلامية وتطورت مؤسساتها السياسية والثقافية عبر قرون من الفتوحات والتلاقح الحضاري. هذا الكتاب التفاعلي يقدّم نظرة موجزة على الدول الإسلامية وحكامها العظام.</p>` },
    { id: 'p2', title: 'الدولة الأموية', content: `
      <h4>لمحة</h4>
      <p>أسس معاوية بن أبي سفيان الدولة الأموية (661–750م). امتدت حدودها من الأندلس غربًا إلى حدود السند شرقًا، وتميزت بالعمران والاقتصاد.</p>
      <h4>إنجازات</h4>
      <ul>
        <li>تعريب الدواوين وسك العملة الإسلامية</li>
        <li>تأسيس البنى الإدارية المركزية</li>
        <li>بناء مساجد ومعالم معمارية في دمشق وحوض البحر المتوسط</li>
      </ul>
    `},
    { id: 'p3', title: 'الأندلس', content: `
      <h4>حضارة قرطبة</h4>
      <p>أصبحت قرطبة مركزًا حضريًا متقدمًا، واحتوت مكتبات كبيرة وأسواقًا وتطورت فيها العلوم والفنون.</p>
    `},
    { id: 'p4', title: 'الخلافة العباسية', content: `
      <h4>بغداد وبيت الحكمة</h4>
      <p>أسست بغداد كمركز علمي وتجاري، ونشطت حركة الترجمة والبحث في الطب والفلك والرياضيات.</p>
    `},
    { id: 'p5', title: 'الدولة الفاطمية', content: `
      <h4>القاهرة</h4>
      <p>أسس الفاطميون مدينة القاهرة وأنشأوا الأزهر كمؤسسة تعليمية دينية وعلمية.</p>
    `},
    { id: 'p6', title: 'الدولة الأيوبية', content: `
      <h4>صلاح الدين الأيوبي</h4>
      <p>قائد سياسي وعسكري وحد مصر والشام وحرر القدس عام 1187، وأجرى إصلاحات إدارية وعسكرية.</p>
    `},
    { id: 'p7', title: 'دولة المماليك', content: `
      <h4>قاهر المغول</h4>
      <p>هزم المماليك المغول في عين جالوت، وازدهرت العمارة والتعليم في مصر خلال حكمهم.</p>
    `},
    { id: 'p8', title: 'الدولة العثمانية', content: `
      <h4>الفتح والتوسع</h4>
      <p>امتد حكم العثمانيين لقرون، وميزت إدارتهم بالتنظيم العسكري والإداري.</p>
    `},
    { id: 'p9', title: 'العلوم والطب', content: `
      <h4>مساهمات علمية</h4>
      <p>برز علماء في الطب والفلك والرياضيات مثل الرازي والفرغاني والبتان.</p>
    `},
    { id: 'p10', title: 'العمارة الإسلامية', content: `
      <h4>معالم بارزة</h4>
      <p>قبة الصخرة، المسجد الأموي، الحمراء، وآثار المماليك — أمثلة لتطور الهندسة والزخرفة الإسلامية.</p>
    `},
    { id: 'p11', title: 'الفنون والآداب', content: `
      <h4>الأدب</h4>
      <p>تطورت أشكال الأدب والشعر وكتب التاريخ، وازدهرت المكتبات والمخطوطات.</p>
    `},
    { id: 'p12', title: 'الخط الزمني المختصر', content: `
      <h4>لمحة زمنية</h4>
      <ul>
        <li>661 - 750: الدولة الأموية</li>
        <li>750 - 1258: الدولة العباسية</li>
        <li>909 - 1171: الدولة الفاطمية</li>
        <li>1171 - 1250: الدولة الأيوبية</li>
        <li>1250 - 1517: دولة المماليك</li>
        <li>1299 - 1924: الدولة العثمانية</li>
      </ul>
    `},
    { id: 'p13', title: 'مصادر ومراجع', content: `
      <h4>للمتابعة</h4>
      <p>قائمة مراجع تشمل كتبًا ومقالات ومصادر أولية مفيدة للتوسع.</p>
    `}
  ];

  // Load pages from localStorage or default
  function loadPages() {
    try {
      const stored = JSON.parse(localStorage.getItem('interactiveBookPages'));
      if (Array.isArray(stored) && stored.length) return stored;
    } catch (e) { /* ignore */ }
    localStorage.setItem('interactiveBookPages', JSON.stringify(defaultPages));
    return defaultPages;
  }

  let pages = loadPages();
  let currentIndex = 0;
  let searchTimeout = null;
  let audioCtx = null;
  let soundEnabled = true;

  // Elements
  const wrap = document.createElement('div'); wrap.className = 'book-wrap';
  wrap.innerHTML = `
    <div class="book-header">
      <div class="book-title" id="bookTitle">كتاب: تاريخ الدول الإسلامية بالتفصيل</div>
      <div class="book-controls">
        <div class="book-search"><input id="bookSearch" placeholder="ابحث داخل الكتاب..." aria-label="بحث" /></div>
        <div class="page-indicator" aria-live="polite">الصفحة <span id="pageNumber">1</span> من <span id="pageTotal">${pages.length}</span></div>
        <button class="btn ghost" id="prevPage" aria-label="السابق">السابق</button>
        <button class="btn primary" id="nextPage" aria-label="التالي">التالي</button>
        <button class="btn ghost" id="fullscreenBtn" title="ملء الشاشة" aria-label="ملء الشاشة">⤢</button>
        <button class="btn ghost" id="soundToggle" title="تشغيل صوت قلب الصفحة" aria-pressed="true">🔊</button>
        <button class="bookmark" id="bookmarkBtn" title="حفظ كإشارة" aria-pressed="false">🔖</button>
        <button class="book-admin-btn" id="adminOpen">لوحة المالك</button>
      </div>
    </div>

    <div class="book-stage" role="region" aria-label="عرض الكتاب">
      <div class="book" id="book" role="application" aria-label="كتاب تفاعلي">
        <div class="page left" id="pageLeft" role="document" aria-label="صفحة يسار">
          <div class="page-content" id="leftContent"></div>
        </div>
        <div class="page right" id="pageRight" role="document" aria-label="صفحة يمين">
          <div class="page-content" id="rightContent"></div>
        </div>
      </div>
    </div>

    <div class="admin-modal" id="adminModal" role="dialog" aria-modal="true">
      <div class="admin-panel">
        <h3>لوحة المالك - تحرير الكتاب</h3>
        <div style="margin-bottom:8px">
          <input id="adminPass" type="password" placeholder="كلمة مرور المالك" style="padding:6px;border:1px solid #e6e2da;border-radius:6px;width:200px">
          <button class="btn primary" id="adminUnlock">فتح</button>
          <button class="btn ghost" id="adminClose">إغلاق</button>
        </div>
        <div id="adminArea" style="display:none">
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
            <select id="pageSelect" aria-label="اختيار الصفحة"></select>
            <button id="addPage" class="btn ghost">إضافة صفحة جديدة</button>
            <button id="deletePage" class="btn ghost">حذف الصفحة الحالية</button>
          </div>
          <div style="margin-top:8px">
            <input id="pageTitle" placeholder="عنوان الصفحة" style="width:100%;padding:8px;border:1px solid #e6e2da;border-radius:6px">
            <textarea id="pageContent" placeholder="محتوى الصفحة (HTML مسموح)" style="margin-top:8px"></textarea>
          </div>
          <div class="admin-actions" style="margin-top:8px;display:flex;gap:8px;justify-content:flex-end">
            <input id="setPass" type="password" placeholder="تعيين كلمة مرور جديدة" style="padding:6px;border:1px solid #e6e2da;border-radius:6px">
            <button id="savePass" class="btn ghost">تعيين كلمة المرور</button>
            <button id="savePage" class="btn primary">حفظ الصفحة</button>
          </div>

          <div style="margin-top:12px;border-top:1px dashed #eee;padding-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            <button id="exportJson" class="btn ghost">تصدير الكتاب (JSON)</button>
            <button id="showImport" class="btn ghost">استيراد/لصق JSON</button>
            <button id="showExportHistory" class="btn ghost">عرض محفوظات التصدير</button>
            <div id="importAreaWrap" style="display:none;margin-top:8px;width:100%">
              <textarea id="importArea" placeholder='الصق هنا JSON ثم اضغط استيراد' style="width:100%;min-height:120px"></textarea>
              <div style="margin-top:8px;display:flex;gap:8px;justify-content:flex-end">
                <button id="importJson" class="btn primary">استيراد JSON</button>
                <button id="cancelImport" class="btn ghost">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  section.appendChild(wrap);

  const leftContent = wrap.querySelector('#leftContent');
  const rightContent = wrap.querySelector('#rightContent');
  const pageNumber = wrap.querySelector('#pageNumber');
  const pageTotal = wrap.querySelector('#pageTotal');
  const prevBtn = wrap.querySelector('#prevPage');
  const nextBtn = wrap.querySelector('#nextPage');
  const fullscreenBtn = wrap.querySelector('#fullscreenBtn');
  const bookmarkBtn = wrap.querySelector('#bookmarkBtn');
  const searchInput = wrap.querySelector('#bookSearch');
  const soundToggle = wrap.querySelector('#soundToggle');

  const adminModal = wrap.querySelector('#adminModal');
  const adminUnlock = wrap.querySelector('#adminUnlock');
  const adminClose = wrap.querySelector('#adminClose');
  const adminArea = wrap.querySelector('#adminArea');
  const pageSelect = wrap.querySelector('#pageSelect');
  const pageTitle = wrap.querySelector('#pageTitle');
  const pageContent = wrap.querySelector('#pageContent');
  const savePage = wrap.querySelector('#savePage');
  const addPage = wrap.querySelector('#addPage');
  const deletePage = wrap.querySelector('#deletePage');
  const adminOpen = wrap.querySelector('#adminOpen');
  const setPass = wrap.querySelector('#setPass');
  const savePass = wrap.querySelector('#savePass');
  const exportJson = wrap.querySelector('#exportJson');
  const showImport = wrap.querySelector('#showImport');
  const importAreaWrap = wrap.querySelector('#importAreaWrap');
  const importArea = wrap.querySelector('#importArea');
  const importJson = wrap.querySelector('#importJson');
  const cancelImport = wrap.querySelector('#cancelImport');
  const showExportHistory = wrap.querySelector('#showExportHistory');

  // Rendering
  function renderSpread(index) {
    index = clampIndex(index);
    // left page = index, right page = index+1
    const leftIdx = index;
    const rightIdx = index + 1;

    pageTotal.textContent = pages.length;
    pageNumber.textContent = Math.min(leftIdx + 1, pages.length);

    leftContent.innerHTML = pages[leftIdx] ? `<h3>${pages[leftIdx].title}</h3>${pages[leftIdx].content}` : '';
    rightContent.innerHTML = pages[rightIdx] ? `<h3>${pages[rightIdx].title}</h3>${pages[rightIdx].content}` : '';

    // update bookmark state
    const bm = getBookmarks();
    const leftId = pages[leftIdx] && pages[leftIdx].id;
    if (leftId && bm.includes(leftId)) bookmarkBtn.classList.add('saved'); else bookmarkBtn.classList.remove('saved');

    // update pageSelect if open
    if (pageSelect) pageSelect.value = leftIdx;

    // announce page change for screen readers
    const title = pages[leftIdx] ? pages[leftIdx].title : '';
    wrap.querySelector('.page-indicator').setAttribute('aria-live', 'polite');
  }

  function clampIndex(i) { return Math.max(0, Math.min(i, pages.length - 1)); }

  function playFlipSound() {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'triangle';
      o.frequency.value = 700;
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.08, audioCtx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
      setTimeout(() => { try { o.stop(); } catch(e){} }, 400);
    } catch (e) { /* ignore audio errors */ }
  }

  function goNext() {
    playFlipSound();
    if (currentIndex + 2 < pages.length) {
      const right = wrap.querySelector('#pageRight');
      right.classList.remove('flip-prev');
      right.classList.add('flip-next');
      setTimeout(() => {
        right.classList.remove('flip-next');
        currentIndex += 2; renderSpread(currentIndex);
      }, 700);
    } else if (currentIndex + 1 < pages.length) {
      currentIndex += 1; renderSpread(currentIndex);
    }
  }

  function goPrev() {
    playFlipSound();
    if (currentIndex - 2 >= 0) {
      const left = wrap.querySelector('#pageLeft');
      left.classList.remove('flip-next');
      left.classList.add('flip-prev');
      setTimeout(() => {
        left.classList.remove('flip-prev');
        currentIndex -= 2; renderSpread(currentIndex);
      }, 700);
    } else if (currentIndex - 1 >= 0) {
      currentIndex -= 1; renderSpread(currentIndex);
    }
  }

  prevBtn.addEventListener('click', goPrev);
  nextBtn.addEventListener('click', goNext);

  // keyboard navigation (left/right) except when focusing inputs
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement && document.activeElement.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
  });

  // fullscreen
  fullscreenBtn.addEventListener('click', () => {
    const elem = wrap.querySelector('.book-stage');
    if (!document.fullscreenElement) elem.requestFullscreen().catch(()=>{});
    else document.exitFullscreen();
  });

  // sound toggle
  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled; soundToggle.textContent = soundEnabled ? '🔊' : '🔈';
    soundToggle.setAttribute('aria-pressed', soundEnabled ? 'true' : 'false');
  });

  // bookmarks
  function getBookmarks() { try { return JSON.parse(localStorage.getItem('bookmarks')||'[]'); } catch(e){return []} }
  function saveBookmarks(arr){ localStorage.setItem('bookmarks', JSON.stringify(arr)); }
  bookmarkBtn.addEventListener('click', () => {
    const id = pages[currentIndex] && pages[currentIndex].id;
    if (!id) return;
    const bm = getBookmarks();
    if (bm.includes(id)) { const idx = bm.indexOf(id); bm.splice(idx,1); } else bm.push(id);
    saveBookmarks(bm); bookmarkBtn.classList.toggle('saved');
    bookmarkBtn.setAttribute('aria-pressed', bookmarkBtn.classList.contains('saved') ? 'true' : 'false');
  });

  // search with debounce
  function doSearch(q) {
    const term = q.trim();
    if (!term) { pages = loadPages(); renderSpread(currentIndex); return; }
    const lower = term.toLowerCase();
    const matched = pages.map(p => {
      const contentText = (p.title + ' ' + (p.content||'')).toLowerCase();
      return contentText.includes(lower);
    });
    const first = matched.indexOf(true);
    if (first >= 0) currentIndex = first;
    const highlighted = loadPages().map(p => ({ ...p, content: p.content.replace(new RegExp(term, 'gi'), (m)=>`<mark>${m}</mark>`) }));
    pages = highlighted;
    renderSpread(currentIndex);
  }

  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const v = e.target.value;
    searchTimeout = setTimeout(() => doSearch(v), 250);
  });

  // Drag to flip (simple)
  let startX = 0, dragging = false;
  const stage = wrap.querySelector('.book-stage');
  stage.addEventListener('pointerdown', (e) => { startX = e.clientX; dragging = true; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointerup', (e) => { if (!dragging) return; dragging=false; const dx = e.clientX - startX; if (dx < -80) goNext(); else if (dx > 80) goPrev(); });

  // Admin: client-side password gate
  const ADMIN_PASS_KEY = 'interactiveBookAdminPass';
  function getAdminPass() { return localStorage.getItem(ADMIN_PASS_KEY) || 'ownerpass'; }
  function setAdminPass(val) { localStorage.setItem(ADMIN_PASS_KEY, val); }

  adminOpen.addEventListener('click', () => { adminModal.style.display='flex'; adminArea.style.display='none'; wrap.querySelector('#adminPass').focus(); });
  adminClose.addEventListener('click', () => { adminModal.style.display='none'; });

  adminUnlock.addEventListener('click', () => {
    const val = wrap.querySelector('#adminPass').value || '';
    if (val === getAdminPass()) {
      adminArea.style.display='block';
      populateAdmin();
      pageTitle.focus();
    } else {
      alert('كلمة المرور غير صحيحة');
    }
  });

  function populateAdmin() {
    const arr = loadPages();
    pageSelect.innerHTML = '';
    arr.forEach((p,i) => { const opt = document.createElement('option'); opt.value=i; opt.textContent = `${i+1} - ${p.title}`; pageSelect.appendChild(opt); });
    pageSelect.value = currentIndex;
    loadSelectedPage(currentIndex);
  }

  function loadSelectedPage(idx) {
    const p = pages[idx] || { title:'', content:'' };
    pageTitle.value = p.title || '';
    pageContent.value = p.content ? p.content.replace(/<[^>]*>/g, '') : '';
  }

  pageSelect.addEventListener('change', (e) => { loadSelectedPage(parseInt(e.target.value)); });

  savePage.addEventListener('click', () => {
    const idx = parseInt(pageSelect.value);
    const arr = loadPages();
    arr[idx].title = pageTitle.value || 'بدون عنوان';
    const html = pageContent.value.split('\n\n').map(p=>`<p>${p}</p>`).join('');
    arr[idx].content = html;
    localStorage.setItem('interactiveBookPages', JSON.stringify(arr));
    pages = loadPages();
    renderSpread(currentIndex);
    populateAdmin();
    alert('تم حفظ الصفحة');
  });

  addPage.addEventListener('click', () => {
    const arr = loadPages();
    const newPage = { id: 'p'+(Date.now()), title: 'صفحة جديدة', content: '<p>محتوى جديد</p>' };
    arr.push(newPage);
    localStorage.setItem('interactiveBookPages', JSON.stringify(arr));
    pages = loadPages();
    pageTotal.textContent = pages.length;
    populateAdmin();
    renderSpread(currentIndex);
  });

  deletePage.addEventListener('click', () => {
    if (!confirm('هل متأكد أنك تريد حذف هذه الصفحة؟')) return;
    const idx = parseInt(pageSelect.value);
    const arr = loadPages();
    arr.splice(idx,1);
    localStorage.setItem('interactiveBookPages', JSON.stringify(arr));
    pages = loadPages();
    currentIndex = Math.max(0, Math.min(currentIndex, pages.length-1));
    populateAdmin();
    renderSpread(currentIndex);
  });

  // Set admin password
  savePass.addEventListener('click', () => {
    const v = setPass.value || '';
    if (!v) { alert('أدخل كلمة مرور صالحة'); return; }
    setAdminPass(v);
    alert('تم تعيين كلمة المرور الجديدة');
    setPass.value = '';
  });

  // Export JSON
  exportJson.addEventListener('click', () => {
    const data = JSON.stringify(loadPages(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'interactive-book.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    // record export history (keep last 20)
    try {
      const hist = JSON.parse(localStorage.getItem('exportHistory') || '[]');
      hist.unshift({ date: new Date().toISOString(), filename: 'interactive-book.json' });
      localStorage.setItem('exportHistory', JSON.stringify(hist.slice(0, 20)));
    } catch (e) { /* ignore */ }
  });

  // show export history (simple alert list)
  if (showExportHistory) {
    showExportHistory.addEventListener('click', () => {
      try {
        const hist = JSON.parse(localStorage.getItem('exportHistory') || '[]');
        if (!hist.length) return alert('لا توجد محفوظات للتصدير');
        const lines = hist.map(h => `${new Date(h.date).toLocaleString()} — ${h.filename}`);
        alert(lines.join('\n'));
      } catch (e) { alert('لا يمكن جلب محفوظات التصدير'); }
    });
  }

  // Import UI
  showImport.addEventListener('click', () => { importAreaWrap.style.display = 'block'; importArea.focus(); });
  cancelImport.addEventListener('click', () => { importAreaWrap.style.display = 'none'; importArea.value = ''; });
  importJson.addEventListener('click', () => {
    try {
      const parsed = JSON.parse(importArea.value);
      if (!Array.isArray(parsed)) throw new Error('JSON يجب أن يحتوي مصفوفة من الصفحات');
      localStorage.setItem('interactiveBookPages', JSON.stringify(parsed));
      pages = loadPages();
      renderSpread(0);
      populateAdmin();
      importAreaWrap.style.display = 'none'; importArea.value = '';
      alert('تم استيراد الكتاب');
    } catch (e) { alert('خطأ في JSON: ' + e.message); }
  });

  // keyboard shortcut to open admin: Ctrl+Shift+A
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      adminModal.style.display = 'flex';
      adminArea.style.display = 'none';
      wrap.querySelector('#adminPass').focus();
    }
  });

  // initial render
  pages = loadPages();
  renderSpread(currentIndex);

});
