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

//ripple effect for buttons
let buttons = document.getElementsByTagName('button');
Array.prototype.forEach.call(buttons, function(b){
    b.addEventListener('click', ripple);
})
function ripple(e)
{
    if(this.getElementsByClassName('ripple').length > 0)
    {
        this.removeChild(this.childNodes[1]);
    }
    let circle = document.createElement('div');
    this.appendChild(circle);
    let d = Math.max(this.clientWidth, this.clientHeight);
    circle.style.width = circle.style.height = d + 'px';
    circle.style.left = e.clientX - this.offsetLeft - d / 2 + 'px';
    circle.style.top = e.clientY - this.offsetTop - d / 2 + 'px';
    circle.classList.add('ripple');
}

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
document.addEventListener('keydown', (e)=>{
    if(e.key == "Enter"){
        signin();
    }
});
//handle sign in response
socket.on('signinres', (res) => {
    //if wrong nickname
    if(res.body == "nickname_error"){
        document.querySelector('#signin').removeAttribute('disabled');
        document.querySelector('#status').innerText = 'Hmm.. We can\'t find a user with this nickname in our database';
        document.querySelector('#nickname').value = '';
        TweenMax.to('#nickname', 0.08, {x:"+=20", yoyo:true, repeat:5});
    }
    //if wrong password
    else if(res.body == "password_error"){
        document.querySelector('#signin').removeAttribute('disabled');
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