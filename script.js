// script.js: Premium Modern Wedding Website Animations & Logic

// Autoplay music unless user disables
window.addEventListener('DOMContentLoaded', () => {
    const bgMusic = document.getElementById('bgMusic');
    if(bgMusic) {
        bgMusic.volume = 0.3;
        setTimeout(()=>{ bgMusic.play().catch(()=>{}); },400);
    }

    // Auto-move between pages
    let totalPages = 4; // for demo
    let currentPage = 1;
    let pageInterval = 7000; // Move every 7s
    let pageTimer = null;

    function showPage(n) {
        for(let i=1; i<=totalPages; i++) {
            document.getElementById('page'+i).classList.remove('active');
        }
        document.getElementById('page'+n).classList.add('active');
    }
    function nextPage(){
        currentPage = (currentPage % totalPages) + 1;
        showPage(currentPage);
    }
    function startAutoScroll(){
        if(pageTimer) clearInterval(pageTimer);
        pageTimer = setInterval(nextPage, pageInterval);
    }
    function stopAutoScroll(){
        if(pageTimer) clearInterval(pageTimer);
    }
    // Pause auto-scroll if user touches/scrolls
    ['touchstart','mousemove','wheel','keydown'].forEach(e => {
        document.addEventListener(e, stopAutoScroll, {once:true});
    });
    showPage(1);
    startAutoScroll();

    // Gallery slider auto-move
    let slides = document.querySelectorAll('.gallery-slide');
    let gallerySlider = document.getElementById('gallerySlider');
    let galleryDots = document.getElementById('galleryDots');
    let galleryIndex = 0;
    let galleryTimer = null;

    function showGallerySlide(idx) {
        gallerySlider.style.transform = `translateX(-${idx * 100}vw)`;
        document.querySelectorAll('.gallery-dots span').forEach((dot,i) => {
            dot.classList.toggle('active', i===idx);
        });
        galleryIndex = idx;
    }
    function nextGallery(){
        galleryIndex = (galleryIndex + 1) % slides.length;
        showGallerySlide(galleryIndex);
    }
    function createGalleryDots(){
        galleryDots.innerHTML = '';
        for(let i=0;i<slides.length;i++){
            let dot = document.createElement('span');
            dot.addEventListener('click', ()=>{showGallerySlide(i);});
            galleryDots.appendChild(dot);
        }
        showGallerySlide(0);
    }
    if(slides.length){createGalleryDots(); galleryTimer=setInterval(nextGallery,3500);}
    // Pause on touch/scroll
    ['touchstart','mousemove','wheel','keydown'].forEach(e => {
        document.querySelector('.gallery-container').addEventListener(e, ()=>{if(galleryTimer) clearInterval(galleryTimer);}, {once:true});
    });

    // Animation lib
    if(window.AOS){AOS.init();}

    // 3D Mantapa Entrance using Three.js
    if(window.THREE){
        let scene = new THREE.Scene();
        let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        let renderer = new THREE.WebGLRenderer({alpha:true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('mantapa-container').appendChild(renderer.domElement);
        // Mantapa geometry (simple stylized)
        let pillars = [], matColor=new THREE.MeshPhongMaterial({color:0xc68d46});
        for(let i=0;i<4;i++){
          let pillar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5,0.5,6,32),matColor);
          pillar.position.set(i<2?-3:3,3,i%2==0?-3:3);
          scene.add(pillar);
          pillars.push(pillar);
        }
        let roof = new THREE.Mesh(new THREE.BoxGeometry(7,1.2,7),new THREE.MeshPhongMaterial({color:0xffe0b2}));
        roof.position.y=6.5; scene.add(roof);
        let light = new THREE.PointLight(0xffeebb,2,30);light.position.set(7,14,14);scene.add(light);
        let ambient = new THREE.AmbientLight(0xffffff,0.8);scene.add(ambient);
        camera.position.set(0,5,18);
        let t=0;function animate(){t+=0.017;camera.position.x=8*Math.sin(t*0.5);camera.lookAt(0,5,0);renderer.render(scene,camera);requestAnimationFrame(animate);}
        animate();
    }

    // Google Map embed
    var mapDiv=document.getElementById('map');
    if(mapDiv){
        mapDiv.innerHTML='<iframe width="100%" height="100%" style="border:0" src="https://www.google.com/maps?q=Davanagere,Karnataka&output=embed" allowfullscreen></iframe>';
    }
});

// End script.js
