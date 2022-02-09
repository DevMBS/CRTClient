//imports
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
require("pidcrypt/seedrandom");
const pidCrypt = require("pidcrypt");
require("pidcrypt/aes_cbc");
const aes = new pidCrypt.AES.CBC();
const RandomOrg = require('random-org');
const random = new RandomOrg({ apiKey: '6d35fb17-c86e-4cff-a043-b6686d609123' });
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://admin:jstop1234@crtcluster.tuj8e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const siofu = require("socketio-file-upload");
const fs = require("fs");
//setting up express framework
app.use(express.static(__dirname));
app.use(siofu.router);

//connecting to mongodb client
client.connect(err => {
    if (err) {
        console.log('Connection error: ', err);
        throw err;
    }
    else{
        console.log('Connected to Clover Rescue database');
    }
    //connecting to crt client database
    const db = client.db('CloverRescueClientDB');
    const users = db.collection('users');
    const keys = db.collection('keys');

    async function findOne(collection, data){
        try {
            return await collection.findOne(data);
        } catch (error) {
            console.log(error);
        }
    }
    function insertOne(collection, data){
        try {
            collection.insertOne(data);
        } catch (error) {
            console.log(error);
        }
    }
    //handling connection requests
    io.on('connect', (socket)=> {
        socket.on('connectclover', (user) => {
            socket.join(user);
            //find a user whose clover wants to connect
            (async () => {
                let data = await findOne(users, {uid: user});
                //if user exists
                if(data != null){
                    socket.emit('connectres'+user, true);
                }
            })();
        });
        //handle telemetry from clover
        socket.on('telemetry', (telem)=>{
            io.to(telem.uid).emit('telemetrystream', {armed: telem.armed, z: telem.z, lat: telem.lat, lon: telem.lon, alt: telem.alt, pitch: telem.pitch, roll: telem.roll, yaw: telem.yaw, volt: telem.cell_voltage});
        });
        //handle photos from clover
        socket.on('photo', (photo)=>{
            io.to(photo.uid).emit('photofromclover', photo.photo);
        });
        //handle client connection
        socket.on('uid', (uid)=>{
            socket.join(uid);
            //handle requests from client and send them to clover
            socket.on('req', (req)=>{
                if(req.body == 'land'){
                    io.to(uid).emit('command', {command: 'land'});
                }
                else if(req.body == 'hover'){
                    io.to(uid).emit('command', {command: 'hover'});
                }
                else if(req.body == 'disarm'){
                    io.to(uid).emit('command', {command: 'disarm'});
                }
                else if(req.body == 'returnToHome'){
                    io.to(uid).emit('command', {command: 'rth', data: {to: req.data.to, lat: req.data.lat, lon: req.data.lon, alt: req.data.alt, speed: req.data.speed, action: req.data.action}});
                }
                else if(req.body == 'photo'){
                    io.to(uid).emit('command', {command: 'photo'});
                }
            });
            socket.on('newMission', (mission) => {
                io.to(uid).emit('mission', mission);
            });
        });
        //signup
        socket.on('signup', (user) => {
            (async () => {
            let data = await findOne(users, {nickname: user.nickname});
            if (data == null){
                random.generateStrings({ n: 1, length: 32, characters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789-_' }).then(function(result) {
                    let uid = result.random.data[0];
                    random.generateStrings({ n: 1, length: 32, characters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789-_' }).then(function(r) {
                        let encpassword = aes.encryptText(user.password, r.random.data[0]); 
                        insertOne(keys, {nickname: user.nickname, key: r.random.data[0]});
                        insertOne(users, {nickname: user.nickname, password: encpassword, uid: uid});
                        socket.emit('signupres', {body: 'successful', uid: uid});
                    });
                });
            }
            else{
                socket.emit('signupres', {body: 'error'});
            }
        })();
        });

        //login
        socket.on('signin', (user) => {
            (async () => {
            let data = await findOne(users, {nickname: user.nickname});
            if(data == null){
                socket.emit('signinres', {body: "nickname_error"});
            }
            else{
                let key = await findOne(keys, {nickname: user.nickname});
                if(aes.decryptText(data.password, key.key) != user.password){
                    socket.emit('signinres', {body: "password_error"});
                }
                else{
                    socket.emit('signinres', {body: "successful", uid: data.uid});
                }
            }
        })();
        });
        });
});
server.listen(3000);