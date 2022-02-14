const socket = io();
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../mobile/serviceworker.js');
}
window.onload = function(){
    TweenMax.to('#loading', 0.7, {opacity: 0});
    TweenMax.to('.pace', 0.7, {opacity: 0});
    setTimeout(function(){document.getElementById('loading').style.display = 'none';document.getElementsByClassName('pace')[0].style.display = 'none';}, 700);
}
function signin(){
    document.querySelector('#signin').style.display = 'none';
    const forbchars = '!@#$%^&*(){}[]:;"\'\\/<>?`~№+=';
    let i = 0;
    function csc(el){
        document.getElementById(el).value.split('').forEach(char => {
            if(forbchars.includes(char)){
                TweenMax.to('#'+el, 0.1, {x:"+=20", yoyo:true, repeat:5});
                document.querySelector('#status').innerText = 'Please enter a username without special characters like !@#$%^&*';
                document.querySelector('#signin').style.display = 'block';
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
        document.querySelector('#signin').style.display = 'block';
    }
    else{
        csc("nickname");
        if(i == 0){
            socket.emit('signin', {nickname: document.getElementById('nickname').value.toLowerCase(), password: document.getElementById('password').value});
        }
    }
}
socket.on('signinres', (res) => {
    if(res.body == "nickname_error"){
        document.getElementById('signin').style.display = 'block';
        document.querySelector('#status').innerText = 'Hmm.. We can\'t find a user with this nickname in our database';
        document.querySelector('#nickname').value = '';
        TweenMax.to('#nickname', 0.08, {x:"+=20", yoyo:true, repeat:5});
    }
    else if(res.body == "password_error"){
        document.getElementById('signin').style.display = 'block';
        document.querySelector('#status').innerText = 'Incorrect password!';
        document.querySelector('#password').value = '';
        TweenMax.to('#password', 0.08, {x:"+=20", yoyo:true, repeat:5});
    }
    else if(res.body == "successful"){
        localStorage.setItem("uid", res.uid);
        location.href = '../app/desktop';
    }
});