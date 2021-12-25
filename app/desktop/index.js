'use strict';
import * as THREE from '../../assets/three.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/GLTFLoader.js';
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


document.getElementById('map').style.height = String(0.4*window.innerHeight)+'px';
const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};
function success(pos) {
  const crd = pos.coords;
  const map = L.map('map').setView([crd.latitude, crd.longitude], 30);
  const tiles = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZmxldGNobGluZyIsImEiOiJja3hseWd2bjQxdGxrMndrajJnMmw5aXFwIn0.d1GSdCVDX_vDi_V_Svs-lQ', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/outdoors-v11',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);
let usermarker = L.marker([crd.latitude, crd.longitude]).addTo(map);
usermarker.bindPopup("You").openPopup();
};
function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
};
navigator.geolocation.getCurrentPosition(success, error, options);

$('#mission').change(function() {
  if ($(this).val() != '') $(this).prev().text('Mission: ' + $(this)[0].files[0].name);
  else $(this).prev().text('Choose code file');
});

});