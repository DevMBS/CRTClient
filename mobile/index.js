const socket = io();
window.onload = function(){
    TweenMax.to('#down', 0.6, {y:"-=20", yoyo:true, repeat:9999});
}
function signup(){
    document.querySelector('#signup').style.display = 'none';
    socket.emit('signup', {nickname: document.getElementById('nickname').value, password: document.getElementById('password').value});
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
        location.href = '../app.index.html';
    }
});