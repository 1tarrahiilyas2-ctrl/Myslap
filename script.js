// Persistent login en users
let currentUser = localStorage.getItem('currentUser') || null;
let users = JSON.parse(localStorage.getItem('users')) || {};
let posts = JSON.parse(localStorage.getItem('posts')) || [];
let likedPosts = JSON.parse(localStorage.getItem('likedPosts')) || {};

// Login / Register
function login(){
    let username = document.getElementById('usernameInput').value.trim();
    if(!username){ alert("Vul een gebruikersnaam in!"); return; }
    if(!users[username]){ users[username] = {name: username}; localStorage.setItem('users', JSON.stringify(users)); }
    currentUser = username;
    localStorage.setItem('currentUser', currentUser);
    document.getElementById('loginMsg').innerText = "Ingelogd als " + currentUser;
    showFeed();
}

// Show / Hide divs
function showFeed(){ document.getElementById('feedDiv').style.display='flex'; document.getElementById('uploadDiv').style.display='none'; document.getElementById('loginDiv').style.display='none'; renderFeed(); }
function showUpload(){ document.getElementById('feedDiv').style.display='none'; document.getElementById('uploadDiv').style.display='block'; document.getElementById('loginDiv').style.display='none'; }
function showLogin(){ document.getElementById('feedDiv').style.display='none'; document.getElementById('uploadDiv').style.display='none'; document.getElementById('loginDiv').style.display='block'; }

// Camera / Photo functies
let cameraStream;
function startCamera(){
    let videoElem = document.getElementById('cameraVideo');
    videoElem.style.display='block';
    navigator.mediaDevices.getUserMedia({video:true,audio:true}).then(stream=>{
        cameraStream = stream;
        videoElem.srcObject = stream;
    }).catch(err=>alert("Camera niet toegankelijk: "+err));
}

function takePhoto(){
    let videoElem = document.getElementById('cameraVideo');
    if(!videoElem.srcObject){ alert("Start eerst de camera!"); return; }
    let canvas = document.getElementById('photoCanvas');
    canvas.style.display='block';
    canvas.width = videoElem.videoWidth;
    canvas.height = videoElem.videoHeight;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(videoElem,0,0,canvas.width,canvas.height);
}

// Upload post
function uploadPost(){
    if(!currentUser){ alert("Je moet inloggen!"); return; }
    let videoInput = document.getElementById('fileInput').files[0];
    let mood = document.getElementById('mood').value.trim();
    let videoData;
    if(videoInput){ videoData = URL.createObjectURL(videoInput); }
    else { let canvas = document.getElementById('photoCanvas'); if(canvas.width>0) videoData = canvas.toDataURL(); else { alert("Geen video of foto geselecteerd!"); return; } }
    posts.unshift({user:currentUser, video:videoData, mood:mood, likes:0, comments:[]});
    localStorage.setItem('posts', JSON.stringify(posts));
    document.getElementById('fileInput').value=''; document.getElementById('mood').value='';
    showFeed();
}

// Render feed
function renderFeed(){
    let feed = document.getElementById('feedDiv'); feed.innerHTML='';
    posts.forEach((p, idx)=>{
        let postDiv = document.createElement('div'); postDiv.className='post';
        let videoElem;
        if(p.video.startsWith('data:') || p.video.endsWith('.mp4')){
            videoElem = document.createElement('video'); videoElem.src=p.video; videoElem.controls=true;
        } else if(p.video.includes("youtube.com") || p.video.includes("youtu.be") || p.video.includes("embed")){
            let vidId = p.video.includes("embed") ? p.video.split("/embed/")[1] : (p.video.split("v=")[1] || p.video.split("shorts/")[1]);
            if(vidId.includes("&")) vidId=vidId.split("&")[0];
            videoElem = document.createElement('iframe');
            videoElem.src="https://www.youtube.com/embed/"+vidId;
            videoElem.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
            videoElem.allowFullscreen = true;
        }
        postDiv.appendChild(videoElem);
        postDiv.innerHTML += `<p><b>${p.user}</b></p>`;
        if(p.mood) postDiv.innerHTML += `<p>Mood: ${p.mood}</p>`;
        let likeBtn = document.createElement('button'); likeBtn.innerHTML='👍 Like';
        likeBtn.onclick = ()=>{
            if(likedPosts[idx]){alert("Je kan deze post maar 1 keer liken!"); return;}
            likedPosts[idx]=true; p.likes++; localStorage.setItem('posts', JSON.stringify(posts)); localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
            // animatie
            let emoji = document.createElement('span'); emoji.className='like-emoji'; emoji.innerText='💛'; postDiv.appendChild(emoji);
            setTimeout(()=>emoji.remove(),500);
            renderFeed();
        };
        let shareBtn = document.createElement('button'); shareBtn.innerText='🔗 Share'; shareBtn.onclick = ()=>{navigator.clipboard.writeText(window.location.href+"#post"+idx); alert("Link gekopieerd!");}
        postDiv.appendChild(likeBtn); postDiv.appendChild(document.createTextNode(" "+p.likes+" likes "));
        postDiv.appendChild(shareBtn);
        let commentsDiv = document.createElement('div'); commentsDiv.className='comments';
        p.comments.forEach(c=>{let cdiv=document.createElement('div'); cdiv.innerText=c.user+": "+c.text; commentsDiv.appendChild(cdiv);});
        postDiv.appendChild(commentsDiv);
        let commentInput = document.createElement('input'); commentInput.className='comment-input'; commentInput.placeholder='Type hier je comment...';
        commentInput.onkeypress=(e)=>{if(e.key==='Enter' && commentInput.value.trim()!==''){p.comments.push({user:currentUser,text:commentInput.value}); localStorage.setItem('posts', JSON.stringify(posts)); renderFeed();}};
        postDiv.appendChild(commentInput);
        feed.appendChild(postDiv);
    });
}

// Trending
function showTrending(){ showFeed(); }

if(currentUser) showFeed(); 
