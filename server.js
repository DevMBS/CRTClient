//imports
const express = require("express");
const app = express();
const multer  = require("multer");
const server = require("http").createServer(app);
const socket = require("socket.io")(server);
require("pidcrypt/seedrandom");
const pidCrypt = require("pidcrypt");
require("pidcrypt/aes_cbc");
const aes = new pidCrypt.AES.CBC();
const RandomOrg = require('random-org');
const random = new RandomOrg({ apiKey: '6d35fb17-c86e-4cff-a043-b6686d609123' });
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://admin:jstop1234@crtcluster.tuj8e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const bodyParser = require('body-parser');
const router = express.Router();
const siofu = require("socketio-file-upload");
const fs = require("fs");

//setting up express framework
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", router);
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
    router.post('/connect', (user, res) => {
        //find a user whose clover wants to connect
        (async () => {
        let data = await findOne(users, {nickname: user.body.login});
        //if user exists
        if(data != null){
            //check password
            let dbkeys = await findOne(keys, {nickname: user.body.login});
            if(user.body.password == aes.decryptText(data.password, dbkeys.key)){
                //send response
                res.status(200).json({uid: data.uid, db: 'mongodb+srv://user:user@crtcloverside.2ygph.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'});
            }
        }
    })();
    });

//user entered the site
socket.on('connection', (socket) => {
    //user entered the app page
    socket.on('uid', (uid) => {
        //connecting to the command database client
        const cloverclient = new MongoClient('mongodb+srv://user:user@crtcloverside.2ygph.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
        cloverclient.connect(err => {
            if (err) {
                console.log('Connection error: ', err);
                throw err;
            }

            //connecting to the command db
            const csdb = cloverclient.db('CRTCloversideCommandDB');
            (async () => {
            let data = await findOne(users, {uid: uid});
            const clover = csdb.collection(data.nickname);
            clover.deleteMany({data: 'telemetry'});
            clover.deleteMany({data: 'photo'});
            clover.watch().on("change", next => {
                if(next.operationType == 'insert' && next.fullDocument.data == 'telemetry'){
                    let telem = next.fullDocument.telemetry;
                    socket.emit('telemetrystream'+uid, {armed: telem.armed, z: telem.z, lat: telem.lat, lon: telem.lon, alt: telem.alt, pitch: telem.pitch, roll: telem.roll, yaw: telem.yaw, volt: telem.cell_voltage});
                    clover.deleteMany({data: 'telemetry'});
                }
                else if(next.operationType == 'insert' && next.fullDocument.data == 'photo'){
                    socket.emit('photofromclover'+uid, next.fullDocument.photo);
                    clover.deleteMany({data: 'photo'});
                }
            });
            //command buttons onclick
            socket.on('req'+uid, (req) => {
                (async () => {
                if(req.body == 'land'){
                      insertOne(clover, {data: 'command', command: 'land'});
                }
                else if(req.body == 'hover'){
                    insertOne(clover, {data: 'command', command: 'hover'});
                }
                else if(req.body == 'reboot'){
                    insertOne(clover, {data: 'command', command: 'reboot'});
                }
                else if(req.body == 'returnToHome'){
                    insertOne(clover, {data: 'command', command: 'rth', gps: {to: req.data.to, lat: req.data.lat, lon: req.data.lon, alt: req.data.alt, speed: req.data.speed, action: req.data.action}});
                }
                else if(req.body == 'photo'){
                    insertOne(clover, {data: 'command', command: 'photo'});
                }
                })();
            });
        })();
        });

        //setting up uploader
        const uploader = new siofu();
        uploader.dir = "./app/desktop/uploads"+uid+"/";
        uploader.listen(socket);
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
                console.log(aes.decryptText(data.password, key.key), user.password);
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

server.listen(process.env.PORT || 5000);
