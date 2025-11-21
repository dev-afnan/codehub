let scene, cam, rend, comp, bloom, controls;
let layers = [];
let container = document.getElementById("container");

const settings = {
    mode: "Shaded",
    speed: 5,
    size: 1,
    bloom: 0.01,
    auto: true,
    sensitivity: 2
};

function makeMesh(radius, col, wire=false, trans=false) {
    const geom = new THREE.IcosahedronGeometry(radius, 2);
    const mat = new THREE.MeshStandardMaterial({
        color: col,
        metalness: 0.1,
        roughness: 0.2,
        emissive: col,
        emissiveIntensity: wire ? 2.2 : 1.0,
        wireframe: wire,
        transparent: trans,
        opacity: trans ? 0.35 : 1.0
    });
    return new THREE.Mesh(geom, mat);
}

function createOrb() {
    layers = [];
    const cols = [0x66ccff, 0x2299ff, 0x0044ff, 0x88ddff];

    for (let i=0; i<4; i++) {
        const grp = new THREE.Group();
        const core = makeMesh(40 - i*8, new THREE.Color(cols[i]), false, false);
        const shell = makeMesh(48 - i*8, new THREE.Color(cols[i]), true, true);
        grp.add(core);
        grp.add(shell);
        scene.add(grp);
        layers.push(grp);
    }
}

function init() {
    scene = new THREE.Scene();
    cam = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, 1, 2000);
    cam.position.z = 200;

    rend = new THREE.WebGLRenderer({antialias:true});
    rend.setSize(innerWidth, innerHeight);
    rend.setPixelRatio(devicePixelRatio);
    rend.outputEncoding = THREE.sRGBEncoding;

    container.innerHTML = "";
    container.appendChild(rend.domElement);

    const light = new THREE.PointLight(0xffffff, 1.5);
    light.position.set(100,100,100);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x303030));

    comp = new THREE.EffectComposer(rend);
    comp.addPass(new THREE.RenderPass(scene, cam));

    bloom = new THREE.UnrealBloomPass(
        new THREE.Vector2(innerWidth, innerHeight),
        settings.bloom,
        0.4,
        0.8
    );
    comp.addPass(bloom);

    controls = new THREE.OrbitControls(cam, rend.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.autoRotate = settings.auto;
    controls.autoRotateSpeed = settings.speed;
    controls.rotateSpeed = settings.sensitivity;

    createOrb();
}

function updateMaterials() {
    layers.forEach(grp => {
        grp.children.forEach(obj => {
            const mat = obj.material;
            const active = settings.bloom > 0;

            if (settings.mode === "Wireframe") {
                mat.wireframe = true;
                mat.emissiveIntensity = 0;
            } else if (settings.mode === "Shaded") {
                mat.wireframe = obj.opacity < 1;
                mat.emissiveIntensity = active ? 1.0 : 0;
            } else if (settings.mode === "Glow") {
                mat.wireframe = obj.opacity < 1;
                mat.emissiveIntensity = active ? 2.5 : 0;
            }
        });
    });
}

function animate() {
    requestAnimationFrame(animate);

    layers.forEach(grp => {
        grp.scale.setScalar(settings.size);
    });

    controls.update();
    comp.render();
}

function setupCtrls() {
    const $ = id => document.getElementById(id);

    $("toggleBtn").onclick = () => {
        const c = $("controls");
        c.style.display = c.style.display === "none" ? "block" : "none";
    };

    $("mode").onchange = e => { 
        settings.mode = e.target.value; 
        updateMaterials(); 
    };
    $("speed").oninput = e => { 
        settings.speed = parseFloat(e.target.value); 
        controls.autoRotateSpeed = settings.speed;
    };
    $("size").oninput = e => settings.size = parseFloat(e.target.value);
    $("sensitivity").oninput = e => {
        settings.sensitivity = parseFloat(e.target.value);
        controls.rotateSpeed = settings.sensitivity;
    };
    $("bloom").oninput = e => { 
        settings.bloom = parseFloat(e.target.value); 
        bloom.strength = settings.bloom; 
    };
    $("auto").onchange = e => { 
        settings.auto = e.target.checked; 
        controls.autoRotate = settings.auto;
    };
    $("reset").onclick = () => { init(); updateMaterials(); };
}

window.addEventListener("resize", () => {
    cam.aspect = innerWidth/innerHeight;
    cam.updateProjectionMatrix();
    rend.setSize(innerWidth, innerHeight);
    comp.setSize(innerWidth, innerHeight);
});

init();
setupCtrls();
updateMaterials();
animate();