// Profile page logic: load/save user info to localStorage
document.addEventListener('DOMContentLoaded', () => {
  const nameEl = document.getElementById('profile-name');
  const emailEl = document.getElementById('profile-email');
  const picEl = document.getElementById('profile-pic');
  const editName = document.getElementById('edit-name');
  const editEmail = document.getElementById('edit-email');

  // load from multiple possible storage keys for compatibility
  let user = null;
  try{
    const raw = localStorage.getItem('userData');
    if(raw) user = JSON.parse(raw);
  }catch(e){ console.warn('invalid userData', e); }

  const name = user && user.name ? user.name : (localStorage.getItem('userName') || 'اسم المستخدم');
  const email = user && user.email ? user.email : (localStorage.getItem('userEmail') || 'example@email.com');
  const pic = user && user.image ? user.image : (localStorage.getItem('userPic') || 'assets/images/user-default.png');

  nameEl.textContent = name;
  emailEl.textContent = email;
  picEl.src = pic;

  // ===== نظام الإنجازات والأوسمة =====
  try{
    const completed = parseInt(localStorage.getItem('completedQuizzes') || '0', 10);
    const highest = parseInt(localStorage.getItem('highestScore') || '0', 10);
    const completedEl = document.getElementById('completed-quizzes');
    const highestEl = document.getElementById('highest-score');
    const badgeContainer = document.getElementById('badges-container');
    if(completedEl) completedEl.textContent = completed;
    if(highestEl) highestEl.textContent = highest + '%';
    if(badgeContainer){
      badgeContainer.innerHTML = '';
      if(completed >= 1) badgeContainer.innerHTML += `<div class="badge" title="المبتدئ">🥉</div>`;
      if(completed >= 3) badgeContainer.innerHTML += `<div class="badge" title="المتمكن">🥈</div>`;
      if(highest >= 90) badgeContainer.innerHTML += `<div class="badge" title="الذهبي">🏅</div>`;
      if(completed >= 5 && highest >= 95) badgeContainer.innerHTML += `<div class="badge" title="الخبير العظيم">👑</div>`;
    }
  }catch(e){ console.warn('achievements read error', e); }

  // clicking picture opens file picker
  const upload = document.getElementById('upload-pic');
  picEl.addEventListener('click', () => upload.click());

  upload.addEventListener('change', function(){
    const file = this.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e){
      picEl.src = e.target.result;
      // persist both legacy key and structured userData
      localStorage.setItem('userPic', e.target.result);
      const u = JSON.parse(localStorage.getItem('userData') || '{}');
      u.image = e.target.result;
      localStorage.setItem('userData', JSON.stringify(u));
      // notify other parts of the app (header) that profile updated
      try{ window.dispatchEvent(new CustomEvent('profileUpdated', {detail:{image: e.target.result}})); }catch(err){}
    };
    reader.readAsDataURL(file);
  });

  // edit button
  document.getElementById('edit-btn').addEventListener('click', () => {
    editName.style.display = 'block';
    editEmail.style.display = 'block';
    document.getElementById('save-btn').style.display = 'inline-block';
    document.getElementById('edit-btn').style.display = 'none';

    editName.value = nameEl.textContent;
    editEmail.value = emailEl.textContent;
  });

  // save
  document.getElementById('save-btn').addEventListener('click', () => {
    const newName = editName.value.trim() || 'اسم المستخدم';
    const newEmail = editEmail.value.trim() || 'example@email.com';

    nameEl.textContent = newName;
    emailEl.textContent = newEmail;

    // persist
    localStorage.setItem('userName', newName);
    localStorage.setItem('userEmail', newEmail);
    const u = JSON.parse(localStorage.getItem('userData') || '{}');
    u.name = newName; u.email = newEmail; u.image = u.image || picEl.src;
    localStorage.setItem('userData', JSON.stringify(u));

  // notify other parts of the app that profile changed (name/email)
  try{ window.dispatchEvent(new CustomEvent('profileUpdated', {detail:{name:newName, email:newEmail}})); }catch(err){}

    // toggle UI
    editName.style.display = 'none';
    editEmail.style.display = 'none';
    document.getElementById('save-btn').style.display = 'none';
    document.getElementById('edit-btn').style.display = 'inline-block';
  });

  // logout
  const logoutBtn = document.getElementById('logout-btn');
  if(logoutBtn){
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userPic');
      localStorage.removeItem('userData');
      // optionally preserve selectedLang
      try{ window.dispatchEvent(new CustomEvent('profileUpdated', {detail:{loggedOut:true}})); }catch(err){}
      window.location.href = 'index.html';
    });
  }
});
