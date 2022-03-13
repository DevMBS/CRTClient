//initalizing the socket.io clientside library
const socket = io();

//fix css containers
document.querySelector('#heading').style.height = window.innerHeight+'px';
document.querySelector('#projectCont').style.height = window.innerHeight+'px';
document.querySelector('#hardwareCont').style.height = window.innerHeight+'px';
document.querySelector('#signupcont').style.height = window.innerHeight+'px';
document.querySelector('#mb1').style.height = window.innerHeight+'px';
document.querySelector('#background').style.height = window.innerHeight+'px';
document.querySelector('#mb1').style.top = window.innerHeight*1.12+'px';

//register the service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/mobile/serviceworker.js');
}
//close preloader on page load
window.onload = () => {
    //GSAP animation (dissolve block)
    TweenMax.to('#loading', 0.7, {opacity: 0});
    TweenMax.to('.pace', 0.7, {opacity: 0});
    setTimeout(function(){document.getElementById('loading').style.display = 'none';document.getElementsByClassName('pace')[0].style.display = 'none';}, 700);
    TweenMax.to('#down', 0.6, {y:"-=20", yoyo:true, repeat:9999});
}

//set up button 'back to the top of page'
var smoothJumpUp = function() {
    if (document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) {
        window.scrollBy(0,-50);
        setTimeout(smoothJumpUp, 10);
    }
}

window.onscroll = function() {
  let scrolled = window.pageYOffset || document.documentElement.scrollTop;
  if (scrolled > 100) {
      document.getElementById('arrowtop').style.display = 'block';
  } else {
      document.getElementById('arrowtop').style.display = 'none';
  }
}

//switch to the mobile version on orientation change
let switchToMobileVersionInterval = setInterval(function(){if(screen.width<screen.height){location.href="/mobile/index.html"}}, 500);

//sign up button onclick
function signup(){
    //hide button
    document.querySelector('#signup').setAttribute("disabled", "disabled");
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
        localStorage.setItem('uid', res.uid);
        location.href = './app/desktop/';
    }
});
