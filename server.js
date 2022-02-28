//imports
//express - standart framework for building NodeJS web apps
const express = require("express");
const app = express();
const server = require("http").createServer(app);
//socket.io - framework for client-server-drone data communication
const io = require("socket.io")(server);
//pidcrypt - library for data encryption/decryption. I will use it to encrypt passwords in database
require("pidcrypt/seedrandom");
const pidCrypt = require("pidcrypt");
require("pidcrypt/aes_cbc");
const aes = new pidCrypt.AES.CBC();
//random.org api
const RandomOrg = require('random-org');
const random = new RandomOrg({ apiKey: '#Enter there your random-org api key#' });
//to store usernames, passwords and UIDs I will use MongoDB database
const { MongoClient } = require('mongodb');
const uri = "#Enter there adress to your MongoDB Database#";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//setting up express framework
app.use(express.static(__dirname));

//connecting to the mongodb client
client.connect(err => {
    if (err) {
        console.log('Connection error: ', err);
        throw err;
    }
    else{
        console.log('Connected to the Clover Rescue database');
    }
    //connecting to CloverRescueTeam client database
    const db = client.db('CloverRescueClientDB');
    //the 'users' collection contains usernames, passwords and UIDs
    const users = db.collection('users');
    //'the keys' collection contains encryption keys for user passwords
    const keys = db.collection('keys');

    //async function for finding data in a collection
    async function findOne(collection, data){
        try {
            return await collection.findOne(data);
        } catch (error) {
            console.log(error);
        }
    }

    //function for inserting data into a collection
    function insertOne(collection, data){
        try {
            collection.insertOne(data);
        } catch (error) {
            console.log(error);
        }
    }
    //handling connection requests
    io.on('connect', (socket)=> {
        //if Clover wants to connect to the server
        socket.on('connectclover', (user) => {
            //user - uid of user whose Clover wants to connect
            //find a user whose Clover wants to connect
            (async () => {
                let data = await findOne(users, {uid: user});
                //if user exists
                if(data != null){
                    //creating/joining socket.io room for user and Clover with same uid
                    socket.join(user);
                    //send response to Clover that all is okay and it can start to send it's telemetry to the server
                    socket.emit('connectres'+user, true);
                }
            })();
        });
        //handle telemetry from Clover
        socket.on('telemetry', (telem)=>{
            //send telemetry to the room with uid of this Clover
            io.to(telem.uid).emit('telemetrystream', {armed: telem.armed, z: telem.z, lat: telem.lat, lon: telem.lon, alt: telem.alt, pitch: telem.pitch, roll: telem.roll, yaw: telem.yaw, volt: telem.cell_voltage});
        });
        //handle photos from Clover
        socket.on('photo', (photo)=>{
            //send photo (in base64 encoding) to the room with uid of this Clover
            io.to(photo.uid).emit('photofromclover', photo.photo);
        });
        //handle error - Return function can not be executed (no GPS)
        socket.on('rthError', (uid) => {
            //send it to room
            io.to(uid.uid).emit('rError');
        });

        //handle error - Return function can not be executed (no takeoff coordinates)
        socket.on('returnToTakeoffError', (uid) => {
            //send it to room
            io.to(uid.uid).emit('rTakeoffError');
        });

        //handle mission output
        socket.on('missionOut', (mission) => {
            //send it to the room the user's Сlover is connected to
            io.to(mission.uid).emit('missionOutput', mission);
        });

        //handle client connection
        //when client opens the page, the clientside script sends user's uid (saved in LocalStorage) to the server
        socket.on('uid', (uid)=>{
            //
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
            //handle .py code from the client and send it to the Clover
            socket.on('newMission', (mission) => {
                io.to(uid).emit('mission', mission);
            });
        });

        //if user wants to sign up
        socket.on('signup', (user) => {
            (async () => {
            //check nickname availability
            let data = await findOne(users, {nickname: user.nickname});
            //if nickname is available
            if (data == null){
                //generate UID
                random.generateStrings({ n: 1, length: 32, characters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789-_' }).then(function(result) {
                    let uid = result.random.data[0];
                    //generate encryption key for the password
                    random.generateStrings({ n: 1, length: 32, characters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789-_' }).then(function(r) {
                        let encpassword = aes.encryptText(user.password, r.random.data[0]); 
                        //insert key to the database
                        insertOne(keys, {nickname: user.nickname, key: r.random.data[0]});
                        //add new user to database
                        insertOne(users, {nickname: user.nickname, password: encpassword, uid: uid});
                        //send response to user that it has been added to the database
                        socket.emit('signupres', {body: 'successful', uid: uid});
                    });
                });
            }
            //if nickname is not available
            else{
                //send error to client
                socket.emit('signupres', {body: 'error'});
            }
        })();
        });

        //if user wants to sign in
        socket.on('signin', (user) => {
            //find this user in the database
            (async () => {
            let data = await findOne(users, {nickname: user.nickname});
            if(data == null){
                //if user does not exist, send an error to the client
                socket.emit('signinres', {body: "nickname_error"});
            }
            else{
                //if user exist
                //find password encryption key
                let key = await findOne(keys, {nickname: user.nickname});
                //check password
                if(aes.decryptText(data.password, key.key) != user.password){
                    //if passwords do not match
                    socket.emit('signinres', {body: "password_error"});
                }
                else{
                    //if everything is okay
                    socket.emit('signinres', {body: "successful", uid: data.uid});
                }
            }
        })();
        });
        });
});

//set port for server
server.listen(3000);
