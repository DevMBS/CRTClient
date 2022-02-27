'use strict';
//register the service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/mobile/serviceworker.js');
}
//hide preloader on window load
window.onload = function(){
  TweenMax.to('#loading', 0.7, {opacity: 0});
  TweenMax.to('.pace', 0.7, {opacity: 0});
  setTimeout(function(){document.getElementById('loading').style.display = 'none';document.getElementsByClassName('pace')[0].style.display = 'none';}, 700);
}
//set default status color
document.querySelector('#status').style.color = 'red';

//switch to the desktop version on orientation change
let switchToDesktopVersionInterval = setInterval(function(){if(window.innerWidth>window.innerHeight){location.href="../desktop/index.html"}}, 500);

//import Three.js library to display the 3d model of Clover
import * as THREE from '../../assets/three.js';
//3d model in the .glb format, so we need the GLTF loader
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/GLTFLoader.js';
//the model of Clover is compressed (6mb -> 168kb), so we need the draco decoder to correctly display it
import {DRACOLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/DRACOLoader.js';
DRACOLoader.setDecoderPath( '/assets/draco_decoder.js' );

//set up the Swiper library, it is needed to move between slides with controls using swipes
const swiper = new Swiper(".container", {
    grabCursor: true,
        effect: "creative",
        creativeEffect: {
          prev: {
            shadow: true,
            translate: ["-120%", 0, -500],
          },
          next: {
            shadow: true,
            translate: ["120%", 0, -500],
          },
        },
});

//sockets initialization
const socket = io();
//set up the file reader to read the code file and upload  it's contents to the server
const fileReader = new FileReader();
//get the user's uid from the LocalStorage
const uid = localStorage.getItem('uid');
if(uid == null){
  //user is not logged in
  location.href = '../../login/';
}
else{
  //send uid to the server
  socket.emit('uid', uid);
}

//three.js standart setting
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
renderer.setClearColor( 0x111111, 1);
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader( new DRACOLoader() );
//load the 3d model of Clover
let clover;
gltfLoader.load('../../assets/CloverCompressed.glb', (gltf) => {
  clover = gltf.scene;
  scene.add(clover);
  clover.position.set(0.37, 0, 0);
//render
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
    document.querySelector('#status').innerHTML = 'Disconnected';
    document.querySelector('#status').style.color = 'red';
  }
  previousRotation.x = clover.rotation.x;
  previousRotation.y = clover.rotation.y;
  previousRotation.z = clover.rotation.z;
}

const checkDisconnectionInterval = setInterval(checkDisconnection, 4000);


//map properties
const resizemap = setInterval(function(){
  document.getElementById('map').style.height = String(0.6*window.innerHeight)+'px';
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
const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
};
//get user's coordinates
function success(pos) {
  const crd = pos.coords;
  map.setView([crd.latitude, crd.longitude], 30);
  //setiting 'you' marker on map and getting user's coords
  usermarker = L.marker([crd.latitude, crd.longitude]).addTo(map);
  usermarker.bindPopup("You");
};
function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
};
navigator.geolocation.getCurrentPosition(success, error, options);

//enable user location tracking
map.locate({
  watch: true,
  enableHighAccuracy: true
}).on('locationfound', (e) => {
  usermarker.setLatLng([e.latitude, e.longitude]);
});

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
  document.getElementById('cloversidetext').innerHTML = "Welcome to the Clover Rescue Project website!<br/><br/>Install our software on your drone by running the following command:<br/><br/><code>wget https://48c5-94-29-124-254.eu.ngrok.io/assets/installers/install.sh && sudo chmod 777 ./install.sh && ./install.sh "+uid+"</code><br/><br/>When everything succesfully installed, you will see the 'Connected' status on this page!<br/><br/>If you want to uninstall CloverRescue Project software from your drone, run this command: <br/><br/><code>wget https://48c5-94-29-124-254.eu.ngrok.io/assets/installers/uninstall.sh && sudo chmod 777 ./uninstall.sh && ./uninstall.sh</code>";
  localStorage.setItem('cloverside', true);
  popUp('cloverside');
}

//close instructions
$("#closecloverside").click(function() {
  close('cloverside');
});


//upload mission button 
$('#mission').change(function() {
  if ($(this).val() != '') $(this).prev().text('Mission: ' + $(this)[0].files[0].name);
  else $(this).prev().text('Choose code file');
});
$('#ub').click(function(){
  let file = document.getElementById("mission").files[0];
  if (file) {
    //read file contents
    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = function(evt) {
        //send file contents to the server
        socket.emit('newMission', evt.target.result);
        document.getElementById('ub').innerText = 'Running...';
        setTimeout(function(){document.getElementById('ub').innerText = 'Upload & Run';document.getElementById('fl').innerText = 'Choose code file';}, 1000);
    }
  }
  //if upload button was pressed without choosing a file
  else{
    document.getElementById('ub').innerText = 'Please choose code file to upload!';
  }
});

//handle mission output
socket.on('missionOutput', (mission) => {
  if(mission.out || mission.error){
    //display mission output
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
    popUp('missionOut');
  }
});

//close mission output
$("#closemissionOut").click(function() {
  close('missionOut');
});

//send photo button onclick
$("#gp").click(function() {
  socket.emit('req', {body: 'photo'});
});

//return button onclick
$("#rtp").click(function() {
  //if user has not changed the return to operator settings
  if(localStorage.getItem('rtowarnclosed') == null){
    popUp('rtowarn');
  }
  else{
    //if user choosed 'return to my coordinates'
    if(localStorage.getItem('returnto') == 'mycoords'){
      //get user's position
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };
      function success(pos) {
        const crd = pos.coords;
        //send request to the server
        socket.emit('req', {body: 'returnToHome', data: {to: 'user', lat: crd.latitude, lon: crd.longitude, alt: parseFloat(localStorage.getItem('alt')), speed: localStorage.getItem('speed'), action: localStorage.getItem('action')}});
      };
      function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
      };
      navigator.geolocation.getCurrentPosition(success, error, options);
    }
    else{
      //if user choosed 'return to drone takeoff coordinates (coordinates of the first arm with gps)
      //send request to the server
      socket.emit('req', {body: 'returnToHome', data: {to: 'takeoff', alt: parseFloat(localStorage.getItem('alt')), speed: localStorage.getItem('speed'), action: localStorage.getItem('action')}});
    }
  }
});

//close return warn
$("#closertowarn").click(function() {
  localStorage.setItem('rtowarnclosed', ' ');
  close('rtowarn');
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


//close return error
$("#closertherror").click(function() {
  close('rtherror');
});

//close gps error
$("#closegpswarn").click(function() {
  sessionStorage.setItem('gpswarnclosed', ' ');
  close('gpswarn');
});


//land button onclick
$("#l").click(function() {
  //send land request to the server
  socket.emit('req', {body: 'land'});
});

//hover button onclick
$("#h").click(function() {
  //send hover request to the server
  socket.emit('req', {body: 'hover'});
});

//reboot button onclick
$("#r").click(function() {
  //send disarm request to the server
  socket.emit('req', {body: 'disarm'});
});



//automatically take photos
function getautophoto(){
  //send photo request to the server
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
$('#savesettings').click(function() {
  //set return alt and speed to the local storage
  localStorage.setItem('alt', document.getElementById('rtosalt').value);
  localStorage.setItem('speed', document.getElementById('rtosspeed').value);

  //set action after return to the local storage
  let action;
  if(document.getElementById('action').value == 1){
    action = 'hover';
  }
  else{
    action = 'land';
  }
  localStorage.setItem('action', action);

  //set a place to return to the local storage
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

//setting up the drone marker on the map
let dronemarker;
let vIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

//handle base64 image data from server
socket.on('photofromclover', (photo) => { 
  //display it
  document.getElementById('photo').innerHTML = '<img src = "data:image/png;base64, '+photo+'" id = "pfc"/>';
});

//handle telemetry stream from server
socket.on('telemetrystream', (telem) => {
  //show status of the drone
  if(!telem.armed){
    document.querySelector('#status').innerHTML = 'Connected, Disarmed';
    document.querySelector('#status').style.color = 'rgb(255, 102, 0)';
  }
  else{
    document.querySelector('#status').innerHTML = 'Connected, In flight';
    document.querySelector('#status').style.color = 'rgb(0, 255, 136)';
  }
  //move 3d model of Clover
  clover.rotation.x = telem.pitch;
  clover.rotation.z = telem.roll;
  clover.rotation.y = telem.yaw;

  //display altitude and voltage of the drone
  document.querySelector('#alt').innerText = 'alt: '+telem.z.toFixed(1)+' m';
  document.querySelector('#volt').innerText = telem.volt+' V';

  //warning
  //if there is no gps data from drone
  if(sessionStorage.getItem('gpswarnclosed') == null && telem.lat == null){
    popUp('gpswarn');
  }

  //move drone marker on map (drone position tracking)
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