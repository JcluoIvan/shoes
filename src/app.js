var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
scene.background = new THREE.Color(0xffffff);
camera.position.z = 50;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const textureLoader = new THREE.TextureLoader();

const whiteBackground = new THREE.Color(0xffffff);
const loader = new THREE.ObjectLoader();
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
const WhiteTexture = textureLoader.load('./texture/WHITE.png');
const textureItems = textures.map((url) => {
    return {
        url,
        texture: textureLoader.load(url)
    };
});

const app = new Vue({
    el: '#setting',
    data: {
        units: [],
        hoverUnitName: null,
        activeUnitName: null,
        textures: [...textures]
    },
    computed: {
        activeUnit() {
            const name = this.activeUnitName;
            return shoeUnits.find((o) => o.name === name);
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
            if (unit && findTexture) {
                console.info(unit, findTexture);
                unit.material.map = findTexture.texture;
                console.info(unit === fum);
            }
        }
    }
});

loader.load(
    './models/nike-air-max-low-poly.json',

    // onLoad callback
    // Here the loaded data is assumed to be an object
    function(obj) {
        // Add the loaded object to the scene
        console.warn(obj);
        shoe = obj;

        obj.traverse((o) => {
            if (o.isMesh) {
                shoeUnits.push(o);
                app.units.push(o.name);
                o.material.color = whiteBackground;
                // switch (o.name) {
                //     case 'fabric_liner':
                //         o.material.color = new THREE.Color(0x00ff00);
                //         break;
                // }
                // o.material.map = null;
                o.material = new THREE.MeshPhongMaterial();
                o.material.map = WhiteTexture;
                // if (o.name === 'fabric_main_right') {
                //     window.fum = o;
                //     // o.material.map = textureItems[0].texture;
                // } else {
                //     // o.material.map = A1;
                // }
            }
        });
        scene.add(obj);

        const pointLight1 = new THREE.PointLight({
            color: '#ccffcc',
            distance: 100 // 光線照亮距離
        });
        window.pl1 = pointLight1;
        pointLight1.intensity = 0.5;

        // 設定光源位置
        pointLight1.position.set(0, 20, -50);

        // 設定光源目標
        pointLight1.target = obj;

        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight({
            color: '#ccffcc',
            distance: 100 // 光線照亮距離
        });
        window.pl2 = pointLight2;
        pointLight2.intensity = 0.2;

        // 設定光源位置
        pointLight2.position.set(0, 20, 50);

        // 設定光源目標
        pointLight2.target = obj;

        scene.add(pointLight2);
    },

    // onProgress callback
    function(xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },

    // onError callback
    function(err) {
        console.error('An error happened');
    }
);

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
    controls.enablePan = true;
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
    console.info('click');

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(shoeUnits);
    console.info(intersects);
    if (intersects.length > 0) {
        const first = intersects[0].object;
        app.activeUnitName = first.name;
        app.hoverUnitName = first.name;
        setTimeout(() => (app.hoverUnitName = null), 150);

        // console.info(intersects.map(o => o.object.name));
        // intersects[0].object.material.color = new THREE.Color(0x9999ff);
    }
}
document.addEventListener('mousedown', onDocumentMouseDown);
