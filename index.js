const socket = io();
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./mobile/serviceworker.js');
}
window.onload = function(){
    TweenMax.to('#loading', 0.7, {opacity: 0});
    TweenMax.to('.pace', 0.7, {opacity: 0});
    setTimeout(function(){document.getElementById('loading').style.display = 'none';document.getElementsByClassName('pace')[0].style.display = 'none';}, 700);
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
    const forbchars = '!@#$%^&*(){}[]:;"\'\\/<>?`~№+=';
    let i = 0;
    function csc(el){
        document.getElementById(el).value.split('').forEach(char => {
            if(forbchars.includes(char)){
                TweenMax.to('#'+el, 0.1, {x:"+=20", yoyo:true, repeat:5});
                document.querySelector('#status').innerText = 'Please enter a username without special characters like !@#$%^&*';
                document.querySelector('#signup').style.display = 'block';
                document.getElementById(el).value = '';
                i += 1;
            }
        });
    }
    if(document.getElementById('nickname').value == '' || document.getElementById('password').value == ''){
        if(document.getElementById('nickname').value == ''){
            TweenMax.to('#nickname', 0.1, {x:"+=20", yoyo:true, repeat:5});
        }
        else{
            TweenMax.to('#password', 0.1, {x:"+=20", yoyo:true, repeat:5});
        }
        document.querySelector('#status').innerText = 'Please complete all of fields!';
        document.querySelector('#signup').style.display = 'block';
    }
    else{
        csc("nickname");
        if(i == 0){
            socket.emit('signup', {nickname: document.getElementById('nickname').value.toLowerCase(), password: document.getElementById('password').value});
        }
    }
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
        location.href = './app/desktop/';
    }
});
