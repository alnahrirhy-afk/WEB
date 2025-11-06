// profile.js - load and save profile edits
(function(){
  const form = document.getElementById('profile-form');
  const nameInput = document.getElementById('p-name');
  const avatarInput = document.getElementById('p-avatar');
  const previewImg = document.getElementById('preview-avatar');

  function dataURLFromFile(file){
    return new Promise((res, rej)=>{
      const reader = new FileReader();
      reader.onload = ()=>res(reader.result);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
  }

  function loadUser(){
    const raw = localStorage.getItem('siteUser');
    if(!raw) return null;
    try{ return JSON.parse(raw); }catch(e){ return null }
  }

  const user = loadUser();
  if(!user){
    // No user; redirect to login
    window.location.href = 'login.html';
  } else {
    nameInput.value = user.name || '';
    previewImg.src = user.avatar || 'assets/images/default-avatar.svg';
  }

  avatarInput.addEventListener('change', async (e)=>{
    const f = e.target.files[0];
    if(!f) return;
    if(!f.type.startsWith('image/')) return;
    try{ const d = await dataURLFromFile(f); previewImg.src = d; }catch(e){console.warn(e)}
  });

  form.addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    const name = nameInput.value.trim();
    if(!name) return alert('الرجاء إدخال الاسم');
    let avatarData = previewImg.src;
    const f = avatarInput.files[0];
    if(f && f.type.startsWith('image/')){
      try{ avatarData = await dataURLFromFile(f); }catch(e){console.warn(e)}
    }

    const newUser = { name, avatar: avatarData };
    localStorage.setItem('siteUser', JSON.stringify(newUser));
    window.location.href = 'index.html';
  });
})();
