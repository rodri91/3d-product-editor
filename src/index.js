import "./styles/styles.scss";
import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import ModelPath from './assets/chair.gltf';

import Fabric1 from './assets/img/textures/fabric1.png';
import Fabric2 from './assets/img/textures/fabric2.png';
import Fabric3 from './assets/img/textures/fabric3.png';
import Fabric4 from './assets/img/textures/fabric4.png';
import Fabric5 from './assets/img/textures/fabric5.png';

function lightenDarkenColor(col, amt) {
  var num = parseInt(col, 16);
  var r = (num >> 16) + amt;
  var b = ((num >> 8) & 0x00FF) + amt;
  var g = (num & 0x0000FF) + amt;
  var newColor = g | (b << 8) | (r << 16);
  return newColor.toString(16);
}

//Controls
const COLORSTRAY = document.getElementById('color-options');

const colors = [
  {
    color: '7400b8'
  },
  {
    color: '6930c3'
  },
  {
    color: '5e60ce'
  },
  {
    color: '5390d9'
  }, 
  {
    color: '4ea8de'
  }, 
  {
    color: '48bfe3'
  }, 
  {
    color: '56cfe1'
  }, 
  {
    color: '64dfdf'
  }, 
  {
    color: '72efdd'
  }, 
  {
    color: '80ffdb'
  }, 
  {
    color: 'd8f3dc'
  }, 
  {
    color: 'b7e4c7'
  }, 
  {
    color: '95d5b2'
  }, 
  {
    color: '74c69d'
  }, 
  {
    color: '52b788'
  }, 
  {
    color: '40916c'
  }, 
  {
    color: '2d6a4f'
  }, 
  {
    color: '1b4332'
  }, 
  {
    color: 'ffcbf2'
  }, 
  {
    color: 'f3c4fb'
  }, 
  {
    color: 'ecbcfd'
  }, 
  {
    color: 'e5b3fe'
  }, 
  {
    color: 'e2afff'
  }, 
  {
    color: 'deaaff'
  }, 
  {
    color: 'd8bbff'
  }, 
  {
    color: 'd0d1ff'
  }, 
  {
    color: 'c8e7ff'
  }, 
  {
    color: 'c0fdff'
  }, 
  {
    texture: Fabric1,
    size: [4,4,4],
    shininess: 10
  },
  {
    texture: Fabric2,
    size: [4,4,4],
    shininess: 10
  },
  {
    texture: Fabric3,
    size: [4,4,4],
    shininess: 10
  },
  {
    texture: Fabric4,
    size: [4,4,4],
    shininess: 10
  },
  {
    texture: Fabric5,
    size: [4,4,4],
    shininess: 10
  }
]
var activeOption = 'legs';

// Function - Build Colors
function buildColors(colors) {
  let template = document.getElementById("color-option-template");
  for (let [i, color] of colors.entries()) {
    let clone = template.content.cloneNode(true);
    let circle = clone.querySelector('.circle');
    let button = clone.querySelector('button')

    if(color.color) {
      circle.setAttribute(
        'style', 
        `--color: #${color.color}; --color-darken: #${lightenDarkenColor(color.color, -40)}`
      )
    } else {
      circle.classList.add('texture');
      circle.setAttribute(
        'style',
        `background-image: url("${color.texture}")`
      )
    }
    button.setAttribute('data-key', i);

    COLORSTRAY.append(document.importNode(clone, true));
  }
}

buildColors(colors);

// Swatches
const swatches = document.querySelectorAll("#color-options .option button");

function selectSwatch(e) {
  let color = colors[parseInt(e.target.dataset.key)];
  let new_mtl;

  if(color.color) {
    new_mtl = new THREE.MeshPhongMaterial({
      color: parseInt('0x' + color.color),
      shininess: color.shininess ? color.shininess : 10
    });
  } else {
    let txt = new THREE.TextureLoader().load(color.texture);
      
    txt.repeat.set( color.size[0], color.size[1], color.size[2]);
    txt.wrapS = THREE.RepeatWrapping;
    txt.wrapT = THREE.RepeatWrapping;
    
    new_mtl = new THREE.MeshPhongMaterial( {
      map: txt,
      shininess: color.shininess ? color.shininess : 10
    }); 
  }
  

  for (const otherSwatches of swatches) {
    otherSwatches.classList.remove('--is-active');
  }
  e.target.classList.add('--is-active');
 
 setMaterial(theModel, activeOption, new_mtl);
}

function setMaterial(parent, type, mtl) {
  parent.traverse((o) => {
   if (o.isMesh && o.name != null) {
     if (o.name == type) {
          o.material = mtl;
       }
   }
 });
}

for (const swatch of swatches) {
  swatch.addEventListener('click', selectSwatch);
}

// Select Element Option
const elementsOptions = document.querySelectorAll("#control-elements .option button");

for (const option of elementsOptions) {
  option.addEventListener('click',selectOption);
}

function selectOption(e) {
  let option = e.target;
  activeOption = option.value;
  for (const otherOption of elementsOptions) {
    otherOption.classList.remove('--is-active');
  }
  option.classList.add('--is-active');
}



//Scene

var theModel;
var cameraFar = 5;

const BACKGROUND_COLOR = 0xf1f1f1;
const INITIAL_MTL = new THREE.MeshPhongMaterial( { color: 0xf1f1f1, shininess: 10 } );

const INITIAL_MAP = [
  {childID: "back", mtl: INITIAL_MTL},
  {childID: "base", mtl: INITIAL_MTL},
  {childID: "cushions", mtl: INITIAL_MTL},
  {childID: "legs", mtl: INITIAL_MTL},
  {childID: "supports", mtl: INITIAL_MTL},
];

const scene = new THREE.Scene();
scene.background = new THREE.Color(BACKGROUND_COLOR );
scene.fog = new THREE.Fog(BACKGROUND_COLOR, 20, 100);

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio); 

document.body.appendChild(renderer.domElement);

var camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = cameraFar;
camera.position.x = 0;

// Function - Add the textures to the models
function initColor(parent, type, mtl) {
  parent.traverse((o) => {
   if (o.isMesh) {
     if (o.name.includes(type)) {
          o.material = mtl;
          o.nameID = type; // Set a new property to identify this object
       }
   }
 });
}

// Init the object loader
var loader = new GLTFLoader();

loader.load(ModelPath, function(gltf) {
  theModel = gltf.scene;

  theModel.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  // Set the models initial scale   
  theModel.scale.set(2,2,2);

  theModel.rotation.y = Math.PI;

  // Offset the y position a bit
  theModel.position.y = -1;

  // Set initial textures
  for (let object of INITIAL_MAP) {
    initColor(theModel, object.childID, object.mtl);
  }

  // Add the model to the scene
  scene.add(theModel);

}, undefined, function(error) {
  console.error(error)
});

// Add lights
var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.61 );
    hemiLight.position.set( 0, 50, 0 );
// Add hemisphere light to scene   
scene.add( hemiLight );

var dirLight = new THREE.DirectionalLight( 0xffffff, 0.54 );
    dirLight.position.set( -8, 12, 8 );
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
// Add directional Light to scene    
scene.add( dirLight );

var floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
var floorMaterial = new THREE.MeshPhongMaterial({
  color: 0xeeeeee,
  shininess: 0
});

var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -0.5 * Math.PI;
floor.receiveShadow = true;
floor.position.y = -1;
scene.add(floor);

var controls = new OrbitControls( camera, renderer.domElement );
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = Math.PI / 3;
controls.enableDamping = true;
controls.enablePan = true;
controls.dampingFactor = 0.1;
controls.autoRotate = false; // Toggle this if you'd like the chair to automatically rotate
controls.autoRotateSpeed = 1; // 30

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
  
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
}

animate();

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  var width = window.innerWidth;
  var height = window.innerHeight;
  var canvasPixelWidth = canvas.width / window.devicePixelRatio;
  var canvasPixelHeight = canvas.height / window.devicePixelRatio;

  const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
  if (needResize) {
    
    renderer.setSize(width, height, false);
  }
  return needResize;
}