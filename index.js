const socket = io();
window.onload = function(){
    TweenMax.to('#title', 0.7, {opacity: 1});
    TweenMax.to('#m1', 0.7, {opacity: 1});
    TweenMax.to('#m2', 0.7, {opacity: 1});
    TweenMax.to('#m3', 0.7, {opacity: 1});
    TweenMax.to('#login', 0.7, {opacity: 1});
    TweenMax.to('#app', 0.7, {opacity: 1});
    TweenMax.to('#down', 0.6, {y:"-=20", yoyo:true, repeat:9999});
}
var smoothJumpUp = function() {
    if (document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) {
        window.scrollBy(0,-50);
        setTimeout(smoothJumpUp, 10);
    }
}

window.onscroll = function() {
  var scrolled = window.pageYOffset || document.documentElement.scrollTop;
  if (scrolled > 100) {
      document.getElementById('arrowtop').style.display = 'block';
  } else {
      document.getElementById('arrowtop').style.display = 'none';
  }
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
        location.href = './app';
    }
});