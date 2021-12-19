const socket = io();
function signin(){
    document.getElementById('signin').style.display = 'none';
    socket.emit('signin', {nickname: document.querySelector('#nickname').value, password: document.querySelector('#password').value})
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
        location.href = '../app';
    }
});