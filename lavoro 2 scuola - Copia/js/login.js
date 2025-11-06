// login.js - save user object to localStorage and redirect to index.html
(function(){
  const form = document.getElementById('login-form');
  const avatarInput = document.getElementById('avatar');
  const preview = document.getElementById('avatar-preview');

  function dataURLFromFile(file){
    return new Promise((res, rej)=>{
      const reader = new FileReader();
      reader.onload = ()=>res(reader.result);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
  }

  avatarInput.addEventListener('change', async (e)=>{
    const f = e.target.files[0];
    if(!f) { preview.innerHTML = ''; return; }
    if(!f.type.startsWith('image/')) return;
    const url = await dataURLFromFile(f);
    preview.innerHTML = `<img src="${url}" alt="preview" style="width:72px;height:72px;border-radius:50%;border:3px solid #b58b47;object-fit:cover">`;
  });

  form.addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    const name = document.getElementById('name').value.trim();
    if(!name) return alert('الرجاء إدخال الاسم');

    let avatarData = null;
    const f = avatarInput.files[0];
    if(f && f.type.startsWith('image/')){
      try{ avatarData = await dataURLFromFile(f); }catch(e){ console.warn(e); }
    }

  // Save using simple keys expected by profile page
  localStorage.setItem('userName', name);
  // also set canonical 'username' key for the new login/check system (backwards compatible)
  localStorage.setItem('username', name);
  if(avatarData) localStorage.setItem('userImage', avatarData);
    // redirect to index
    window.location.href = 'index.html';
  });
})();
