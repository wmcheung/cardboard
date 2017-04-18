// import * as THREE from './third-party/threejs/three';

/**
 * WoningVR is realized with the help of an article on Medium
 * https://medium.com/adventures-in-consumer-technology/how-to-start-building-your-own-webgl-based-vr-app-cdaf47b8132a
 *
 * Description : WoningVR is based on heavy javascript use, which renders a heat map and making it possible to orientate through the building.
 * Author : Wesley Cheung <0887267@hr.nl>
 *
 */
/*******************************************
 * IMPORTS
 ******************************************/
import THREELib from "three-js";
import * as TWEEN from './third-party/Tween';
import * as ProgressBar from './third-party/progressbar';

/*******************************************
 * VARIABLES
 ******************************************/
let THREE = THREELib(["OBJLoader", "OrbitControls"]);
let StereoEffect = require('three-stereo-effect')(THREE);

let camera, scene, renderer,
    left_bar, right_bar, effect, controls,
    element, container, scCube, mesh, x, intersects,
    animScale, msg, buttonState;

let selectableObjs = [];
let current_scene = 1;
let scene_objects = [];
// let previousRaycastCoords;

let width = window.innerWidth, height = window.innerHeight;
let clock = new THREE.Clock();

let min = { x: 100, y: 100, z: 100 }
let touchTweenTo = new TWEEN.Tween(min);
let max = { x: 120, y: 120, z: 120 };

// Set up animation cycle used on touched objects
touchTweenTo.to(max, 200);
touchTweenTo.easing(TWEEN.Easing.Bounce.InOut);
touchTweenTo.repeat(Infinity); // repeats forever
touchTweenTo.start();

// Selection time for the guiding circles
let SELECTION_TIME = 2000;

// Full screen
let goFS    =   document.getElementById("goFS");
                document.getElementById("goFS").style.display = 'block';
let doc     =   window.document;
let docEl   =   doc.documentElement;

/*******************************************
 * EVENT LISTENERS
 ******************************************/
goFS.addEventListener("click", function() {
    fullscreen(docEl);
}, false);

document.addEventListener('webkitfullscreenchange', function(e) {
    buttonState = document.getElementById("goFS").style.display
    if (buttonState == 'block' || buttonState == 'undefined') {
        document.getElementById("goFS").style.display = 'none';
    }
    if (buttonState == 'none') {
        document.getElementById("goFS").style.display = 'block';
    }
});

function setOrientationControls(e) {
    if (!e.alpha) {
        return;
    }

    controls = require('three.orientation')(THREE, camera);
    controls.connect();
    controls.update();

    element.addEventListener('click', fullscreen, false);
    window.removeEventListener('deviceorientation', setOrientationControls, true);
}
window.addEventListener('deviceorientation', setOrientationControls, true);

document.getElementById("selection_confirmation_overlay").style.display = 'none';

/*******************************************
 * FUNCTIONS FOR BUILDING THE SCENE
 ******************************************/
function fullscreen(container) {
    if (container.requestFullscreen) {
        container.requestFullscreen();
    } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
    } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
    } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
    }
}

function resetCamera() {
    controls.target.set(
        camera.position.x + 0.1,
        camera.position.y,
        camera.position.z
    );
}

function create_guide_circles() {
    left_bar = new ProgressBar.Circle('#guide_circle_left', {
        strokeWidth: 10,
        easing: 'easeInOut',
        duration: SELECTION_TIME,
        color: 'lime',
        trailWidth: 2,
        svgStyle: null
    });

    right_bar = new ProgressBar.Circle('#guide_circle_right', {
        strokeWidth: 10,
        easing: 'easeInOut',
        duration: SELECTION_TIME,
        color: 'lime',
        trailWidth: 2,
        svgStyle: null
    });
}

function create_stereo_scene() {
    //Stereo scene
    renderer = new THREE.WebGLRenderer({ antialias: true });
    element = renderer.domElement;
    container = document.getElementById('scene');
    container.appendChild(element);

    effect = new StereoEffect(renderer);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(90, 1, 0.001, 700);
    camera.position.set(0, -5, 0);
    scene.add(camera);

    controls = new THREE.OrbitControls(camera, element);
    controls.target.set(
        camera.position.x + 0.1,
        camera.position.y,
        camera.position.z
    );

    // Add lights
    let ambLight = new THREE.AmbientLight( 0x808080 ); // soft white light

    let ptLight = new THREE.PointLight(0xffffff, 1.75, 1000);
    ptLight.position.set(-100, 100, 100);

    scene.add(ambLight);
    scene.add(ptLight);
}

function generateWarpObjects() {
    scene_objects[1] = new Array(
        { x: -28, y: -2.7, z: -40, name: 'warp', scene: '2' },
        { x: -40, y: -8, z: -11, name: 'warp', scene: '3' }
    );

    scene_objects[2] = new Array(
        { x: -1, y: -2.7, z: -2, name: 'warp', scene: '2' },
    );

    scene_objects[3] = new Array(
        { x: -1, y: -2.7, z: -4, name: 'warp', scene: '2' },
    );
}

function drawScene(load_image) {
    let geometry = new THREE.SphereGeometry( 50, 30, 15 );
    geometry.scale( - 1, 1, 1 );
    // geometry.userData = {name: 'sphere_scene', touched: false };

    let material = new THREE.MeshBasicMaterial( {
        map: new THREE.TextureLoader().load(load_image)
    });

    mesh = new THREE.Mesh( geometry, material );
    mesh.material.side = THREE.DoubleSide;

    selectableObjs.push(mesh);
    scene.add(mesh);
}

function meshloader(fileName, position_x, position_y, position_z, rotation, title, warpTo){
    return function(geometry){
        //Place in scene
        let color;

        color = 0xFF6500;
        geometry.scale.set(50, 50, 50);
        geometry.position.z = position_z;
        geometry.position.y = position_y;
        geometry.position.x = position_x;
        geometry.rotation.y = rotation;
        selectableObjs.push(geometry);

        geometry.userData = {
            name: title,
            touched:false,
            scene: warpTo
        };

        scene.add(geometry);


        //Apply material
        geometry.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                let material = new THREE.MeshPhongMaterial(
                    { color: color,
                        side: THREE.DoubleSide,
                        emissive: 0x000000,
                        envMap: scCube
                    }
                );
                child.material = material;
            }
        });
    }
}

function drawShapes() {
    let manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {
        console.log( item, loaded, total );
    };

    let objLoader = new THREE.OBJLoader(manager);

    scene_objects[current_scene].forEach( (obj) => {
        objLoader.load( "models/star_charm.obj", meshloader("models/star_charm.obj", obj.x, obj.y, obj.z, 0.5, obj.name, obj.scene));
    });
    // objLoader.load( "models/star_charm.obj", meshloader("models/star_charm.obj", -28, -2.7, -40, 0.5, "warp_1"));
    // objLoader.load( "models/star_charm.obj", meshloader("models/star_charm.obj", -40, -8, -11, 0.5, "warp_2"));

    // objLoader.load( "models/star_charm.obj", meshloader("models/star_charm.obj", -35, 5, -15, 0.5, "objStar"));
}

// Clean up the objects with the name 'warp'
function cleanWarpObjects() {
    scene.children.forEach( (object) => {
        if(object.userData.name == 'warp') {
            scene.remove(object);
        }
    });
}

//What happens after an object is selected
function postSelectAction(selectedObjectName, selectedObjectWarpNumber) {
    document.getElementById("selection_confirmation_overlay").style.display = 'block';

    setTimeout(function() {
        document.getElementById("selection_confirmation_overlay").style.display = 'none';
        if(selectedObjectName == 'warp') {
            cleanWarpObjects();

            current_scene = selectedObjectWarpNumber;
            drawShapes();
            drawScene('./images/room_'+ selectedObjectWarpNumber +'.jpg');
            resetCamera();
        }
    }, 250);

}

function getIntersections(objects){
    let raycaster = new THREE.Raycaster();

    let vector = new THREE.Vector3( 0, 0, - 1 );
        vector.applyQuaternion( camera.quaternion );

    raycaster.set( camera.position, vector );

    return raycaster.intersectObjects( objects, true );
}

function updateHUDTxt(msg){
    x=document.getElementsByClassName("info_text");  // Find the elements
    for(let i = 0; i < x.length; i++){
        x[i].innerText=msg;    // Change the content
    }
}

function getTouchMsg(charm){
    return "Blijf naar het object kijken om naar de volgende scene te gaan.";
}

function resize() {
    let width = container.offsetWidth;
    let height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    effect.setSize(width, height);
}

function update(dt) {
    resize();

    camera.updateProjectionMatrix();

    // check camera positioning
    // console.log(camera.position);
    controls.update(dt);
}

function render(dt) {
    updateHUDTxt(""); //Set HUD txt to blank to start render loop.

    intersects = getIntersections(selectableObjs);
    // console.log(intersects);

    if (intersects.length == 0){//nothing being "touched"
        left_bar.set(0.0);//reset any active progress bars to 0
        right_bar.set(0.0);

        //Loop over all OBJ objects
        scene.traverse (function (object)
        {
            //Set all touch flag to false as nothing is selected.
            if (object instanceof THREE.Group){
                if (intersects.length == 0){
                    object.userData.touched = false;
                }
            }
        });
    } else {//something being touched
        // console.log(intersects[0].point);
        let point_x = intersects[0].point.x;
        let point_y = intersects[0].point.y;
        let point_z = intersects[0].point.z;

        // translucent blue sphere with additive blending for "glow" effect
        var sphereGeom =  new THREE.SphereGeometry( 2, 10, 10 );
        var darkMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00,  transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending } );
        var sphere = new THREE.Mesh( sphereGeom.clone(), darkMaterial );
        sphere.position.set(point_x, point_y, point_z);
        scene.add( sphere );

        //Set the touched touch flag to true, so we can give it special treatment in the animation function
        intersects[0].object.parent.userData.touched = true;
        msg = getTouchMsg(intersects[0].object.parent.userData.name); //update HUD text to register the touch
        updateHUDTxt(msg);
    }

    effect.render(scene, camera);
}

function animate(t) {
    TWEEN.update();

    touchTweenTo.onUpdate(function() {
        animScale = this;
    });

    scene.traverse (function (object)
    {
        if (object instanceof THREE.Group)
        {
            // object.rotation.y = object.rotation.y + 0.01;

            if (object.userData.touched){
                object.scale.x = animScale.x/1.5;
                object.scale.y = animScale.y/1.5;
                object.scale.z = animScale.z/1.5;


                if(left_bar.value() == 0){//don't restart progress bar if already progress
                    left_bar.animate(1.0, {
                    }, function() {
                        postSelectAction(object.userData.name, object.userData.scene);//add callback to left side progress bar to register completed selection
                    });
                }
                if(right_bar.value() == 0){//don't restart if in progress
                    right_bar.animate(1.0);
                }

            }
        }
    });

    requestAnimationFrame(animate);

    update(clock.getDelta());
    render(clock.getDelta());
}



function initialize_vr() {
    create_guide_circles();
    create_stereo_scene();

    generateWarpObjects();
    drawShapes();
    drawScene('./images/room_1.jpg');

    window.addEventListener('resize', resize, false);
    setTimeout(resize, 1);
}

/*******************************************
 * BUILD THREE.JS SCENE
 ******************************************/
initialize_vr();
animate();
