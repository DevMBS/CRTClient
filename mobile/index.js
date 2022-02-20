//socket.io initialization
const socket = io();
//hide preloader on page load
window.onload = function(){
    TweenMax.to('#loading', 0.7, {opacity: 0});
    TweenMax.to('.pace', 0.7, {opacity: 0});
    setTimeout(function(){document.getElementById('loading').style.display = 'none';document.getElementsByClassName('pace')[0].style.display = 'none';}, 700);
    TweenMax.to('#down', 0.6, {y:"-=20", yoyo:true, repeat:9999});
}
//switch to the desktop version on orientation change
let switchToDesktopVersionInterval = setInterval(function(){if(screen.width>screen.height){location.href="../"}}, 500);
//register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./serviceworker.js');
}
//sign up button onclick
function signup(){
    //hide button
    document.querySelector('#signup').style.display = 'none';
    //set forbidden caracters for the nickname
    const forbchars = '!@#$%^&*(){}[]:;"\'\\/<>?`~№+=';
    //forbchars counter
    let i = 0;
    //check presence of the forbidden chars
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
    //check field completion
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
        //check forb chars
        csc("nickname");
        if(i == 0){
            //if everything is okay, send sign up request to the server
            socket.emit('signup', {nickname: document.getElementById('nickname').value.toLowerCase().trim(), password: document.getElementById('password').value});
        }
    }
}

//handle sign up response from the server
socket.on('signupres', (res) => {
    //if error
    if(res.body == 'error'){
        document.querySelector('#signup').style.display = 'block';
        document.querySelector('#status').innerText = 'A user with this nickname already exist!';
        document.querySelector('#nickname').value = '';
        TweenMax.to('#nickname', 0.08, {x:"+=20", yoyo:true, repeat:5});
    }
    //if user has been added to the database
    else if(res.body == 'successful'){
        //save user uid
        localStorage.setItem('uid', res.uid);
        location.href = '../app/mobile/index.html';
    }
});