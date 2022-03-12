//socket.io initialization
const socket = io();
//hide preloader on page load
window.onload = function(){
    TweenMax.to('#loading', 0.7, {opacity: 0});
    TweenMax.to('.pace', 0.7, {opacity: 0});
    setTimeout(function(){document.getElementById('loading').style.display = 'none';document.getElementsByClassName('pace')[0].style.display = 'none';}, 700);
    TweenMax.to('#down', 0.6, {y:"-=20", yoyo:true, repeat:9999});
}

//fix elements
document.getElementById("rpi").style.height = window.innerHeight*0.35+'px';
document.getElementById("clover").style.height = window.innerHeight*0.29+'px';
document.getElementById("title").style.height = window.innerHeight*0.9+'px';
document.getElementById("projectContainer").style.height = window.innerHeight+'px';
document.getElementById("hardwareContainer").style.height = window.innerHeight*0.7+'px';
document.getElementById("signupContainer").style.height = window.innerHeight+'px';
document.getElementById("clover").style.top += window.innerHeight*0.71+'px';


//switch to the desktop version on orientation change
let switchToDesktopVersionInterval = setInterval(function(){if(window.innerWidth>window.innerHeight){location.href="../"}}, 500);
//register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./serviceworker.js');
}
//sign up button onclick
function signup(){
    //hide button
    document.querySelector('#signup').setAttribute('disabled', 'disabled');
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
                setTimeout(()=>{document.querySelector('#signup').removeAttribute('disabled')}, 600);
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
        setTimeout(()=>{document.querySelector('#signup').removeAttribute('disabled')}, 600);
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
        document.querySelector('#status').innerText = 'A user with this nickname already exist!';
        document.querySelector('#nickname').value = '';
        TweenMax.to('#nickname', 0.08, {x:"+=20", yoyo:true, repeat:5});
        setTimeout(()=>{document.querySelector('#signup').removeAttribute('disabled')}, 600);
    }
    //if user has been added to the database
    else if(res.body == 'successful'){
        //save user uid
        localStorage.setItem('uid', res.uid);
        location.href = '../app/mobile/index.html';
    }
});