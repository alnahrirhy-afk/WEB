// Local Admin Authentication System - No Server Required
document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const ADMIN_PASSWORD = 'AhmedSara1603';
    const CLICK_WINDOW_MS = 2000; // 2 seconds for triple click
    const INACTIVITY_TIMEOUT = 600000; // 10 minutes inactivity logout
    const MAX_FAILED_ATTEMPTS = 3;
    const LOCKOUT_DURATION = 60000; // 1 minute lockout
    const STORAGE_PREFIX = 'islamicHistory_';
    
    // Internal state
    let clickTimestamps = [];
    let inactivityTimer = null;
    let failedAttempts = 0;
    let lockoutUntil = null;
    
    // Simple SHA-256 implementation for password hashing
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Password verification
    async function verifyPassword(inputPassword) {
        const hashedInput = await sha256(inputPassword);
        const hashedStored = await sha256(ADMIN_PASSWORD);
        return hashedInput === hashedStored;
    }
    
    // Session management
    function createSession() {
        const sessionData = {
            timestamp: Date.now(),
            authenticated: true
        };
        sessionStorage.setItem(STORAGE_PREFIX + 'session', JSON.stringify(sessionData));
        resetInactivityTimer();
    }
    
    function isValidSession() {
        const sessionData = sessionStorage.getItem(STORAGE_PREFIX + 'session');
        if (!sessionData) return false;
        
        try {
            const session = JSON.parse(sessionData);
            const now = Date.now();
            const sessionAge = now - session.timestamp;
            
            // Session expires after 10 minutes
            if (sessionAge > INACTIVITY_TIMEOUT) {
                clearSession();
                return false;
            }
            
            return session.authenticated === true;
        } catch (e) {
            clearSession();
            return false;
        }
    }
    
    function clearSession() {
        sessionStorage.removeItem(STORAGE_PREFIX + 'session');
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
            inactivityTimer = null;
        }
    }
    
    function resetInactivityTimer() {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            logout();
            showNotification('تم تسجيل الخروج تلقائياً بسبب عدم النشاط', 'warning');
        }, INACTIVITY_TIMEOUT);
    }
    
    // Create login popup
    function createLoginPopup() {
        const popup = document.createElement('div');
        popup.className = 'admin-login-popup';
        popup.setAttribute('role', 'dialog');
        popup.setAttribute('aria-modal', 'true');
        popup.setAttribute('id', 'hidden-admin-popup');
        
        popup.innerHTML = `
            <div class="popup-backdrop"></div>
            <div class="popup-inner">
                <div class="popup-header">
                    <i class="fas fa-shield-alt"></i>
                    <h3>دخول المالك</h3>
                </div>
                <form id="adminLoginForm">
                    <div class="form-group">
                        <input id="adminPassword" type="password" placeholder="أدخل كلمة المرور" aria-label="كلمة المرور" required>
                        <i class="fas fa-lock input-icon"></i>
                    </div>
                    <div class="popup-actions">
                        <button id="adminLoginBtn" type="submit" class="admin-btn admin-btn-primary">
                            <i class="fas fa-sign-in-alt"></i>
                            دخول
                        </button>
                        <button id="adminCancelBtn" type="button" class="admin-btn admin-btn-ghost">
                            <i class="fas fa-times"></i>
                            إلغاء
                        </button>
                    </div>
                    <div id="adminFeedback" aria-live="polite" class="feedback-message"></div>
                </form>
            </div>
        `;
        
        return popup;
    }
    
    // Create admin dashboard
    function createDashboard() {
        const dash = document.createElement('div');
        dash.className = 'admin-dashboard';
        dash.setAttribute('dir', 'rtl');
        
        dash.innerHTML = `
            <div class="admin-sidebar">
                <div class="admin-logo">
                    <i class="fas fa-shield-alt"></i>
                    <span>لوحة التحكم</span>
                    <button id="adminCloseBtn" class="admin-close-btn" aria-label="إغلاق لوحة التحكم">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <ul class="admin-nav">
                    <li class="admin-nav-item active" data-section="states">
                        <i class="fas fa-globe-asia"></i>
                        <span>الدول الإسلامية</span>
                    </li>
                    <li class="admin-nav-item" data-section="rulers">
                        <i class="fas fa-crown"></i>
                        <span>الحكام العظام</span>
                    </li>
                    <li class="admin-nav-item" data-section="quiz">
                        <i class="fas fa-question-circle"></i>
                        <span>الاختبارات</span>
                    </li>
                    <li class="admin-nav-item" data-section="book">
                        <i class="fas fa-book"></i>
                        <span>الكتاب التفاعلي</span>
                    </li>
                    <li class="admin-nav-item" data-section="settings">
                        <i class="fas fa-cog"></i>
                        <span>إعدادات الموقع</span>
                    </li>
                </ul>
                <div class="admin-footer">
                    <button id="adminLogout" class="admin-logout-btn">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </div>
            <div class="admin-content">
                <div class="admin-header">
                    <h2 class="admin-title">مرحباً بك في لوحة التحكم</h2>
                    <div class="admin-status">
                        <i class="fas fa-circle status-indicator"></i>
                        <span>متصل</span>
                    </div>
                </div>
                <div class="admin-main-content">
                    <!-- Dynamic content loads here -->
                </div>
            </div>
        `;
        
        return dash;
    }
    
    // Create and append elements
    const loginPopup = createLoginPopup();
    const dashboard = createDashboard();
    document.body.appendChild(loginPopup);
    document.body.appendChild(dashboard);
    
    // Triple-click detection on site logo
    function getLogoElement() {
        return document.getElementById('site-logo') || document.querySelector('.site-logo') || document.querySelector('.logo');
    }
    
    const logoEl = getLogoElement();
    if (logoEl) {
        logoEl.addEventListener('click', (e) => {
            // Visual feedback
            logoEl.classList.add('logo-clicked');
            setTimeout(() => logoEl.classList.remove('logo-clicked'), 160);
            
            const now = Date.now();
            clickTimestamps.push(now);
            // Keep only recent timestamps inside window
            clickTimestamps = clickTimestamps.filter(ts => now - ts <= CLICK_WINDOW_MS);
            
            if (clickTimestamps.length >= 3) {
                showLoginPopup();
                clickTimestamps = [];
            }
        }, { passive: true });
    }
    
    // Keyboard shortcut fallback
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && (e.key === 'A' || e.key === 'a')) {
            showLoginPopup();
        }
    });
    
    // Login form handling
    loginPopup.querySelector('#adminLoginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const passwordInput = loginPopup.querySelector('#adminPassword');
        const feedback = loginPopup.querySelector('#adminFeedback');
        const loginBtn = loginPopup.querySelector('#adminLoginBtn');
        const password = passwordInput.value.trim();
        
        if (!password) {
            showError(feedback, 'الرجاء إدخال كلمة المرور');
            return;
        }
        
        // Check if locked out
        if (lockoutUntil && Date.now() < lockoutUntil) {
            const remainingTime = Math.ceil((lockoutUntil - Date.now()) / 1000);
            showError(feedback, `تم قفل الدخول مؤقتاً. حاول مرة أخرى خلال ${remainingTime} ثانية`);
            return;
        }
        
        // Show loading state
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق...';
        feedback.textContent = '';
        
        try {
            const isValid = await verifyPassword(password);
            
            if (isValid) {
                // Success
                failedAttempts = 0;
                lockoutUntil = null;
                showSuccess(feedback, 'تم التحقق بنجاح. جاري فتح لوحة التحكم...');
                
                setTimeout(() => {
                    loginSuccess();
                }, 1000);
            } else {
                // Failed attempt
                failedAttempts++;
                const remainingAttempts = MAX_FAILED_ATTEMPTS - failedAttempts;
                
                if (remainingAttempts > 0) {
                    showError(feedback, `كلمة المرور غير صحيحة. ${remainingAttempts} محاولات متبقية`);
                    // Shake animation
                    loginPopup.classList.add('shake');
                    setTimeout(() => loginPopup.classList.remove('shake'), 500);
                } else {
                    // Lockout
                    lockoutUntil = Date.now() + LOCKOUT_DURATION;
                    showError(feedback, 'تم قفل الدخول مؤقتاً لمدة دقيقة واحدة');
                }
            }
        } catch (error) {
            console.error('Password verification error:', error);
            showError(feedback, 'حدث خطأ في التحقق. حاول مرة أخرى');
        } finally {
            // Reset button state
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> دخول';
        }
    });
    
    // Cancel button
    loginPopup.querySelector('#adminCancelBtn').addEventListener('click', () => {
        hideLoginPopup();
    });
    
    // Close dashboard button
    dashboard.querySelector('#adminCloseBtn').addEventListener('click', () => {
        logout();
    });
    
    // Logout button
    dashboard.querySelector('#adminLogout').addEventListener('click', () => {
        logout();
    });
    
    // Navigation handling
    dashboard.querySelector('.admin-nav').addEventListener('click', (e) => {
        const item = e.target.closest('.admin-nav-item');
        if (!item) return;
        
        const section = item.dataset.section;
        loadSection(section);
        
        // Update active state
        dashboard.querySelectorAll('.admin-nav-item').forEach(navItem => {
            navItem.classList.remove('active');
        });
        item.classList.add('active');
    });
    
    // Login success handler
    function loginSuccess() {
        createSession();
        hideLoginPopup();
        showDashboard();
        showNotification('تم تسجيل الدخول بنجاح', 'success');
        
        // Load initial section
        loadSection('states');
    }
    
    // Logout handler
    function logout() {
        clearSession();
        hideDashboard();
        showNotification('تم تسجيل الخروج بنجاح', 'success');
    }
    
    // Section loading
    function loadSection(sectionName) {
        const content = dashboard.querySelector('.admin-main-content');
        const title = dashboard.querySelector('.admin-title');
        
        switch (sectionName) {
            case 'states':
                title.textContent = 'إدارة الدول الإسلامية';
                content.innerHTML = createStatesSection();
                break;
            case 'rulers':
                title.textContent = 'إدارة الحكام العظام';
                content.innerHTML = createRulersSection();
                break;
            case 'quiz':
                title.textContent = 'إدارة الاختبارات';
                content.innerHTML = createQuizSection();
                break;
            case 'book':
                title.textContent = 'إدارة الكتاب التفاعلي';
                content.innerHTML = createBookSection();
                break;
            case 'settings':
                title.textContent = 'إعدادات الموقع';
                content.innerHTML = createSettingsSection();
                break;
        }
    }
    
    // Data storage system
    const DATA_KEYS = {
        states: 'islamic_states',
        rulers: 'great_rulers',
        quizzes: 'quiz_questions',
        book: 'book_pages',
        settings: 'site_settings'
    };

    // Load data from localStorage
    function loadData(key) {
        try {
            const data = localStorage.getItem(STORAGE_PREFIX + key);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading data:', e);
            return [];
        }
    }

    // Save data to localStorage
    function saveData(key, data) {
        try {
            localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving data:', e);
            showNotification('خطأ في حفظ البيانات', 'error');
            return false;
        }
    }

    // Export all data as JSON
    function exportData() {
        const allData = {
            states: loadData(DATA_KEYS.states),
            rulers: loadData(DATA_KEYS.rulers),
            quizzes: loadData(DATA_KEYS.quizzes),
            book: loadData(DATA_KEYS.book),
            settings: loadData(DATA_KEYS.settings),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `islamic-history-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('تم تصدير البيانات بنجاح', 'success');
    }

    // Import data from JSON file
    function importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Validate data structure
                    if (data.states && data.rulers && data.quizzes && data.book && data.settings) {
                        saveData(DATA_KEYS.states, data.states);
                        saveData(DATA_KEYS.rulers, data.rulers);
                        saveData(DATA_KEYS.quizzes, data.quizzes);
                        saveData(DATA_KEYS.book, data.book);
                        saveData(DATA_KEYS.settings, data.settings);
                        
                        showNotification('تم استيراد البيانات بنجاح', 'success');
                        
                        // Reload current section
                        const activeSection = dashboard.querySelector('.admin-nav-item.active');
                        if (activeSection) {
                            loadSection(activeSection.dataset.section);
                        }
                    } else {
                        showNotification('ملف البيانات غير صالح', 'error');
                    }
                } catch (error) {
                    console.error('Import error:', error);
                    showNotification('خطأ في قراءة ملف البيانات', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    // Section content creators
    function createStatesSection() {
        const states = loadData(DATA_KEYS.states);
        
        return `
            <div class="admin-section">
                <div class="section-header">
                    <h3>الدول الإسلامية</h3>
                    <div class="header-actions">
                        <button class="admin-btn admin-btn-success" onclick="exportData()">
                            <i class="fas fa-download"></i>
                            تصدير البيانات
                        </button>
                        <button class="admin-btn admin-btn-warning" onclick="importData()">
                            <i class="fas fa-upload"></i>
                            استيراد البيانات
                        </button>
                        <button class="admin-btn admin-btn-primary" onclick="openStateModal()">
                            <i class="fas fa-plus"></i>
                            إضافة دولة جديدة
                        </button>
                    </div>
                </div>
                <div class="admin-grid" id="statesGrid">
                    ${states.length > 0 ? states.map(state => `
                        <div class="admin-card" data-id="${state.id}">
                            <div class="card-header">
                                <h4>${state.name}</h4>
                                <div class="card-actions">
                                    <button class="btn-icon" onclick="editState('${state.id}')" title="تعديل">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon" onclick="deleteState('${state.id}')" title="حذف">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <p>${state.startYear} - ${state.endYear}</p>
                            <p class="card-description">${state.description}</p>
                            ${state.image ? `<img src="${state.image}" alt="${state.name}" class="card-image">` : ''}
                            <div class="card-status">
                                <span class="status-badge status-active">نشط</span>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="empty-state">
                            <i class="fas fa-globe-asia"></i>
                            <h3>لا توجد دول بعد</h3>
                            <p>ابدأ بإضافة أول دولة إسلامية إلى الموقع</p>
                            <button class="admin-btn admin-btn-primary" onclick="openStateModal()">
                                <i class="fas fa-plus"></i>
                                إضافة أول دولة
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;
    }
    
    function createRulersSection() {
        const rulers = loadData(DATA_KEYS.rulers);
        
        return `
            <div class="admin-section">
                <div class="section-header">
                    <h3>الحكام العظام</h3>
                    <div class="header-actions">
                        <button class="admin-btn admin-btn-success" onclick="exportData()">
                            <i class="fas fa-download"></i>
                            تصدير البيانات
                        </button>
                        <button class="admin-btn admin-btn-warning" onclick="importData()">
                            <i class="fas fa-upload"></i>
                            استيراد البيانات
                        </button>
                        <button class="admin-btn admin-btn-primary" onclick="openRulerModal()">
                            <i class="fas fa-plus"></i>
                            إضافة حاكم جديد
                        </button>
                    </div>
                </div>
                <div class="admin-grid" id="rulersGrid">
                    ${rulers.length > 0 ? rulers.map(ruler => `
                        <div class="admin-card" data-id="${ruler.id}">
                            <div class="card-header">
                                <h4>${ruler.name}</h4>
                                <div class="card-actions">
                                    <button class="btn-icon" onclick="editRuler('${ruler.id}')" title="تعديل">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon" onclick="deleteRuler('${ruler.id}')" title="حذف">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <p>${ruler.period}</p>
                            <p class="card-description">${ruler.biography}</p>
                            ${ruler.image ? `<img src="${ruler.image}" alt="${ruler.name}" class="card-image">` : ''}
                            <div class="card-status">
                                <span class="status-badge status-active">نشط</span>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="empty-state">
                            <i class="fas fa-crown"></i>
                            <h3>لا يوجد حكام بعد</h3>
                            <p>ابدأ بإضافة أول حاكم عظيم إلى الموقع</p>
                            <button class="admin-btn admin-btn-primary" onclick="openRulerModal()">
                                <i class="fas fa-plus"></i>
                                إضافة أول حاكم
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;
    }
    
    function createQuizSection() {
        const quizzes = loadData(DATA_KEYS.quizzes);
        
        return `
            <div class="admin-section">
                <div class="section-header">
                    <h3>الاختبارات</h3>
                    <div class="header-actions">
                        <button class="admin-btn admin-btn-success" onclick="exportData()">
                            <i class="fas fa-download"></i>
                            تصدير البيانات
                        </button>
                        <button class="admin-btn admin-btn-warning" onclick="importData()">
                            <i class="fas fa-upload"></i>
                            استيراد البيانات
                        </button>
                        <button class="admin-btn admin-btn-primary" onclick="openQuizModal()">
                            <i class="fas fa-plus"></i>
                            إضافة سؤال جديد
                        </button>
                    </div>
                </div>
                <div class="admin-list" id="quizzesList">
                    ${quizzes.length > 0 ? quizzes.map(quiz => `
                        <div class="admin-list-item" data-id="${quiz.id}">
                            <div class="item-content">
                                <h4>${quiz.question}</h4>
                                <p>الإجابة الصحيحة: ${quiz.correctAnswer}</p>
                                <p>المستوى: ${quiz.level} | النوع: ${quiz.type}</p>
                            </div>
                            <div class="item-actions">
                                <button class="btn-icon" onclick="editQuiz('${quiz.id}')" title="تعديل">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon" onclick="deleteQuiz('${quiz.id}')" title="حذف">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="empty-state">
                            <i class="fas fa-question-circle"></i>
                            <h3>لا توجد أسئلة بعد</h3>
                            <p>ابدأ بإضافة أول سؤال اختبار إلى الموقع</p>
                            <button class="admin-btn admin-btn-primary" onclick="openQuizModal()">
                                <i class="fas fa-plus"></i>
                                إضافة أول سؤال
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;
    }
    
    function createBookSection() {
        const pages = loadData(DATA_KEYS.book);
        
        return `
            <div class="admin-section">
                <div class="section-header">
                    <h3>الكتاب التفاعلي</h3>
                    <div class="header-actions">
                        <button class="admin-btn admin-btn-success" onclick="exportData()">
                            <i class="fas fa-download"></i>
                            تصدير البيانات
                        </button>
                        <button class="admin-btn admin-btn-warning" onclick="importData()">
                            <i class="fas fa-upload"></i>
                            استيراد البيانات
                        </button>
                        <button class="admin-btn admin-btn-success" onclick="publishChanges()">
                            <i class="fas fa-upload"></i>
                            نشر التغييرات
                        </button>
                        <button class="admin-btn admin-btn-primary" onclick="openBookModal()">
                            <i class="fas fa-plus"></i>
                            إضافة صفحة جديدة
                        </button>
                    </div>
                </div>
                <div class="admin-list" id="bookPagesList">
                    ${pages.length > 0 ? pages.map(page => `
                        <div class="admin-list-item" data-id="${page.id}">
                            <div class="item-content">
                                <h4>${page.title}</h4>
                                <p>الفصل: ${page.chapter} | الصفحة: ${page.pageNumber}</p>
                                <p class="item-preview">${page.content.substring(0, 100)}...</p>
                            </div>
                            <div class="item-actions">
                                <button class="btn-icon" onclick="editBookPage('${page.id}')" title="تعديل">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon" onclick="previewBookPage('${page.id}')" title="معاينة">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-icon" onclick="deleteBookPage('${page.id}')" title="حذف">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="empty-state">
                            <i class="fas fa-book"></i>
                            <h3>لا توجد صفحات بعد</h3>
                            <p>ابدأ بإضافة أول صفحة إلى الكتاب التفاعلي</p>
                            <button class="admin-btn admin-btn-primary" onclick="openBookModal()">
                                <i class="fas fa-plus"></i>
                                إضافة أول صفحة
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;
    }
    
    function createSettingsSection() {
        const settings = loadData(DATA_KEYS.settings)[0] || {
            siteTitle: 'تاريخ الدول الإسلامية وحكامها العظام',
            primaryColor: '#B58B2E',
            headingFont: 'Noto Kufi Arabic',
            logo: '',
            description: 'موقع تفاعلي لتاريخ الدول الإسلامية وحكامها العظام',
            contactEmail: '',
            socialLinks: {}
        };
        
        return `
            <div class="admin-section">
                <div class="section-header">
                    <h3>إعدادات الموقع</h3>
                    <div class="header-actions">
                        <button class="admin-btn admin-btn-success" onclick="exportData()">
                            <i class="fas fa-download"></i>
                            تصدير البيانات
                        </button>
                        <button class="admin-btn admin-btn-warning" onclick="importData()">
                            <i class="fas fa-upload"></i>
                            استيراد البيانات
                        </button>
                        <button class="admin-btn admin-btn-success" onclick="saveSettings()">
                            <i class="fas fa-save"></i>
                            حفظ التغييرات
                        </button>
                    </div>
                </div>
                <div class="admin-form">
                    <div class="form-group">
                        <label>اسم الموقع</label>
                        <input type="text" id="siteTitle" value="${settings.siteTitle}" placeholder="اسم الموقع">
                    </div>
                    <div class="form-group">
                        <label>وصف الموقع</label>
                        <textarea id="siteDescription" placeholder="وصف الموقع">${settings.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label>الألوان الرئيسية</label>
                        <input type="color" id="primaryColor" value="${settings.primaryColor}">
                    </div>
                    <div class="form-group">
                        <label>خط العناوين</label>
                        <select id="headingFont">
                            <option value="Noto Kufi Arabic" ${settings.headingFont === 'Noto Kufi Arabic' ? 'selected' : ''}>Noto Kufi Arabic</option>
                            <option value="Cairo" ${settings.headingFont === 'Cairo' ? 'selected' : ''}>Cairo</option>
                            <option value="Tajawal" ${settings.headingFont === 'Tajawal' ? 'selected' : ''}>Tajawal</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>صورة الشعار</label>
                        <input type="file" id="logoImage" accept="image/*">
                        ${settings.logo ? `<img src="${settings.logo}" alt="الشعار الحالي" class="current-logo">` : ''}
                    </div>
                    <div class="form-group">
                        <label>البريد الإلكتروني للتواصل</label>
                        <input type="email" id="contactEmail" value="${settings.contactEmail}" placeholder="البريد الإلكتروني">
                    </div>
                </div>
            </div>
        `;
    }
    
    // UI helpers
    function showLoginPopup() {
        loginPopup.classList.add('active');
        setTimeout(() => {
            loginPopup.querySelector('#adminPassword').focus();
        }, 100);
    }
    
    function hideLoginPopup() {
        loginPopup.classList.remove('active');
        loginPopup.querySelector('#adminPassword').value = '';
        loginPopup.querySelector('#adminFeedback').textContent = '';
    }
    
    function showDashboard() {
        dashboard.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function hideDashboard() {
        dashboard.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    function showError(element, message) {
        element.textContent = message;
        element.className = 'feedback-message error';
    }
    
    function showSuccess(element, message) {
        element.textContent = message;
        element.className = 'feedback-message success';
    }
    
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'times-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Event listeners for activity tracking
    ['click', 'keydown', 'mousemove', 'scroll'].forEach(event => {
        document.addEventListener(event, () => {
            if (isValidSession()) {
                resetInactivityTimer();
            }
        });
    });
    
    // Modal functions for all sections
    function openStateModal(stateId = null) {
        const state = stateId ? loadData(DATA_KEYS.states).find(s => s.id === stateId) : null;
        showModal('state', state);
    }

    function openRulerModal(rulerId = null) {
        const ruler = rulerId ? loadData(DATA_KEYS.rulers).find(r => r.id === rulerId) : null;
        showModal('ruler', ruler);
    }

    function openQuizModal(quizId = null) {
        const quiz = quizId ? loadData(DATA_KEYS.quizzes).find(q => q.id === quizId) : null;
        showModal('quiz', quiz);
    }

    function openBookModal(pageId = null) {
        const page = pageId ? loadData(DATA_KEYS.book).find(p => p.id === pageId) : null;
        showModal('book', page);
    }

    // Edit functions
    function editState(id) { openStateModal(id); }
    function editRuler(id) { openRulerModal(id); }
    function editQuiz(id) { openQuizModal(id); }
    function editBookPage(id) { openBookModal(id); }

    // Delete functions
    function deleteState(id) {
        if (confirm('هل أنت متأكد من حذف هذه الدولة؟')) {
            const states = loadData(DATA_KEYS.states);
            const updatedStates = states.filter(s => s.id !== id);
            if (saveData(DATA_KEYS.states, updatedStates)) {
                showNotification('تم حذف الدولة بنجاح', 'success');
                loadSection('states');
            }
        }
    }

    function deleteRuler(id) {
        if (confirm('هل أنت متأكد من حذف هذا الحاكم؟')) {
            const rulers = loadData(DATA_KEYS.rulers);
            const updatedRulers = rulers.filter(r => r.id !== id);
            if (saveData(DATA_KEYS.rulers, updatedRulers)) {
                showNotification('تم حذف الحاكم بنجاح', 'success');
                loadSection('rulers');
            }
        }
    }

    function deleteQuiz(id) {
        if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
            const quizzes = loadData(DATA_KEYS.quizzes);
            const updatedQuizzes = quizzes.filter(q => q.id !== id);
            if (saveData(DATA_KEYS.quizzes, updatedQuizzes)) {
                showNotification('تم حذف السؤال بنجاح', 'success');
                loadSection('quiz');
            }
        }
    }

    function deleteBookPage(id) {
        if (confirm('هل أنت متأكد من حذف هذه الصفحة؟')) {
            const pages = loadData(DATA_KEYS.book);
            const updatedPages = pages.filter(p => p.id !== id);
            if (saveData(DATA_KEYS.book, updatedPages)) {
                showNotification('تم حذف الصفحة بنجاح', 'success');
                loadSection('book');
            }
        }
    }

    // Preview function
    function previewBookPage(id) {
        const page = loadData(DATA_KEYS.book).find(p => p.id === id);
        if (page) {
            showPreviewModal(page);
        }
    }

    // Settings save function
    function saveSettings() {
        const settings = {
            siteTitle: document.getElementById('siteTitle').value,
            description: document.getElementById('siteDescription').value,
            primaryColor: document.getElementById('primaryColor').value,
            headingFont: document.getElementById('headingFont').value,
            contactEmail: document.getElementById('contactEmail').value,
            logo: document.querySelector('.current-logo')?.src || '',
            lastUpdated: new Date().toISOString()
        };

        if (saveData(DATA_KEYS.settings, [settings])) {
            showNotification('تم حفظ الإعدادات بنجاح', 'success');
        }
    }

    // Publish changes function
    function publishChanges() {
        showNotification('تم نشر التغييرات بنجاح', 'success');
    }

    // Modal system
    function showModal(type, data = null) {
        const modal = createModal(type, data);
        document.body.appendChild(modal);
        modal.classList.add('active');
        
        // Focus first input
        setTimeout(() => {
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    function createModal(type, data = null) {
        const modal = document.createElement('div');
        modal.className = 'admin-modal';
        modal.innerHTML = `
            <div class="admin-modal-content">
                <button class="admin-modal-close" onclick="closeModal(this)">×</button>
                <h3>${getModalTitle(type, data)}</h3>
                <form onsubmit="handleFormSubmit(event, '${type}', '${data?.id || ''}')">
                    ${getModalContent(type, data)}
                    <div class="modal-actions">
                        <button type="submit" class="admin-btn admin-btn-primary">
                            <i class="fas fa-save"></i>
                            ${data ? 'تحديث' : 'حفظ'}
                        </button>
                        <button type="button" class="admin-btn admin-btn-ghost" onclick="closeModal(this)">
                            <i class="fas fa-times"></i>
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        `;
        return modal;
    }

    function getModalTitle(type, data) {
        const titles = {
            state: data ? 'تعديل الدولة' : 'إضافة دولة جديدة',
            ruler: data ? 'تعديل الحاكم' : 'إضافة حاكم جديد',
            quiz: data ? 'تعديل السؤال' : 'إضافة سؤال جديد',
            book: data ? 'تعديل الصفحة' : 'إضافة صفحة جديدة'
        };
        return titles[type] || 'نموذج';
    }

    function getModalContent(type, data) {
        switch (type) {
            case 'state':
                return `
                    <div class="form-group">
                        <label>اسم الدولة *</label>
                        <input type="text" name="name" value="${data?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>سنة البداية *</label>
                        <input type="number" name="startYear" value="${data?.startYear || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>سنة النهاية *</label>
                        <input type="number" name="endYear" value="${data?.endYear || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>الوصف</label>
                        <textarea name="description" rows="4">${data?.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>صورة الدولة</label>
                        <input type="file" name="image" accept="image/*">
                        ${data?.image ? `<img src="${data.image}" alt="الصورة الحالية" class="current-image">` : ''}
                    </div>
                `;
            case 'ruler':
                return `
                    <div class="form-group">
                        <label>اسم الحاكم *</label>
                        <input type="text" name="name" value="${data?.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>فترة الحكم *</label>
                        <input type="text" name="period" value="${data?.period || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>السيرة الذاتية</label>
                        <textarea name="biography" rows="6">${data?.biography || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>صورة الحاكم</label>
                        <input type="file" name="image" accept="image/*">
                        ${data?.image ? `<img src="${data.image}" alt="الصورة الحالية" class="current-image">` : ''}
                    </div>
                `;
            case 'quiz':
                return `
                    <div class="form-group">
                        <label>السؤال *</label>
                        <textarea name="question" rows="3" required>${data?.question || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>الخيارات (مفصولة بفواصل) *</label>
                        <input type="text" name="options" value="${data?.options?.join(', ') || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>الإجابة الصحيحة *</label>
                        <input type="text" name="correctAnswer" value="${data?.correctAnswer || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>المستوى</label>
                        <select name="level">
                            <option value="مبتدئ" ${data?.level === 'مبتدئ' ? 'selected' : ''}>مبتدئ</option>
                            <option value="متوسط" ${data?.level === 'متوسط' ? 'selected' : ''}>متوسط</option>
                            <option value="متقدم" ${data?.level === 'متقدم' ? 'selected' : ''}>متقدم</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>نوع السؤال</label>
                        <select name="type">
                            <option value="تاريخي" ${data?.type === 'تاريخي' ? 'selected' : ''}>تاريخي</option>
                            <option value="جغرافي" ${data?.type === 'جغرافي' ? 'selected' : ''}>جغرافي</option>
                            <option value="ثقافي" ${data?.type === 'ثقافي' ? 'selected' : ''}>ثقافي</option>
                        </select>
                    </div>
                `;
            case 'book':
                return `
                    <div class="form-group">
                        <label>عنوان الصفحة *</label>
                        <input type="text" name="title" value="${data?.title || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>الفصل</label>
                        <input type="text" name="chapter" value="${data?.chapter || ''}">
                    </div>
                    <div class="form-group">
                        <label>رقم الصفحة</label>
                        <input type="number" name="pageNumber" value="${data?.pageNumber || ''}">
                    </div>
                    <div class="form-group">
                        <label>محتوى الصفحة *</label>
                        <textarea name="content" rows="8" required>${data?.content || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>وسائط إضافية</label>
                        <input type="file" name="media" accept="image/*,video/*" multiple>
                    </div>
                `;
            default:
                return '';
        }
    }

    function handleFormSubmit(event, type, id) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        
        // Process options for quiz
        if (type === 'quiz' && data.options) {
            data.options = data.options.split(',').map(opt => opt.trim());
        }

        // Add ID for updates
        if (id) {
            data.id = id;
        } else {
            data.id = Date.now().toString();
        }

        // Add timestamp
        data.lastUpdated = new Date().toISOString();

        // Save data
        const key = DATA_KEYS[type];
        const items = loadData(key);
        
        if (id) {
            // Update existing item
            const index = items.findIndex(item => item.id === id);
            if (index !== -1) {
                items[index] = { ...items[index], ...data };
            }
        } else {
            // Add new item
            items.push(data);
        }

        if (saveData(key, items)) {
            showNotification(`${id ? 'تم التحديث' : 'تم الحفظ'} بنجاح`, 'success');
            closeModal(event.target.closest('.admin-modal'));
            
            // Reload current section
            const activeSection = dashboard.querySelector('.admin-nav-item.active');
            if (activeSection) {
                loadSection(activeSection.dataset.section);
            }
        }
    }

    function closeModal(button) {
        const modal = button.closest('.admin-modal');
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }

    function showPreviewModal(page) {
        const modal = document.createElement('div');
        modal.className = 'admin-modal';
        modal.innerHTML = `
            <div class="admin-modal-content" style="max-width: 800px;">
                <button class="admin-modal-close" onclick="closeModal(this)">×</button>
                <h3>معاينة الصفحة: ${page.title}</h3>
                <div class="preview-content">
                    <h4>${page.title}</h4>
                    <p><strong>الفصل:</strong> ${page.chapter}</p>
                    <p><strong>الصفحة:</strong> ${page.pageNumber}</p>
                    <div class="content-preview">
                        ${page.content.replace(/\n/g, '<br>')}
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="admin-btn admin-btn-primary" onclick="closeModal(this)">
                        <i class="fas fa-times"></i>
                        إغلاق
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    // Initialize with sample data if empty
    function initializeSampleData() {
        // Initialize States
        const states = loadData(DATA_KEYS.states);
        if (states.length === 0) {
            const sampleStates = [
                {
                    id: '1',
                    name: 'الدولة العثمانية',
                    startYear: 1299,
                    endYear: 1924,
                    description: 'تأسست الدولة العثمانية عام 1299 على يد عثمان الأول، وامتدت أراضيها في ثلاث قارات حتى عام 1924. عُرفت بقوتها العسكرية وإنجازاتها المعمارية والثقافية.',
                    lastUpdated: new Date().toISOString()
                },
                {
                    id: '2',
                    name: 'الدولة الأموية',
                    startYear: 661,
                    endYear: 750,
                    description: 'أول خلافة وراثية في الإسلام، أسسها معاوية بن أبي سفيان عام 661م. امتد نفوذها من الأندلس غرباً إلى حدود الصين شرقاً.',
                    lastUpdated: new Date().toISOString()
                },
                {
                    id: '3',
                    name: 'الدولة العباسية',
                    startYear: 750,
                    endYear: 1258,
                    description: 'عصر ذهبي للحضارة الإسلامية، تميز بازدهار العلوم والفنون والترجمة. بلغت أوج قوتها في عهد هارون الرشيد والمأمون.',
                    lastUpdated: new Date().toISOString()
                }
            ];
            saveData(DATA_KEYS.states, sampleStates);
        }

        // Initialize Rulers
        const rulers = loadData(DATA_KEYS.rulers);
        if (rulers.length === 0) {
            const sampleRulers = [
                {
                    id: '1',
                    name: 'صلاح الدين الأيوبي',
                    period: '1171 - 1193',
                    biography: 'أسس الدولة الأيوبية، اشتهر بتحرير القدس من الصليبيين في معركة حطين عام 1187. كان قائداً عسكرياً بارعاً وحاكماً عادلاً.',
                    lastUpdated: new Date().toISOString()
                },
                {
                    id: '2',
                    name: 'محمد الفاتح',
                    period: '1451 - 1481',
                    biography: 'سلطان عثماني اشتهر بفتح القسطنطينية عام 1453، مما أنهى الإمبراطورية البيزنطية. كان عالماً ومحارباً في نفس الوقت.',
                    lastUpdated: new Date().toISOString()
                }
            ];
            saveData(DATA_KEYS.rulers, sampleRulers);
        }

        // Initialize Quizzes
        const quizzes = loadData(DATA_KEYS.quizzes);
        if (quizzes.length === 0) {
            const sampleQuizzes = [
                {
                    id: '1',
                    question: 'في أي عام تأسست الدولة العثمانية؟',
                    options: ['1299', '1326', '1453', '1517'],
                    correctAnswer: '1299',
                    level: 'مبتدئ',
                    type: 'تاريخي',
                    lastUpdated: new Date().toISOString()
                },
                {
                    id: '2',
                    question: 'من هو الحاكم الذي فتح القسطنطينية؟',
                    options: ['محمد الفاتح', 'سليمان القانوني', 'بايزيد الأول', 'مراد الثاني'],
                    correctAnswer: 'محمد الفاتح',
                    level: 'متوسط',
                    type: 'تاريخي',
                    lastUpdated: new Date().toISOString()
                }
            ];
            saveData(DATA_KEYS.quizzes, sampleQuizzes);
        }

        // Initialize Book Pages
        const bookPages = loadData(DATA_KEYS.book);
        if (bookPages.length === 0) {
            const samplePages = [
                {
                    id: '1',
                    title: 'مقدمة في التاريخ الإسلامي',
                    chapter: 'الفصل الأول',
                    pageNumber: 1,
                    content: 'التاريخ الإسلامي هو تاريخ الحضارة الإسلامية منذ بداية الدعوة الإسلامية على يد النبي محمد صلى الله عليه وسلم وحتى يومنا هذا. يشمل هذا التاريخ تطور الدولة الإسلامية وانتشار الإسلام في مختلف أنحاء العالم.\n\nبدأ التاريخ الإسلامي في شبه الجزيرة العربية في القرن السابع الميلادي، عندما بدأ النبي محمد صلى الله عليه وسلم دعوته للإسلام.',
                    lastUpdated: new Date().toISOString()
                },
                {
                    id: '2',
                    title: 'الدولة الأموية: التأسيس والانتصارات',
                    chapter: 'الفصل الثاني',
                    pageNumber: 15,
                    content: 'تأسست الدولة الأموية عام 661م على يد معاوية بن أبي سفيان، بعد أن تنازل الحسن بن علي عن الخلافة لمعاوية. كانت هذه أول خلافة وراثية في التاريخ الإسلامي.\n\nتميزت الدولة الأموية بالفتوحات الكبيرة والتوسع الجغرافي الهائل.',
                    lastUpdated: new Date().toISOString()
                }
            ];
            saveData(DATA_KEYS.book, samplePages);
        }

        // Initialize Settings
        const settings = loadData(DATA_KEYS.settings);
        if (settings.length === 0) {
            const defaultSettings = {
                siteTitle: 'تاريخ الدول الإسلامية وحكامها العظام',
                description: 'موقع تفاعلي لتاريخ الدول الإسلامية وحكامها العظام — خرائط، سير، واختبارات تفاعلية.',
                primaryColor: '#B58B2E',
                headingFont: 'Noto Kufi Arabic',
                contactEmail: 'admin@islamic-history.com',
                logo: '',
                lastUpdated: new Date().toISOString()
            };
            saveData(DATA_KEYS.settings, [defaultSettings]);
        }
    }

    // Check for existing session on page load
    if (isValidSession()) {
        initializeSampleData();
        showDashboard();
        loadSection('states');
    }
    
    // Prevent direct access to admin routes
    if (window.location.hash.includes('admin')) {
        window.location.hash = '';
    }
});