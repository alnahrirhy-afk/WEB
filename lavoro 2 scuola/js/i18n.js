// Consolidated i18n loader
// Loads /lang/{ar|it}.json and applies translations for [data-key] and [data-translate]
(function(){
	const LANG_DIR = '/lang';
	const DEFAULT = 'ar';

	async function loadLangData(lang){
		try{
			const res = await fetch(`${LANG_DIR}/${lang}.json`);
			if(!res.ok) throw new Error('failed to fetch '+res.status);
			return await res.json();
		}catch(err){
			console.error('loadLangData error', err);
			return null;
		}
	}

	async function applyLanguage(lang){
		const translations = await loadLangData(lang);
		if(!translations) return;

		// apply to data-key first (preferred), then data-translate for backward compatibility
		document.querySelectorAll('[data-key]').forEach(el => {
			const key = el.getAttribute('data-key');
			if(key && translations[key]) el.textContent = translations[key];
		});
		document.querySelectorAll('[data-translate]').forEach(el => {
			const key = el.getAttribute('data-translate');
			if(key && translations[key]) el.textContent = translations[key];
		});

	// direction and font class
	const isAr = (lang === 'ar');
	document.documentElement.dir = isAr ? 'rtl' : 'ltr';
	document.documentElement.lang = lang;
	// add language class so CSS can pick appropriate fonts
	document.body.classList.remove('lang-ar','lang-it');
	document.body.classList.add(isAr ? 'lang-ar' : 'lang-it');

		// persist choice (use key 'selectedLang' as requested)
		localStorage.setItem('selectedLang', lang);
		window.i18n = window.i18n || {};
		window.i18n.current = lang;
		window.dispatchEvent(new CustomEvent('langChanged', {detail:{lang}}));
	}

	// bind select and any data-lang buttons
	function bindControls(){
		const sel = document.getElementById('language-select');
		if(sel){
			sel.addEventListener('change', function(e){ applyLanguage(e.target.value); });
		}
		document.querySelectorAll('[data-lang]').forEach(btn => {
			btn.addEventListener('click', function(){
				const l = btn.getAttribute('data-lang'); if(l) applyLanguage(l);
			});
		});
	}

	// init on DOMContentLoaded
	document.addEventListener('DOMContentLoaded', async function(){
		bindControls();
		const saved = localStorage.getItem('selectedLang') || DEFAULT;
		// set select value if exists
		const sel = document.getElementById('language-select'); if(sel) sel.value = saved;
		await applyLanguage(saved);
	});

	// expose
	window.i18n = window.i18n || { applyLanguage };
})();

