const scene = new THREE.Scene();
const canvasPanel = document.querySelector('#canvas-panel');
const canvasWidth = canvasPanel.getBoundingClientRect().width;
const canvasHeight = canvasPanel.getBoundingClientRect().height;
const camera = new THREE.PerspectiveCamera(
    75,
    canvasWidth / canvasHeight,
    0.1,
    1000
);
scene.background = new THREE.Color(0xffffff);
camera.position.z = 30;
const renderer = new THREE.WebGLRenderer();
const textureLoader = new THREE.TextureLoader();

var shoe = null;
const shoeUnits = [];
const textures = [
    './texture/S434-A1.png',
    './texture/S434-B1.png',
    './texture/S434-C1.png',
    './texture/S436-A1.png',
    './texture/S436-B1.png',
    './texture/S436-C1.png'
];
const whiteBackground = new THREE.Color(0xffffff);
const WhiteTexture = textureLoader.load('./texture/WHITE.png');
const textureItems = textures.map((url) => {
    return {
        url,
        texture: textureLoader.load(url)
    };
});

const app = new Vue({
    el: '#app',
    data: {
        units: [],
        hoverUnitName: null,
        activeUnitName: null,
        textures: [...textures],
        loaded: 0
    },
    computed: {
        activeUnit() {
            const name = this.activeUnitName;
            return shoeUnits.find((o) => o.name === name);
        },
        progressStyle() {
            const loaded = this.loaded;
            const value = Math.floor(loaded * 100) / 100;
            return {
                width: `${value}%`
            };
        }
    },
    watch: {
        hoverUnitName(unit, old) {
            const activeName = this.activeUnitName;
            const unitObj = shoeUnits.find((so) => so.name === unit);
            if (unitObj) {
                unitObj.material.color = new THREE.Color(0xb8daff);
            }
            const oldObj = shoeUnits.find((so) => so.name === old);
            if (oldObj) {
                oldObj.material.color = new THREE.Color(0xffffff);
            }
        }
    },
    mounted() {
        console.info('run');
        renderer.setSize(canvasWidth, canvasHeight);
        this.$refs.cpanel.appendChild(renderer.domElement);
    },
    methods: {
        onActiveUnit(unit) {
            this.activeUnitName = this.activeUnitName === unit ? null : unit;
        },
        onHoverUnit(unit) {
            this.hoverUnitName = unit;
        },
        clearHoverUnit() {
            this.hoverUnitName = null;
        },
        onActiveTexture(url) {
            const name = this.activeUnitName;
            const unit = shoeUnits.find((o) => o.name === name);

            const findTexture = textureItems.find((o) => o.url === url);
            if (unit && findTexture && findTexture.texture) {
                unit.material.map = findTexture.texture;
            }
        }
    }
});

// const loader = new THREE.ObjectLoader();
const loader = new THREE.OBJLoader();
// const loader = new THREE.GLTFLoader();
loader.load(
    // './models/sh.obj',
    './models/nike-air-max-low-poly.obj',
    // './models/nike-air-max-low-poly.json',

    // onLoad callback
    // Here the loaded data is assumed to be an object
    function(obj) {
        // Add the loaded object to the scene
        shoe = obj;

        const removes = [];
        obj.traverse((o) => {
            if (o.isMesh) {
                if (['Plane', 'Cylinder', 'Cone'].indexOf(o.name) >= 0) {
                    removes.push(o);
                    return;
                }

                shoeUnits.push(o);
                app.units.push(o.name);
                o.material = new THREE.MeshLambertMaterial();
                o.material.color = whiteBackground;
                o.material.map = WhiteTexture;

                switch (o.name) {
                    case 'swoosh_left':
                        o.material.side = THREE.BackSide;
                        break;
                    case 'fabric_insole':
                    case 'sole':
                    case 'sole_sole_Material_Sole':
                        /* 修正左側 mark 渲染方向錯誤 */
                        // o.material.position.z = -0.1;
                        o.material.side = THREE.DoubleSide;
                        break;
                }
            }
        });
        obj.position.y = -5;
        scene.add(obj);
        removes.forEach((o) => {
            obj.remove(o);
        });

        // 鞋右光源
        addLight(obj, {
            color: '#fff',
            intensity: 0.8,
            distance: 100,
            x: 0,
            y: 10,
            z: 50
        });
        // 鞋左光源
        addLight(obj, {
            color: '#fff',
            intensity: 0.8,
            distance: 100,
            x: 0,
            y: 10,
            z: -50
        });
        // 鞋正光源
        addLight(obj, {
            color: '#fff',
            intensity: 0.8,
            distance: 20,
            x: 20,
            y: 20,
            z: 0
        });
        // 鞋背光源
        addLight(obj, {
            color: '#fff',
            intensity: 0.8,
            distance: 20,
            x: -30,
            y: 10,
            z: 0
        });
    },

    // onProgress callback
    function(xhr) {
        app.loaded = (xhr.loaded / xhr.total) * 100;
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },

    // onError callback
    function(err) {
        console.error('An error happened', err);
    }
);

function addLight(target, { x, y, z, color, distance, intensity }) {
    const pointLight = new THREE.PointLight({
        color,
        // 光線照亮距離
        distance
    });
    // 光源強度
    pointLight.intensity = intensity;

    // 設定光源位置
    pointLight.position.set(x, y, z);

    // 設定光源目標
    pointLight.target = target;
    scene.add(pointLight);
}

function initControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    //设置控制器的中心点
    //controls.target.set( 0, 100, 0 );
    // 如果使用animate方法时，将此函数删除
    //controls.addEventListener( 'change', render );
    // 使动画循环使用时阻尼或自转 意思是否有惯性
    controls.enableDamping = true;
    //动态阻尼系数 就是鼠标拖拽旋转灵敏度
    //controls.dampingFactor = 0.25;
    //是否可以缩放
    controls.enableZoom = true;
    //是否自动旋转
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;
    //设置相机距离原点的最远距离
    controls.minDistance = 1;
    //设置相机距离原点的最远距离
    controls.maxDistance = 2000;
    //是否开启右键拖拽
    controls.enablePan = false;
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
initControls();
animate();
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function onDocumentMouseDown(event) {
    event.preventDefault();

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(shoeUnits);
    if (intersects.length > 0) {
        const first = intersects[0].object;
        app.activeUnitName = first.name;
        app.hoverUnitName = first.name;
        setTimeout(() => (app.hoverUnitName = null), 150);
    }
}
renderer.domElement.addEventListener('mousedown', onDocumentMouseDown);
