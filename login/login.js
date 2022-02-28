//socket.io clientside library initialization
const socket = io();
//register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/mobile/serviceworker.js');
}
//hide preloader on page load
window.onload = function(){
    TweenMax.to('#loading', 0.7, {opacity: 0});
    TweenMax.to('.pace', 0.7, {opacity: 0});
    setTimeout(function(){document.getElementById('loading').style.display = 'none';document.getElementsByClassName('pace')[0].style.display = 'none';}, 700);
}

//switch to the mobile/desktop version on orientation change
let checkOrientationInterval = setInterval(()=>{if(screen.width<screen.height){let mobile = document.createElement('link');mobile.href = 'mobile.css';mobile.rel = 'stylesheet';mobile.id='mobilecss';document.getElementsByTagName('head')[0].appendChild(mobile)}else if(window.innerWidth>window.innerHeight && document.querySelector('#mobilecss')){document.querySelector('#mobilecss').remove()}}, 500);

//sign in button onclick
function signin(){
    //hide button
    document.querySelector('#signin').setAttribute('disabled', 'disabled');
    //set forbidden characters
    const forbchars = '!@#$%^&*(){}[]:;"\'\\/<>?`~№+=';
    let i = 0;
    //check forbidden chars
    function csc(el){
        document.getElementById(el).value.split('').forEach(char => {
            if(forbchars.includes(char)){
                TweenMax.to('#'+el, 0.1, {x:"+=20", yoyo:true, repeat:5});
                document.querySelector('#status').innerText = 'Please enter a username without special characters like !@#$%^&*';
                setTimeout(()=>{document.querySelector('#signin').removeAttribute('disabled')}, 600);
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
        setTimeout(()=>{document.querySelector('#signin').removeAttribute('disabled')}, 600);
    }
    else{
        csc("nickname");
        if(i == 0){
            //if everything is okay, send sign in request to the server
            socket.emit('signin', {nickname: document.getElementById('nickname').value.toLowerCase().trim(), password: document.getElementById('password').value});
        }
    }
}
//handle sign in response
socket.on('signinres', (res) => {
    //if wrong nickname
    if(res.body == "nickname_error"){
        document.getElementById('signin').style.display = 'block';
        document.querySelector('#status').innerText = 'Hmm.. We can\'t find a user with this nickname in our database';
        document.querySelector('#nickname').value = '';
        TweenMax.to('#nickname', 0.08, {x:"+=20", yoyo:true, repeat:5});
    }
    //if wrong password
    else if(res.body == "password_error"){
        document.getElementById('signin').style.display = 'block';
        document.querySelector('#status').innerText = 'Incorrect password!';
        document.querySelector('#password').value = '';
        TweenMax.to('#password', 0.08, {x:"+=20", yoyo:true, repeat:5});
    }
    //if sign in successful
    else if(res.body == "successful"){
        //save uid in local storage
        localStorage.setItem("uid", res.uid);
        location.href = '../app/desktop';
    }
});