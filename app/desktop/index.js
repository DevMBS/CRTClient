'use strict';
//register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/mobile/serviceworker.js');
}
//set default status color
document.querySelector('#status').style.color = 'red';
document.getElementById("mission").value = null;

//hide preloader on window load
window.onload = function(){
  TweenMax.to('#loading', 0.7, {opacity: 0});
  TweenMax.to('.pace', 0.7, {opacity: 0});
  setTimeout(function(){document.getElementById('loading').style.display = 'none';document.getElementsByClassName('pace')[0].style.display = 'none';}, 700);
}

//switch to mobile version on orientation change
let switchToMobileVersionInterval = setInterval(function(){if(screen.width<screen.height){location.href="../mobile/index.html"}}, 500);

//three.js import
import * as THREE from '../../assets/three.js';
//3d model in the .glb format, so we need the GLTF loader
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/GLTFLoader.js';
//the model of Clover is compressed (6mb -> 168kb), so we need the draco decoder to correctly display it
import {DRACOLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/DRACOLoader.js';
//initialize decoders
DRACOLoader.setDecoderPath( '/assets/draco_decoder.js' );
//sockets init
const socket = io();
//set up the file reader to read the code file and upload  it's contents to the server
const fileReader = new FileReader();
//get the user's uid from the LocalStorage
const uid = localStorage.getItem('uid');
if(uid == null){
  //if user don't logged in
  location.href = '../../login/';
}
else{
  //send user's uid to the server
  socket.emit('uid', uid);
  socket.on('nickname', (user)=>{
    if(user.nickname.length < 15){
      document.getElementById('ct').innerText = user.nickname;
    }
    else{
      document.getElementById('ct').innerText = user.nickname.substring(0, 15)+'...';
    }
  })
}


//three.js standard setting
const canvas = document.querySelector('#clover3dview');
const renderer = new THREE.WebGLRenderer({canvas});
const fov = 75;
const aspect = 2;
const near = 0.1;
const far = 100;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 0, 0);
camera.rotation.y = -Math.PI/2;
const scene = new THREE.Scene();
const skyColor = 0xffffff;
const intensity = 0.7;
const light = new THREE.AmbientLight(skyColor, intensity);
scene.add(light);
const light2 = new THREE.DirectionalLight( 0x00ffa6, 1, 100 );
light2.position.set( -1000, 100, 100 );
scene.add( light2 );
const light3 = new THREE.DirectionalLight( 0x5900ff, 1, 100 );
light3.position.set( -1000, -100, 100 );
scene.add( light3 );
//loaders init
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader( new DRACOLoader() );
//load 3d model of Clover
let clover;
gltfLoader.load('../../assets/CloverCompressed.glb', (gltf) => {
  clover = gltf.scene;
  scene.add(clover);
  clover.position.set(0.4, 0, 0);
//add axes to the scene (x y z)
const boxWidth = 0.008;
const boxHeight = 0.3;
const boxDepth = 0.008;
const axesgeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
const zmaterial = new THREE.MeshBasicMaterial({color: 0x0000ff});
const z = new THREE.Mesh(axesgeometry, zmaterial);
scene.add(z);
z.position.set(0.5, -0.2, -0.4);
const xmaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
const x = new THREE.Mesh(axesgeometry, xmaterial);
scene.add(x);
x.position.set(0.5, -0.35, -0.25);
x.rotation.x = Math.PI/2;
const ymaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});
const y = new THREE.Mesh(axesgeometry, ymaterial);
scene.add(y);
y.position.set(0.646, -0.35, -0.4);
y.rotation.z = Math.PI/2;
//render scene
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}
function render() {
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

//check disconnection (if model of Clover don't move) - the gyroscope on the drone is quite sensitive, so even at seemingly complete rest, 
//the data taken at an interval of 4 seconds will differ, so if they are the same, it means that telemetry from the drone is not sent to the server and the Clover model is not updated
let previousRotation = {x: clover.rotation.x, y: clover.rotation.y, z: clover.rotation.z};
function checkDisconnection(){
  if(previousRotation.x == clover.rotation.x && previousRotation.y == clover.rotation.y && previousRotation.z == clover.rotation.z){
    document.querySelector('#status').innerHTML = '🞄 Disconnected';
    document.querySelector('#status').style.color = 'red';
  }
  previousRotation.x = clover.rotation.x;
  previousRotation.y = clover.rotation.y;
  previousRotation.z = clover.rotation.z;
}
const checkDisconnectionInterval = setInterval(checkDisconnection, 4000);

//set up functions for opening and closing warns
function popUp(block){
  document.getElementById(block).style.display = 'block';
  TweenLite.to('#'+block, 0.1, {opacity: '1'});
}

function close(block){
  TweenLite.to('#'+block, 0.1, {opacity: '0'});
  setTimeout(function(){
    document.getElementById(block).style.display = 'none';
  }, 100);
}

//welcome window, instructions
if(localStorage.getItem('cloverside') == null){
  document.getElementById('cloversidetext').innerHTML = "Welcome to the Clover Rescue Project website!<br/><br/>Install our software on your drone by running the following command:<br/><code>wget https://48c5-94-29-124-254.eu.ngrok.io/assets/installers/install.sh && sudo chmod 777 ./install.sh && ./install.sh "+uid+"</code><br/><br/>When everything succesfully installed, you will see the 'Connected' status on this page!<br/><br/>If you want to uninstall CloverRescue Project software from your drone, run this command: <br/><code>wget https://48c5-94-29-124-254.eu.ngrok.io/assets/installers/uninstall.sh && sudo chmod 777 ./uninstall.sh && ./uninstall.sh</code>";
  localStorage.setItem('cloverside', true);
  popUp('cloverside');
}

//open instructions
  document.getElementById("getInstructions").addEventListener("click", ()=>{
    document.getElementById('cloversidetext').innerHTML = "Welcome to the Clover Rescue Project website!<br/><br/>Install our software on your drone by running the following command:<br/><code>wget https://48c5-94-29-124-254.eu.ngrok.io/assets/installers/install.sh && sudo chmod 777 ./install.sh && ./install.sh "+uid+"</code><br/><br/>When everything succesfully installed, you will see the 'Connected' status on this page!<br/><br/>If you want to uninstall CloverRescue Project software from your drone, run this command: <br/><code>wget https://48c5-94-29-124-254.eu.ngrok.io/assets/installers/uninstall.sh && sudo chmod 777 ./uninstall.sh && ./uninstall.sh</code>";
    popUp('cloverside');
  });
document.getElementById('settingslist').style.display = 'none';
//map properties
const resizemap = setInterval(function(){
  document.getElementById('map').style.height = String(0.4*window.innerHeight)+'px';
}, 100);
let usermarker;
const map = L.map('map');
const tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmxldGNobGluZyIsImEiOiJja3hseWd2bjQxdGxrMndrajJnMmw5aXFwIn0.d1GSdCVDX_vDi_V_Svs-lQ', {
    attribution: '',
    maxZoom: 18,
    id: 'mapbox/outdoors-v11',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);
//enable user position tracking
let gpsc = 0;
map.locate({
  watch: true,
  enableHighAccuracy: true
}).on('locationfound', (e) => {
  if(gpsc == 0){
    map.setView([e.latitude, e.longitude], 30);
    usermarker = L.marker([e.latitude, e.longitude]).addTo(map);
    usermarker.bindPopup("You");
    gpsc++;
  }
  else{
    usermarker.setLatLng([e.latitude, e.longitude]);
  }
});

//upload mission button onclick
  document.getElementById("mission").addEventListener("change", ()=>{
    if (document.getElementById("mission").value != '') document.getElementById("fl").innerText = 'Mission: ' + document.getElementById("mission").files[0].name;
    else document.getElementById("fl").innerText = 'Choose code';
  });
  document.getElementById("ub").addEventListener("click", ()=>{
    //get file
    let file = document.getElementById("mission").files[0];
    if (file) {
      document.querySelector('#ub').setAttribute('disabled', 'disabled');
      //read its contents
      fileReader.readAsText(file, "UTF-8");
      fileReader.onload = function(evt) {
        //send content to the server
        socket.emit('newMission', evt.target.result);
        //animation
        document.getElementById('ub').innerHTML = '<img src="../../assets/uploading.svg" id="uploadImg" alt="uploading..."/>';
        TweenLite.to('#uploadImg', 0.4, {opacity: '1'});
        setTimeout(()=>{
          TweenLite.to('#uploadImg', 1, {rotation: 720, transformOrigin:"center"});
          setTimeout(()=>{
            TweenLite.to('#uploadImg', 0.3, {opacity: 0});
            setTimeout(()=>{
              document.getElementById('ub').innerHTML = '✓';
              setTimeout(()=>{
                document.getElementById('ub').innerText = 'Upload & Run';
                document.getElementById('fl').innerText = 'Choose code';
                document.getElementById("mission").value = null;
                document.querySelector('#ub').removeAttribute('disabled')}, 300);
            }, 600);
          }, 300);
        }, 400);
        }
    }
    //if upload button was pressed without choosing a file
    else{
      document.getElementById('ub').innerText = 'Choose file!';
      setTimeout(function(){document.getElementById('ub').innerText = 'Upload & Run'}, 1000);
    }
  });

//handle mission output
socket.on('missionOutput', (mission) => {
  if(mission.out || mission.error){
    if(mission.out){
      if(!mission.error){
        document.getElementById('missionOuttext').innerText = 'Output of your code: '+mission.out;
      }
      else{
        document.getElementById('missionOuttext').innerHTML = 'Output of your code: '+mission.out+'<br/>Error: '+mission.error;
      }
    }
    else{
      document.getElementById('missionOuttext').innerText = 'Error: '+mission.error;
    }
    //display output
    popUp('missionOut');
  }
});

//close mission output
document.getElementById("closemissionOut").addEventListener("click", ()=>{
  close('missionOut');
});

//send photo button onclick
document.getElementById("gp").addEventListener("click", ()=>{
  document.querySelector('#gp').setAttribute('disabled', 'disabled');
  socket.emit('req', {body: 'photo'});
  document.getElementById('gp').style.padding='0';
  document.getElementById('gp').innerHTML = '<img src="../../assets/camera.svg" id="camera" alt="waiting for photo..."/>'
  TweenMax.to('#camera', 0.6, {opacity: 1, yoyo:true, repeat:100});
});

//return button onclick
document.getElementById("rtp").addEventListener("click", ()=>{
    //if user has not changed the return settings
    if(!localStorage.getItem('rtowarnclosed')){
      popUp('rtowarn');
    }
    else{
      //if user choosed 'return to my coordinates'
      if(localStorage.getItem('returnto') == 'mycoords'){
        //get user coordinates
        let gpsc = 0;
        map.locate({enableHighAccuracy: true}).on('locationfound', (e) => {
          if(gpsc == 0){
            //send request to the server
            socket.emit('req', {body: 'returnToHome', data: {to: 'user', lat: e.latitude, lon: e.longitude, alt: parseFloat(localStorage.getItem('alt')), speed: localStorage.getItem('speed'), action: localStorage.getItem('action')}});
            gpsc++;
          }
        });
      }
      //if user chose 'return to the drone takeoff place' (coordinates of the first arming with gps)
      else{
        socket.emit('req', {body: 'returnToHome', data: {to: 'takeoff', alt: parseFloat(localStorage.getItem('alt')), speed: localStorage.getItem('speed'), action: localStorage.getItem('action')}});
      }
    }
});

//handle return function errors
socket.on('rError', function(){
  document.getElementById('rtherrortext').innerText = 'The drone cannot be returned because it has no GPS data.';
  popUp('rtherror');
});
socket.on('rTakeoffError', function(){
  document.getElementById('rtherrortext').innerText = 'The drone cannot be returned to the takeoff coordinates because it has not yet taken off with gps data since the last boot.';
  popUp('rtherror');
});

//land onclick
  document.getElementById("l").addEventListener("click", ()=>{
    socket.emit('req', {body: 'land'});
  });

//hover onclick
  document.getElementById("h").addEventListener("click", ()=>{
    socket.emit('req', {body: 'hover'});
  });


//disarm onclick
  document.getElementById("r").addEventListener("click", ()=>{
    socket.emit('req', {body: 'disarm'});
  });

//open settings
  document.getElementById("settings").addEventListener("click", ()=>{
    popUp('settingslist');
  });

//close settings
  document.getElementById("closesettings").addEventListener("click", ()=>{
    close('settingslist');
  });

//automatically take photos
function getautophoto(){
  socket.emit('req', {body: 'photo'});
}
let autophotointerval;

//change selected options
if(localStorage.getItem('action') == 'land'){
  document.getElementById('a1').removeAttribute('selected');
  document.getElementById('a2').setAttribute('selected', 'selected');
}
if(localStorage.getItem('returnto') == 'takeoffcoords'){
  document.getElementById('rt1').removeAttribute('selected');
  document.getElementById('rt2').setAttribute('selected', 'selected');
}
if(localStorage.getItem('alt') != null){
  document.getElementById('rtosalt').value = parseInt(localStorage.getItem('alt'));
}
if(localStorage.getItem('speed') != null){
  document.getElementById('rtosspeed').value = parseInt(localStorage.getItem('speed'));
}

//save settings button onclick
  document.getElementById("savesettings").addEventListener("click", ()=>{
    //save altitude and speed of return
    localStorage.setItem('alt', document.getElementById('rtosalt').value);
    localStorage.setItem('speed', document.getElementById('rtosspeed').value);
    //save action after return
    let action;
    if(document.getElementById('action').value == 1){
      action = 'hover';
    }
    else{
      action = 'land';
    }
    localStorage.setItem('action', action);
    //save return place
    let returnto;
    if(document.getElementById('returnto').value == 1){
      returnto = 'mycoords';
    }
    else{
      returnto = 'takeoffcoords';
    }
    localStorage.setItem('returnto', returnto);
    //enable auto photo requesting
    let autophoto;
    if(document.getElementById('atp').value == 1){
      autophoto = 'never';
    }
    else if(document.getElementById('atp').value == 2){
      autophoto = 30000;
    }
    else if(document.getElementById('atp').value == 3){
      autophoto = 60000;
    }
    else if(document.getElementById('atp').value == 4){
      autophoto = 300000;
    }
    if(autophoto != 'never'){
      autophotointerval = setInterval(getautophoto, autophoto);
    }
    else{
      try {
        clearInterval(autophotointerval);
      } catch(e) {}
    }
    document.getElementById('savesettings').innerText = 'Saved!';
    setTimeout(function(){document.getElementById('savesettings').innerText = 'Save'}, 400);
  });

//close 'no gps' warning
  document.getElementById("closegpswarn").addEventListener("click", ()=>{
    sessionStorage.setItem('gpswarnclosed', ' ');
    close('gpswarn');
  });

//close return warning
  document.getElementById("closertowarn").addEventListener("click", ()=>{
    localStorage.setItem('rtowarnclosed', ' ');
    close('rtowarn');
  });

//close instructions
  document.getElementById("closecloverside").addEventListener("click", ()=>{
    close('cloverside');
  });

//close RTH function error
  document.getElementById("closertherror").addEventListener("click", ()=>{
    close('rtherror');
  });

//set up drone marker
let dronemarker;
let vIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

//handle and display base64 image data from the server
socket.on('photofromclover', (photo) => {
  document.getElementById('photo').innerHTML = '<img src = "data:image/png;base64, '+photo+'" id = "pfc" alt="photo from clover"/>';
  document.getElementById('gp').innerText='Get Photo';
  document.getElementById('gp').style.padding='1%';
  document.querySelector('#gp').removeAttribute('disabled');
});

//handle telemetry stream from the server
socket.on('telemetrystream', (telem) => {
  //set status of the drone
  if(!telem.armed){
    document.querySelector('#status').innerHTML = '🞄 Connected<br/>🞄 Disarmed';
    document.querySelector('#status').style.color = 'rgb(255, 102, 0)';
  }
  else{
    document.querySelector('#status').innerHTML = '🞄 Connected<br/>🞄 In flight';
    document.querySelector('#status').style.color = 'rgb(0, 255, 136)';
  }
  //move 3d model of Clover
  clover.rotation.x = telem.pitch;
  clover.rotation.z = telem.roll;
  clover.rotation.y = telem.yaw;

  //display altitude and voltage
  document.querySelector('#alt').innerText = 'alt: '+telem.z.toFixed(1)+' m';
  document.querySelector('#volt').innerText = telem.volt+' V';

  //warning: 'no gps data from the drone'
  if(sessionStorage.getItem('gpswarnclosed') == null && telem.lat == null){
    popUp('gpswarn');
  }

  //move drone marker on the map (drone location tracking)
  else if(telem.lat != null){
      try {
        let newLatLng = new L.LatLng(telem.lat, telem.lon);
        dronemarker.setLatLng(newLatLng);
      } catch (e) {
        dronemarker = L.marker([telem.lat, telem.lon], {icon: vIcon}).addTo(map);
        dronemarker.bindPopup("Your Drone");
      }
  }

});

});