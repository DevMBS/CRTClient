const socket = io();
window.onload = function(){
    TweenMax.to('#loading', 0.7, {opacity: 0});
    TweenMax.to('.pace', 0.7, {opacity: 0});
    setTimeout(function(){document.getElementById('loading').style.display = 'none';document.getElementsByClassName('pace')[0].style.display = 'none';}, 700);
    TweenMax.to('#down', 0.6, {y:"-=20", yoyo:true, repeat:9999});
}
let switchToDesktopVersionInterval = setInterval(function(){if(screen.width>screen.height){location.href="../"}}, 500);
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/mobile/serviceworker.js');
}
function signup(){
    document.querySelector('#signup').style.display = 'none';
    socket.emit('signup', {nickname: document.getElementById('nickname').value.toLowerCase(), password: document.getElementById('password').value});
}
socket.on('signupres', (res) => {
    if(res.body == 'error'){
        document.querySelector('#signup').style.display = 'block';
        document.querySelector('#status').innerText = 'A user with this nickname already exist!';
        document.querySelector('#nickname').value = '';
        TweenMax.to('#nickname', 0.08, {x:"+=20", yoyo:true, repeat:5});
    }
    else if(res.body == 'successful'){
        localStorage.setItem('uid', res.uid);
        location.href = '../app/mobile/index.html';
    }
});