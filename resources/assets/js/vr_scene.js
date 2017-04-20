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
import THREELib from 'three-js';
import * as TWEEN from './third-party/Tween';
import * as ProgressBar from './third-party/progressbar';
import $http from './promise';

/*******************************************
 * VARIABLES
 ******************************************/
let THREE = THREELib(["OBJLoader", "OrbitControls"]);
let StereoEffect = require('three-stereo-effect')(THREE);

let camera, scene, renderer, manager,
    left_bar, right_bar, effect, controls,
    element, container, scCube, mesh, x, intersects,
    animScale, msg, buttonState, trail_opacity;

let selectableObjs = [];
let current_scene = 1;
let scene_objects = [];
let heatmap_trail = [];
let heatmap_trail_radius_max = false;
let creating_heatmap = false;
let sending_to_database = false;

let radius = 2;
// let previousRaycastCoords;

let prev_point_x = null;
let prev_point_y = null;
let prev_point_z = null;

let width = window.innerWidth, height = window.innerHeight;
let textureLoader = new THREE.TextureLoader();
let clock = new THREE.Clock();

let min = { x: 100, y: 100, z: 100 }
let touchTweenTo = new TWEEN.Tween(min);
let max = { x: 120, y: 120, z: 120 };

const color_red = 0xCB5F5F;
const color_white = 0xEDE7B4;

// This is a hack since .toString() does not save the correct value in the database.
const color_red_string = '0xCB5F5F';
const color_white_string= '0xEDE7B4';

let reset_able_time = 0;
let database_send_time = 0;
let current_time = 0;

// Set up animation cycle used on touched objects
touchTweenTo.to(max, 200);
touchTweenTo.easing(TWEEN.Easing.Bounce.InOut);
touchTweenTo.repeat(Infinity); // repeats forever
touchTweenTo.start();

// Selection time for the guiding circles
let SELECTION_TIME = 2000;

let DEBUG = false;
let SHOW_HEATMAP = false;
const DEBUG_COORDS = false;


// URI : http://stackoverflow.com/questions/827368/using-the-get-parameter-of-a-url-in-javascript
let show_heatmap = getQueryVariable("show_heatmap");
let show_debug = getQueryVariable("debug");

if(show_heatmap) {
    SHOW_HEATMAP = true;
    DEBUG = true;
}else{
    SHOW_HEATMAP = false;
    DEBUG = false;
}

if(show_debug) { DEBUG = true; }

if(DEBUG) {
    trail_opacity = 0.2;
}else{
    trail_opacity = 0.0;
}

// Full screen
let goFS    =   document.getElementById("goFS");
                document.getElementById("goFS").style.display = 'none';
                
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
function getQueryVariable(variable) {
    let query = window.location.search.substring(1);
    let vars = query.split("&");
    for (let i=0;i<vars.length;i++) {
        let pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
}

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

function generateWarpObjectsCoords() {
    scene_objects[1] = new Array(
        { x: -28, y: -2.7, z: -40, rotate: 0.5, name: 'warp', scene: '2' },
        { x: -40, y: -8, z: -11, rotate: 0.5, name: 'warp', scene: '3' }
    );

    scene_objects[2] = new Array(
        { x: 36, y: -0.6, z: -12, rotate: 1.3, name: 'warp', scene: '1' },
        { x: 37, y: -1.9, z: 32, rotate: 1, name: 'warp', scene: '3' }
    );

    scene_objects[3] = new Array(
        { x: 43, y: -2.5, z: -20, rotate: 1.4,  name: 'warp', scene: '1' },
        { x: -26, y: -9, z: 38, rotate: 0.2, name: 'warp', scene: '4' }
    );

    scene_objects[4] = new Array(
        { x: 37, y: -7, z: 29, rotate: 1.4,  name: 'warp', scene: '3' },
    );
}

function getHeatmapByScene(scene_number) {
    let API_URI = 'api/heatmap';
    let payload = {
        'scene' : scene_number,
    };

    let callback = {
        success : function(data){
            let parsed_data = JSON.parse(data).result;

            for(let key in parsed_data) {
                let object = parsed_data[key];
                let sphere_opacity = 0;
                let color = object.hex_color;
                let chosen_color;

                if(DEBUG) {
                    sphere_opacity = object.opacity;
                }else{
                    sphere_opacity = trail_opacity;
                }

                if(color === color_red_string)      { chosen_color = color_red; }
                if(color === color_white_string)    { chosen_color = color_white; }

                let sphereGeom =  new THREE.SphereGeometry( object.radius, 10, 10 );
                let darkMaterial = new THREE.MeshBasicMaterial( { color: chosen_color,  transparent: true, opacity: sphere_opacity, blending: THREE.AdditiveBlending } );
                let sphere = new THREE.Mesh( sphereGeom.clone(), darkMaterial );
                sphere.name = 'heatmap_trail';
                sphere.userData = {
                    scene: object.scene_number
                };

                sphere.position.set(object.position_x, object.position_y, object.position_z);
                scene.add(sphere);

                // create_heatmap_sphere(object.position_x, object.position_y, object.position_z, object.scene_number, object.hex_color, object.opacity, object.radius, true);_
            }
        },
        error : function(data){
            // console.log(2, 'error', JSON.parse(data));
        }
    };

    // Executes the method call
    $http(API_URI)
        .get(payload)
        .then(callback.success)
        .catch(callback.error);
}

function createHeatmapTrail(scene_number, position_x, position_y, position_z, hex_color, radius, opacity) {
    let API_URI = 'api/heatmap';
    let payload = {
        'scene_number': scene_number,
        'position_x': position_x,
        'position_y': position_y,
        'position_z': position_z,
        'hex_color': hex_color,
        'radius': radius,
        'opacity': opacity
    };

    let callback = {
        success : function(data){
            let parsed_data = JSON.parse(data);

            if(DEBUG) {
                console.log('MESSAGE: ' + parsed_data.message);
            }
        },
        error : function(data){
            // console.log(2, 'error', JSON.parse(data));
        }
    };

    // Executes the method call
    $http(API_URI)
        .post(payload)
        .then(callback.success)
        .catch(callback.error);
}

function drawScene() {
    // Create the sphere
    let scene_geometry = new THREE.SphereGeometry( 50, 30, 15 );
    scene_geometry.scale( - 1, 1, 1 );

    let scene_material = new THREE.MeshBasicMaterial( {
        map: textureLoader.load('./images/room_' + current_scene + '.jpg')
    });

    let scene_mesh = new THREE.Mesh( scene_geometry, scene_material );
    scene_mesh.name = 'sphere_scene';
    scene_mesh.material.side = THREE.DoubleSide;

    selectableObjs.push(scene_mesh);
    scene.add(scene_mesh);

    getHeatmapByScene(current_scene);
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
        geometry.visible = false;

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
    manager = new THREE.LoadingManager();

    // manager.onProgress = function ( item, loaded, total ) {
    //     // console.log( item, loaded, total );
    // };

    let objLoader = new THREE.OBJLoader(manager);

    for (let i = 1; i <= scene_objects.length - 1; i++) {
        scene_objects[i].forEach( (obj) => {
            objLoader.load( "models/star_charm.obj", meshloader("models/star_charm.obj", obj.x, obj.y, obj.z, obj.rotate, obj.name, obj.scene));
        });
    }
}

// Clean up the objects with the name 'warp' by turning it into false visibility
function cleanWarpObjects() {
    left_bar.set(0.0);
    right_bar.set(0.0);

    scene.children.forEach( (object) => {
        // if(object.name == 'sphere_scene') {
        //     // console.log('removed sphere');
        //     scene.remove(object);
        // }

        if(object instanceof THREE.Group) {
            object.userData.touched = false;
            object.visible = false;
            // scene.remove(object);
        }
    });

   //  for (let i = scene.children.length - 1; i >= 0 ; i--) {
   //     if(scene.children[i] instanceof THREE.Group) {
   //         var object = scene.children[i];
   //         object.visible = false;
   //         // scene.remove(object);
   //     }
   // }
}

function showWarpObjects() {
    scene.children.forEach( (object) => {
        // console.log(object);
        if(object instanceof THREE.Group) {
            scene_objects[current_scene].forEach( (warpObject) => {
                if(object.position.x == warpObject.x && object.position.y == warpObject.y && object.position.z == warpObject.z) {
                    object.visible = true;
                }
            });
        }
        // console.log(object.userData);
    });
}

//What happens after an object is selected
function postSelectAction(selectedObjectName, selectedObjectWarpNumber) {
    document.getElementById("selection_confirmation_overlay").style.display = 'block';

    setTimeout(function() {
        document.getElementById("selection_confirmation_overlay").style.display = 'none';
        if(selectedObjectName == 'warp') {
            cleanWarpObjects();

            // When creating a heatmap. Wait untill its done. Clean the heatmap_trail array
            creating_heatmap = true;

            // When changing to another scene. Create a heatmap.
            send_heatmap_to_database(selectedObjectWarpNumber);
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

function getTouchMsg(txt){
    return txt;
}

function resize() {
    let width = container.offsetWidth;
    let height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    effect.setSize(width, height);
}

function create_heatmap_sphere(point_x, point_y, point_z, scene_number, color = color_white_string, radius = 2, opacity = null, is_old_heatmap = false) {
    // SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength)
    let sphere_opacity = 0;
    if(opacity != null) {
        sphere_opacity = opacity;
    }else{
        sphere_opacity = trail_opacity
    }

    let chosen_color;
    if(color === color_red_string)      { chosen_color = color_red; }
    if(color === color_white_string)    { chosen_color = color_white; }

    let sphereGeom =  new THREE.SphereGeometry( radius, 10, 10 );
    let darkMaterial = new THREE.MeshBasicMaterial( { color: chosen_color,  transparent: true, opacity: sphere_opacity, blending: THREE.AdditiveBlending } );
    let sphere = new THREE.Mesh( sphereGeom.clone(), darkMaterial );
    sphere.name = 'heatmap_trail';
    sphere.userData = {
        scene: scene_number
    };


    sphere.position.set(point_x, point_y, point_z);

    if(!is_old_heatmap){
        heatmap_trail.push(sphere);
    }

    scene.add(sphere);
}

function asyncFunction (object, cb) {
    setTimeout(() => {
        let radius          = Math.round(object.geometry.boundingSphere.radius);
        // let opacity         = object.material.opacity;
        let opacity         = 0.2;
        // let transparent     = object.material.transparent;

        let color = '';

        // When radius equals 2. Color needs to be white.
        if(radius === 2) {
            color = color_white_string;
        }else{
            color = color_red_string;
        }

        createHeatmapTrail(current_scene, object.position.x, object.position.y, object.position.z, color, radius, opacity);
        if(DEBUG) {
            console.log("MESSAGE: Sending heatmap trail to database");
        }
        cb();
    }, 150);
}

function send_heatmap_to_database(selectedWarpNumber) {
    for (let i = 0; i <= scene.children.length - 1; i++) {
        if (scene.children[i].name === "heatmap_trail") {
            let object = scene.children[i];
            object.visible = false;

            // Removing the object from the scene does not cleans everything completely. I assume it's a bug in THREE.js
            // scene.remove(object);
        }
    }

    if(!SHOW_HEATMAP) {
        if (heatmap_trail.length > 0) {
            // Information on how to create an asynchronous foreach with reduce and promise
            // URI : http://stackoverflow.com/questions/18983138/callback-after-all-asynchronous-foreach-callbacks-are-completed
            let requests = heatmap_trail.reduce((promiseChain, item) => {
                return promiseChain.then(() => new Promise((resolve) => {
                    asyncFunction(item, resolve);
                }));
            }, Promise.resolve());

            // When all the requests are done.
            requests.then(() => {
                // Reset the heatmap trails for the next scene.
                heatmap_trail = [];

                // Making all the sphere scenes invisible. Reduces lagg and fixes the issue with warping.
                for (let i = 0; i <= scene.children.length - 1; i++) {
                    if (scene.children[i].name === "sphere_scene") {
                        let object = scene.children[i];
                        object.visible = false;
                    }
                }

                current_scene = selectedWarpNumber;
                showWarpObjects();
                // drawShapes();
                drawScene();
                resetCamera();

                creating_heatmap = false;
            });
        }
    }else{
        // Reset the heatmap trails for the next scene.
        heatmap_trail = [];

        // Making all the sphere scenes invisible. Reduces lagg and fixes the issue with warping.
        for (let i = 0; i <= scene.children.length - 1; i++) {
            if (scene.children[i].name === "sphere_scene") {
                let object = scene.children[i];
                object.visible = false;
            }
        }

        current_scene = selectedWarpNumber;
        showWarpObjects();
        // drawShapes();
        drawScene();
        resetCamera();

        creating_heatmap = false;
    }
}

function update(dt) {
    resize();

    camera.updateProjectionMatrix();

    // check camera positioning
    // console.log(camera.position);
    controls.update(dt);

    // if(database_send_time >= 100) {
    //     send_heatmap_to_database();
    // }else{
    //     database_send_time++;
    // }

    if(!SHOW_HEATMAP) {
        if (!creating_heatmap) {
            reset_able_time++;
        } else {
            reset_able_time = 0;
        }
    }

    current_time = clock.getElapsedTime();
}

function render(dt) {
    updateHUDTxt(""); //Set HUD txt to blank to start render loop.

    intersects = getIntersections(selectableObjs);
    // console.log(intersects);

    //Set the touched touch flag to true, so we can give it special treatment in the animation function
    if(intersects.length >= 3) {
        var userData = intersects[0].object.parent.userData;
        if(userData.name == 'warp') {
            userData.touched = true;
        }
        // msg = getTouchMsg(intersects[0].object.parent.userData.name); //update HUD text to register the touch
        msg = getTouchMsg('Blijf naar het object kijken om naar de volgende scene te gaan.');
        updateHUDTxt(msg);
    }else{
        left_bar.set(0.0); //reset any active progress bars to 0
        right_bar.set(0.0);

        // Reset all the warp objects to false so the animation will stop
        scene.traverse (function (object)
        {
            if (object instanceof THREE.Group) {
                object.userData.touched = false;
            }
        });

        if(DEBUG_COORDS) {
            console.log(intersects[0].point);
        }

        let point_x = intersects[0].point.x;
        let point_y = intersects[0].point.y;
        let point_z = intersects[0].point.z;

        // translucent blue sphere with additive blending for "glow" effect
        if(reset_able_time >= 10) {
            // console.log(heatmap_trail_radius_max);
            if (heatmap_trail.length > 0) {
                heatmap_trail.forEach((object) => {
                    if (intersects[0].point.x == object.position.x && intersects[0].point.y == object.position.y && intersects[0].point.z == object.position.z) {
                        prev_point_x = point_x;
                        prev_point_y = point_y;
                        prev_point_z = point_z;

                        if (!heatmap_trail_radius_max) {
                            if (radius >= 10) {
                                // console.log('radius maxed');
                                radius = 2;
                                heatmap_trail_radius_max = true;
                            } else {
                                // console.log('radius not maxed');
                                radius++;
                                object.geometry = new THREE.SphereGeometry(radius, 10, 10);
                                object.material = new THREE.MeshBasicMaterial({
                                    color: color_red,
                                    transparent: true,
                                    opacity: trail_opacity,
                                    blending: THREE.AdditiveBlending
                                });
                            }
                        }
                    }

                    // console.log( 'PREV: '+ prev_point_x, prev_point_y, prev_point_z);
                    // console.log( 'NEW: '+ point_x, point_y, point_z);
                    if (prev_point_x != point_x && prev_point_y != point_y && prev_point_z != point_z) {
                        if (reset_able_time >= 3) {
                            // heatmap_sphere_created = true;
                            heatmap_trail_radius_max = false;
                            create_heatmap_sphere(point_x, point_y, point_z, current_scene);
                        }
                    }

                    reset_able_time = 0;
                });
            } else {
                // console.log('empty trail');
                create_heatmap_sphere(point_x, point_y, point_z, current_scene);
            }
        }
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

    drawScene();

    generateWarpObjectsCoords();
    drawShapes();

    manager.onLoad = () => {
        showWarpObjects();
    }

    window.addEventListener('resize', resize, false);
    setTimeout(resize, 1);
}

/*******************************************
 * BUILD THREE.JS SCENE
 ******************************************/
initialize_vr();
animate();
