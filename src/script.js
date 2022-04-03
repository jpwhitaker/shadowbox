import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RectAreaLightHelper }  from 'three/examples/jsm/helpers/RectAreaLightHelper.js'

import * as dat from 'lil-gui'

/**
 * Debug Panel
 */
const gui = new dat.GUI({width: 500})


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Open Box
 */
var material1 = new THREE.MeshStandardMaterial( { color: 0xffffff, side: THREE.BackSide, shadowSide:THREE.FrontSide  } );
var material2 = new THREE.MeshStandardMaterial( { color: 0xffffff, side: THREE.BackSide, shadowSide:THREE.FrontSide } );
var material3 = new THREE.MeshStandardMaterial( { color: 0xffffff, side: THREE.BackSide, shadowSide:THREE.FrontSide } );
var material4 = new THREE.MeshStandardMaterial( { color: 0xffffff, side: THREE.BackSide, shadowSide:THREE.FrontSide } );
var material5 = new THREE.MeshStandardMaterial( { color: 0xffffff, side: THREE.BackSide, shadowSide:THREE.FrontSide } );
var materialTransparent =  new THREE.MeshStandardMaterial( { transparent: true, opacity: 0, wireframe: true, side: THREE.DoubleSide} );

var geometry = new THREE.BoxGeometry( 2, 1, 1 );
var materials = [ materialTransparent, material1, material2, material3, material4, material5 ]



var openBox = new THREE.Mesh( geometry, materials );
openBox.receiveShadow = true;
openBox.castShadow = true
scene.add( openBox );

openBox.position.y = 0; 


/**
 * light
 */

const ambientLight = new THREE.AmbientLight(0xffffff, .55)
scene.add(ambientLight)
gui.add(ambientLight, 'intensity', 0, 4, 0.05)


//directionallight will not work for shifting shadows
const pointLight = new THREE.PointLight(0xffffff, 1.7);

pointLight.position.x = 0.5
pointLight.position.y = 0
pointLight.position.z = 0
pointLight.distance = 2
pointLight.decay = 1.55

pointLight.castShadow = true
pointLight.shadow.mapSize.width = 10000
pointLight.shadow.mapSize.height = 10000

pointLight.shadow.camera.near = .1
pointLight.shadow.camera.far = 8
pointLight.shadow.radius = 10
scene.add(pointLight)

const sphereSize = .2;
const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
scene.add( pointLightHelper );
gui.add(pointLight, 'intensity', 0, 4, 0.05).name('point light intensity')
gui.add(pointLight.position, 'x', 0, 4, 0.05).name('point light x')
gui.add(pointLight, 'distance', 0, 2, 0.05)
gui.add(pointLight, 'decay', 0, 2, 0.05)


/**
 * Sizes
 */
const sizes = {
    width: 500,
    height: 500
}


/**
 * Cameras
 */

const cameraFov = 90;
const boxHeight = 1;

const cam1 = new THREE.PerspectiveCamera(cameraFov, sizes.width / sizes.height, 0.1, 100)
const cam2 = new THREE.PerspectiveCamera(cameraFov, sizes.width / sizes.height, 0.1, 100)


//object used to change between the two cameras
const cameras = {
    cam1: cam1,
    cam2: cam2,
    currentCamera: cam2,
    changeCamera: function(){
        this.currentCamera = (this.currentCamera === cam1) ? cam2 : cam1;
    }
}
gui.add(cameras, 'changeCamera')
cameras.cam2.rotation.reorder('YXZ')
gui.add(cameras.cam2.rotation, 'x', -2, 2, 0.005)
// gui.hide()

cam1.position.z = 3
cam2.position.x = 0.2;
cam2.position.z = 0
cameras.cam2.lookAt( 0, 0, 0 );

scene.add(cameras.cam1)
scene.add(cameras.cam2)


// Controls
const controls1 = new OrbitControls(cameras.cam1, canvas)
const controls2 = new OrbitControls(cameras.cam2, canvas)
controls1.enableDamping = true
controls2.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setClearColor( 0xffffff, 0);



/**
 * Scroll
 */
let scrollY = window.scrollY
let camRotation

 window.addEventListener('scroll', () => {
    scrollY = window.scrollY
    console.log(`scrollY: ${scrollY}, camRotation: ${camRotation}`)
 })

const translateRange = (value, r1, r2) => {
    
    const scale = (r2.max - r2.min) / (r1.max - r1.min)
    return (value - r1.min) * scale + r2.min
}


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    camRotation = translateRange(scrollY, {min: 500, max: 1190},{min: -0.15, max: 0.15} )
    // console.log(camRotation)

    cameras.cam2.rotation.x = camRotation;

    // Update controls
    if (cameras.currentCamera === cam1){
        controls2.enabled = false;
        controls1.enabled = true;
        controls1.update()
    } else {
        // controls1.enabled = false;
        // controls2.enabled = true;
        // controls2.update()
    }

    // Render
    renderer.render(scene, cameras.currentCamera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()