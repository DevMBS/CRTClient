'use strict';
document.querySelector('#status').style.color = 'red';
//three js lib import
import * as THREE from '../../assets/three.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/GLTFLoader.js';
//sockets init
const socket = io();
const fileReader = new FileReader();
if(localStorage.getItem('uid') == null){
  location.href = '../../login/';
}
else{
  socket.emit('uid', localStorage.getItem('uid'));
}

//TODO: cloverside warn styles, socket getCloverside, zipped installers, login
if(localStorage.getItem('cloverside') == null){
  socket.emit('getCloverside', uid);
  socket.on('cloversideSoftFile', (link) => {
    document.getElementById('cloversidetext').innerHTML = "Welcome to the Clover Rescue Project website!<br/>There is some instructions:<br/>Firstly, download <a href = '"+link.installers+"'>this</a> and <a href = '"+link.login+"'>this</a> files. First file - .zip package with software installer and uninstaller, unzip this and upload to your Clover. Second file is a file with your UID, download it and upload to the same with installer directory. Then run in your console: <br/><code>sudo sh ./install.sh</code><br/> When everything succesfully installed, you will see the 'Connected' status!";
  });
}
const uid = localStorage.getItem('uid');
//three js init
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
const gltfLoader = new GLTFLoader();
//loading 3d model of clover
let clover;
gltfLoader.load('../../assets/Clover4.glb', (gltf) => {
  clover = gltf.scene;
  scene.add(clover);
  clover.position.set(0.4, 0, 0);
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


document.getElementById('settingslist').style.display = 'none';
//map properties
const resizemap = setInterval(function(){
  document.getElementById('map').style.height = String(0.4*window.innerHeight)+'px';
}, 100);
let usermarker;
const map = L.map('map');
const tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmxldGNobGluZyIsImEiOiJja3hseWd2bjQxdGxrMndrajJnMmw5aXFwIn0.d1GSdCVDX_vDi_V_Svs-lQ', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/outdoors-v11',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);
const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};
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

//upload mission button 
$('#mission').change(function() {
  if ($(this).val() != '') $(this).prev().text('Mission: ' + $(this)[0].files[0].name);
  else $(this).prev().text('Choose code file');
});
$('#ub').click(function(){
  let file = document.getElementById("mission").files[0];
  if (file) {
    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = function(evt) {
        socket.emit('newMission', evt.target.result);
  }
  document.getElementById('ub').innerText('Running...');
  setTimeout(function(){document.getElementById('ub').innerText('Upload');$('#mission').prev().text('Choose code file');}, 400);
}
});

//send photo onclick
$("#gp").click(function() {
  socket.emit('req', {body: 'photo'});
});

//return to operator onclick
$("#rtp").click(function() {
  //if user has not changed the return to operator settings
  if(localStorage.getItem('rtowarnclosed') == null){
    document.getElementById('rtowarn').style.display = 'block';
    TweenLite.to('#rtowarn', 0.1, {opacity: '1'});
  }
  else{
    if(localStorage.getItem('returnto') == 'mycoords'){
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };
      function success(pos) {
        const crd = pos.coords;
        socket.emit('req', {body: 'returnToHome', data: {to: 'user', lat: crd.latitude, lon: crd.longitude, alt: parseFloat(localStorage.getItem('alt')), speed: localStorage.getItem('speed'), action: localStorage.getItem('action')}});
      };
      function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
      };
      navigator.geolocation.getCurrentPosition(success, error, options);
    }
    else{
      socket.emit('req', {body: 'returnToHome', data: {to: 'takeoff', alt: parseFloat(localStorage.getItem('alt')), speed: localStorage.getItem('speed'), action: localStorage.getItem('action')}});
    }
  }
});

//land onclick
$("#l").click(function() {
  socket.emit('req', {body: 'land'});
});

//hover onclick
$("#h").click(function() {
  socket.emit('req', {body: 'hover'});
});

//reboot onclick
$("#r").click(function() {
  socket.emit('req', {body: 'reboot'});
});

//open settings
$('#settings').click(function() {
  document.getElementById('settingslist').style.display = 'block';
  TweenLite.to('#settingslist', 0.1, {opacity: '1'});
});

//close settings
$("#closesettings").click(function() {
  TweenLite.to('#settingslist', 0.1, {opacity: '0'});
  setTimeout(function(){
    document.getElementById('settingslist').style.display = 'none';
  }, 100);
});

function getautophoto(){
  socket.emit('req', {body: 'photo'});
}
let autophotointerval;

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

//save settings
$('#savesettings').click(function() {
  localStorage.setItem('alt', document.getElementById('rtosalt').value);
  localStorage.setItem('speed', document.getElementById('rtosspeed').value);
  let action;
  if(document.getElementById('action').value == 1){
    action = 'hover';
  }
  else{
    action = 'land';
  }
  localStorage.setItem('action', action);
  let returnto;
  if(document.getElementById('returnto').value == 1){
    returnto = 'mycoords';
  }
  else{
    returnto = 'takeoffcoords';
  }
  localStorage.setItem('returnto', returnto);
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
  localStorage.setItem('autophoto', autophoto);
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

//close warnings

//if no gps data from clover
$("#closegpswarn").click(function() {
  sessionStorage.setItem('gpswarnclosed', ' ');
  TweenLite.to('#gpswarn', 0.1, {opacity: '0'});
  setTimeout(function(){
    document.getElementById('gpswarn').style.display = 'none';
  }, 100);
});

//if user has not changed the return to operator settings
$("#closertowarn").click(function() {
  localStorage.setItem('rtowarnclosed', ' ');
  TweenLite.to('#rtowarn', 0.1, {opacity: '0'});
  setTimeout(function(){
    document.getElementById('rtowarn').style.display = 'none';
  }, 100);
});

//setting up drone marker
let dronemarker;
let limiter = 0;
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
  document.getElementById('photo').innerHTML = '<img src = "data:image/png;base64, '+photo+'" id = "pfc"/>';
});

//handling telemetry stream from server
socket.on('telemetrystream', (telem) => {
  if(!telem.armed){
    document.querySelector('#status').innerHTML = '🞄 Connected<br/>🞄 Disarmed';
    document.querySelector('#status').style.color = 'rgb(255, 102, 0)';
  }
  else{
    document.querySelector('#status').innerHTML = '🞄 Connected<br/>🞄 In flight';
    document.querySelector('#status').style.color = 'rgb(0, 255, 136)';
  }
  //move 3d model of clover
  clover.rotation.x = telem.pitch;
  clover.rotation.z = telem.roll;
  clover.rotation.y = telem.yaw;

  //write altitude and voltage
  document.querySelector('#alt').innerText = 'alt: '+telem.z.toFixed(1)+' m';
  document.querySelector('#volt').innerText = telem.volt+' V';

  //warning
  //if there is no gps data from drone
  if(sessionStorage.getItem('gpswarnclosed') == null && telem.lat == null){
    document.getElementById('gpswarn').style.display = 'block';
    TweenLite.to('#gpswarn', 0.1, {opacity: '1'});
  }

  //move drone marker on map every 5s
  else if(telem.lat != null){
    if(limiter == 5){
      try {
        dronemarker.setLatLng([telem.lat, telem.lon]); 
      } catch (e) {
        dronemarker = L.marker([telem.lat, telem.lon], {icon: vIcon}).addTo(map);
        dronemarker.bindPopup("Your Drone");
      }
      limiter = 0;
    }
    else{
      limiter++;
    }
  }

});

});