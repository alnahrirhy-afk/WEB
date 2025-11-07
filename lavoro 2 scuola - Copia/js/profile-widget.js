// profile-widget.js - show avatar on index, dropdown, edit and logout actions
(function(){
  const STORAGE_KEY = 'siteUser';
  const widget = document.getElementById('profile-widget');
  const profileButton = document.getElementById('profile-button');
  const avatarImg = document.getElementById('profile-avatar');
  const dropdown = document.getElementById('profile-dropdown');
  const dropdownAvatar = document.getElementById('profile-dropdown-avatar');
  const profileName = document.getElementById('profile-name');
  const editBtn = document.getElementById('edit-profile');
  const logoutBtn = document.getElementById('logout');

  function loadUser(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return null;
    try{ return JSON.parse(raw); }catch(e){ return null }
  }

  // If no user, go to login page
  const user = loadUser();
  if(!user){
    // If current page is login.html, do nothing
    if(!/login\.html$/i.test(location.pathname)){
      location.href = 'login.html';
    }
    return;
  }

  // populate widget
  avatarImg.src = user.avatar || 'assets/images/default-avatar.svg';
  dropdownAvatar.src = user.avatar || 'assets/images/default-avatar.svg';
  profileName.textContent = user.name || 'مستخدم';
  widget.setAttribute('aria-hidden','false');

  // toggle dropdown
  profileButton.addEventListener('click',(e)=>{
    const open = profileButton.getAttribute('aria-expanded') === 'true';
    profileButton.setAttribute('aria-expanded', String(!open));
    if(open){ dropdown.hidden = true; }
    else { dropdown.hidden = false; }
  });

  // click outside closes dropdown
  document.addEventListener('click', (e)=>{
    if(!widget.contains(e.target)){
      dropdown.hidden = true;
      profileButton.setAttribute('aria-expanded','false');
    }
  });

  editBtn.addEventListener('click', ()=>{
    location.href = 'profile.html';
  });

  logoutBtn.addEventListener('click', ()=>{
    // clear storage fully as requested
    try{ localStorage.clear(); }catch(e){ console.warn(e); }
    location.href = 'login.html';
  });
})();
