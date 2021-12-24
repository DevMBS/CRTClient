const express = require("express");
const request = require("request");
const app = express();
const server = require("http").createServer(app);
const socket = require("socket.io")(server);
require("pidcrypt/seedrandom");
const pidCrypt = require("pidcrypt");
require("pidcrypt/aes_cbc");
const aes = new pidCrypt.AES.CBC();
const RandomOrg = require('random-org');
const random = new RandomOrg({ apiKey: '###' });
const { MongoClient } = require('mongodb');
const uri = "###";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const bodyParser = require('body-parser');
const router = express.Router();

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/cloverreqs", router);

client.connect(err => {
    if (err) {
        console.log('Connection error: ', err);
        throw err;
    }
    else{
        console.log('Connected to Clover Rescue database');
    }
    const db = client.db('CloverRescueClientDB');
    const users = db.collection('users');
    const keys = db.collection('keys');

socket.on('connection', (socket) => {
    socket.on('signup', (user) => {
        users.findOne({nickname: user.nickname}, function(err, data){
            if (data == null){
                random.generateStrings({ n: 1, length: 32, characters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789-_' }).then(function(result) {
                    let uid = result.random.data[0];
                    random.generateStrings({ n: 1, length: 32, characters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789-_' }).then(function(r) {
                        let encpassword = aes.encryptText(user.password, r.random.data[0]); 
                        keys.insertOne(
                            {nickname: user.nickname, key: r.random.data[0]},
                            (err, result) => {
                                if (err){
                                    console.log('Smth wrong with DB (insertOne function): ', err);
                                    throw err
                                }
                            }
                        );
                        users.insertOne(
                            {nickname: user.nickname, password: encpassword, uid: uid},
                            (err, result) => {
                              if (err) {
                                console.log('Smth wrong with DB (insertOne function): ', err);
                                throw err
                              }
                              else{
                                socket.emit('signupres', {body: 'successful', uid: uid});
                              }
                        });
                    });
                });
            }
            else{
                socket.emit('signupres', {body: 'error'});
            }
        });
    });
    socket.on('signin', (user) => {
        users.findOne({nickname: user.nickname}, function(err, data){
            if(data == null){
                socket.emit('signinres', {body: "nickname_error"});
            }
            else{
                keys.findOne({nickname: user.nickname}, function(err, key){
                    if(aes.decryptText(data.password, key.key) != user.password){
                        console.log(aes.decryptText(data.password, key.key), user.password);
                        socket.emit('signinres', {body: "password_error"});
                    }
                    else{
                        socket.emit('signinres', {body: "successful", uid: data.uid});
                    }
                });
            }
        });
    });
});
});

server.listen(3000);
