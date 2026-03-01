// Gebruiker systeem
let currentUser = localStorage.getItem('currentUser') || null;
let users = JSON.parse(localStorage.getItem('users')) || {};
let posts = JSON.parse(localStorage.getItem('posts')) || [
    {user:"Alice", video:"videos/sample1.mp4", mood:"Excited 😎", feeling:"Happy 😁", likes:5, comments:[{user:"Bob", text:"Leuke video!"}]},
    {user:"Charlie", video:"https://www.youtube.com/embed/FTQ8jRNT2hQ", mood:"Chill 😌", feeling:"Relaxed 💤", likes:3, comments:[]},
    {user:"Dana", video:"videos/sample2.mp4", mood:"Energetic ⚡", feeling:"Hyped 🔥", likes:8, comments:[{user:"Alice", text:"Nice vibe!"}]}
];

// Like systeem
let likedPosts = JSON.parse(sessionStorage.getItem('likedPosts')) || {};

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

// Upload post
function uploadPost(){
    if(!currentUser){ alert("Je moet inloggen!"); return; }
    let video = document.getElementById('videoLink').value.trim();
    let mood = document.getElementById('mood').value.trim();
    let feeling = document.getElementById('feeling').value.trim();
    if(!video){ alert("Vul een video link in!"); return; }
    posts.unshift({user:currentUser, video, mood, feeling, likes:0, comments:[]});
    localStorage.setItem('posts', JSON.stringify(posts));
    document.getElementById('videoLink').value=''; document.getElementById('mood').value=''; document.getElementById('feeling').value='';
    showFeed();
}

// Render feed
function renderFeed(){
    let feed = document.getElementById('feedDiv');
    feed.innerHTML='';
    posts.forEach((p, idx)=>{
        let postDiv = document.createElement('div'); postDiv.className='post';
        let videoElem;
        if(p.video.includes("youtube.com") || p.video.includes("youtu.be") || p.video.includes("embed")){
            let vidId = p.video.includes("embed") ? p.video.split("/embed/")[1] : (p.video.split("v=")[1] || p.video.split("shorts/")[1]);
            if(vidId.includes("&")) vidId=vidId.split("&")[0];
            videoElem = document.createElement('iframe');
            videoElem.src="https://www.youtube.com/embed/"+vidId;
            videoElem.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
            videoElem.allowFullscreen = true;
        } else {
            videoElem = document.createElement('video');
            videoElem.src = p.video; videoElem.controls=true;
        }
        postDiv.appendChild(videoElem);
        postDiv.innerHTML += `<p><b>${p.user}</b></p>`;
        if(p.mood) postDiv.innerHTML += `<p>Mood: ${p.mood}</p>`;
        if(p.feeling) postDiv.innerHTML += `<p>Feeling: ${p.feeling}</p>`;
        let likeBtn = document.createElement('button'); likeBtn.innerText='👍 Like';
        likeBtn.onclick = ()=>{if(likedPosts[idx]){alert("Je kan deze post maar 1 keer liken!"); return;} likedPosts[idx]=true; p.likes++; localStorage.setItem('posts', JSON.stringify(posts)); sessionStorage.setItem('likedPosts', JSON.stringify(likedPosts)); renderFeed();}
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
