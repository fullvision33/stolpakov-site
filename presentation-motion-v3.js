(() => {
  'use strict';

  document.documentElement.classList.add('js-animations');
  const stage = document.querySelector('.showcase');
  const frame = document.querySelector('.showcase-frame');
  const sceneHeight = () => frame.clientHeight || innerHeight;
  const status = document.querySelector('.model-status');
  const activeSlides = [...document.querySelectorAll('.slide-content')];
  const dots = [...document.querySelectorAll('.dot')];
  const navItems = [...document.querySelectorAll('nav a[data-slide]')];

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x100906, 0.006);
  const camera = new THREE.PerspectiveCamera(45, innerWidth / sceneHeight(), 0.1, 100);
  camera.position.set(0, 0, 10);
  const lowPowerDevice=(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4)||(navigator.deviceMemory&&navigator.deviceMemory<=4);
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true, powerPreference:lowPowerDevice?'low-power':'default'});
  const targetPixelRatio=()=>Math.min(window.devicePixelRatio||1,innerWidth<=760?1.5:(lowPowerDevice?1.5:1.75));
  let qualityRatio=targetPixelRatio();
  renderer.setSize(innerWidth, sceneHeight());
  renderer.setPixelRatio(qualityRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.10;
  renderer.outputEncoding = THREE.sRGBEncoding;
  document.querySelector('#canvas-container').appendChild(renderer.domElement);
  document.body.appendChild(document.querySelector('#canvas-container'));
  document.querySelector('#canvas-container').style.height=sceneHeight()+'px';

  scene.add(new THREE.AmbientLight(0x241710, 0.105));
  const key = new THREE.SpotLight(0xd4a373, 0.28);
  key.position.set(5, 6, 5); key.penumbra = 0.6; scene.add(key);
  const fill = new THREE.DirectionalLight(0x4a3525, 0.086);
  fill.position.set(-5, -2, 4); scene.add(fill);
  const rim = new THREE.SpotLight(0xffd9ae, 0.42);
  rim.position.set(0, 5, -5); scene.add(rim);

  // A softly lit bronze room supplies broad reflections without extra assets.
  const reflectionRoom=document.createElement('canvas');
  reflectionRoom.width=512;reflectionRoom.height=256;
  const roomCtx=reflectionRoom.getContext('2d');
  const roomBase=roomCtx.createLinearGradient(0,0,0,256);
  roomBase.addColorStop(0,'#6e5541');roomBase.addColorStop(.45,'#34241a');roomBase.addColorStop(1,'#100a07');
  roomCtx.fillStyle=roomBase;roomCtx.fillRect(0,0,512,256);
  for(const [x,w,alpha] of [[90,75,.30],[270,120,.22],[430,60,.16]]){
    const light=roomCtx.createLinearGradient(x-w,0,x+w,0);
    light.addColorStop(0,'rgba(255,218,177,0)');light.addColorStop(.5,`rgba(255,218,177,${alpha})`);light.addColorStop(1,'rgba(255,218,177,0)');
    roomCtx.fillStyle=light;roomCtx.fillRect(x-w,0,w*2,256);
  }
  const roomTexture=new THREE.CanvasTexture(reflectionRoom);
  roomTexture.mapping=THREE.EquirectangularReflectionMapping;
  roomTexture.encoding=THREE.sRGBEncoding;

  const ring = new THREE.Group();
  const ringCore = new THREE.Mesh(
    new THREE.TorusGeometry(2.8, 0.078, 24, 128),
    new THREE.MeshStandardMaterial({color:0xbda080,emissive:0x6a4932,emissiveIntensity:.22,metalness:.14,roughness:.38,envMap:roomTexture,envMapIntensity:.8,transparent:true,opacity:1,depthWrite:true})
  );
  ring.add(ringCore);
  const ringLights = [];
  const ringLightTargets = [];
  for (const [x,y,power] of [[0,2.8,2.2],[0,-2.8,1.8]]) {
    const lamp = new THREE.PointLight(0xffd09a,power,18,1.35);
    lamp.userData.basePower = power;
    lamp.position.set(x,y,0.4);
    ring.add(lamp);
    ringLights.push(lamp);
  }

  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = 256;
  const glowContext = glowCanvas.getContext('2d');
  const glowGradient = glowContext.createRadialGradient(128,128,8,128,128,126);
  glowGradient.addColorStop(0,'rgba(255,208,150,.38)');
  glowGradient.addColorStop(.36,'rgba(255,169,91,.17)');
  glowGradient.addColorStop(1,'rgba(255,151,65,0)');
  glowContext.fillStyle = glowGradient;
  glowContext.fillRect(0,0,256,256);
  const glowTexture = new THREE.CanvasTexture(glowCanvas);
  const backdropCanvas = document.createElement('canvas');
  backdropCanvas.width = backdropCanvas.height = 512;
  const backdropContext = backdropCanvas.getContext('2d');
  const backdropGradient = backdropContext.createRadialGradient(256,256,2,256,256,252);
  backdropGradient.addColorStop(0,'rgba(255,205,145,.78)');
  backdropGradient.addColorStop(.24,'rgba(226,155,91,.44)');
  backdropGradient.addColorStop(.62,'rgba(170,103,57,.16)');
  backdropGradient.addColorStop(1,'rgba(135,76,42,0)');
  backdropContext.fillStyle = backdropGradient;
  backdropContext.fillRect(0,0,512,512);
  const backdropTexture = new THREE.CanvasTexture(backdropCanvas);
  const backdropLight = new THREE.Sprite(new THREE.SpriteMaterial({map:backdropTexture,color:0xffc184,transparent:true,opacity:.72,depthWrite:false,blending:THREE.AdditiveBlending}));
  backdropLight.scale.set(13,10,1);
  backdropLight.position.z = -3.1;
  ring.add(backdropLight);
  const reflectionCanvas = document.createElement('canvas');
  reflectionCanvas.width = reflectionCanvas.height = 512;
  const reflectionContext = reflectionCanvas.getContext('2d');
  reflectionContext.translate(256,256);
  reflectionContext.shadowColor = 'rgba(239,172,103,.18)';
  reflectionContext.shadowBlur = 42;
  reflectionContext.strokeStyle = 'rgba(232,166,98,.13)';
  reflectionContext.lineWidth = 5;
  reflectionContext.beginPath();
  reflectionContext.ellipse(0,0,174,174,0,0,Math.PI*2);
  reflectionContext.stroke();
  const reflectionTexture = new THREE.CanvasTexture(reflectionCanvas);
  const ringReflection = new THREE.Sprite(new THREE.SpriteMaterial({map:reflectionTexture,color:0xffc58d,transparent:true,opacity:.20,depthWrite:false,blending:THREE.AdditiveBlending}));
  ringReflection.scale.set(6.5,6.5,1);
  ringReflection.position.z = -1.15;
  ringReflection.visible=false;
  ring.add(ringReflection);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,color:0xffd09a,transparent:true,opacity:.38,depthWrite:false,blending:THREE.AdditiveBlending}));
  halo.scale.set(7.4,7.4,1);
  halo.position.z = -.16;
  ring.add(halo);
  const glints = [];
  for (const [x,y,size,opacity] of [[-2.25,1.1,.34,.56],[2.28,.35,.25,.48],[-1.15,-2.05,.22,.42],[1.32,1.8,.18,.38]]) {
    const glint = new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,color:0xffcc8f,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending}));
    glint.position.set(x,y,-.12);
    glint.scale.set(size*3,size*3,1);
    ring.add(glint);
    glints.push({sprite:glint,base:opacity,phase:Math.random()*Math.PI*2});
  }
  ring.position.set(1.05, .48, -1.65);
  scene.add(ring);

  // A compact, hand-built bronze tunnel grows out of the existing light ring.
  // It uses the site's bundled Three.js only; no extra animation packages/assets.
  const portalTunnel = new THREE.Group();
  const portalHoops = [];
  const portalHoopGeo = new THREE.TorusGeometry(2.0, .065, 16, 96);
  for (let i = 0; i < 13; i++) {
    const hoop = new THREE.Group();
    const core = new THREE.Mesh(
      portalHoopGeo,
      new THREE.MeshStandardMaterial({color:0xbda080,emissive:0x765137,emissiveIntensity:.28,metalness:.14,roughness:.38,envMap:roomTexture,envMapIntensity:.8,transparent:true,opacity:0,depthWrite:true})
    );
    hoop.add(core);
    hoop.position.z = -1.15 - i * 3.15;
    hoop.userData.phase = i * .035;
    portalTunnel.add(hoop);
    portalHoops.push(hoop);
  }
  portalTunnel.visible = false;
  scene.add(portalTunnel);
  const tunnelGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,color:0xffc080,transparent:true,opacity:.16,depthWrite:false,blending:THREE.AdditiveBlending}));
  tunnelGlow.scale.set(10,10,1);tunnelGlow.position.z=-50;portalTunnel.add(tunnelGlow);
  const portalLight = new THREE.PointLight(0xffb56c, 0, 24, 1.6);
  scene.add(portalLight);

  const statueGroup = new THREE.Group();
  scene.add(statueGroup);
  const dissolveCount=innerWidth<=760?4000:6200;
  const dissolvePositions=new Float32Array(dissolveCount*3);
  const dissolveAlphas=new Float32Array(dissolveCount);
  const dissolveOrigins=new Float32Array(dissolveCount*3);
  const dissolveCos=new Float32Array(dissolveCount);
  const dissolveSin=new Float32Array(dissolveCount);
  const dissolveRadii=new Float32Array(dissolveCount);
  const dissolveOffsets=new Float32Array(dissolveCount);
  const dissolveCurveX=new Float32Array(dissolveCount);
  const dissolveCurveY=new Float32Array(dissolveCount);
  const dissolveCurveZ=new Float32Array(dissolveCount);
  for(let i=0;i<dissolveCount;i++){
    const angle=Math.random()*Math.PI*2;
    dissolveCos[i]=Math.cos(angle);dissolveSin[i]=Math.sin(angle);
    dissolveRadii[i]=Math.sqrt(Math.random())*2.35;
    dissolveOffsets[i]=Math.random();
    dissolveCurveX[i]=Math.cos(angle*2)*.22;
    dissolveCurveY[i]=Math.sin(angle*2)*.22;
    dissolveCurveZ[i]=Math.sin(angle)*.14;
  }
  const dissolveGeometry=new THREE.BufferGeometry();
  dissolveGeometry.setAttribute('position',new THREE.BufferAttribute(dissolvePositions,3));
  dissolveGeometry.setAttribute('aAlpha',new THREE.BufferAttribute(dissolveAlphas,1));
  const dissolveMaterial=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uOpacity:{value:0}},vertexShader:`attribute float aAlpha; varying float vAlpha; void main(){vAlpha=aAlpha; vec4 mvPosition=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*mvPosition; gl_PointSize=clamp(2.4*(300.0/-mvPosition.z),1.0,5.0);}`,fragmentShader:`uniform float uOpacity; varying float vAlpha; void main(){vec2 p=gl_PointCoord-0.5; float d=length(p); if(d>.5) discard; float glow=1.0-smoothstep(.06,.5,d); gl_FragColor=vec4(vec3(0.91,0.67,0.39),glow*vAlpha*uOpacity);}`});
  const dissolveCloud=new THREE.Points(dissolveGeometry,dissolveMaterial);
  dissolveCloud.visible=false;
  scene.add(dissolveCloud);
  const ringDissolveCount=900;
  const ringDissolvePositions=new Float32Array(ringDissolveCount*3);
  const ringDissolveAlphas=new Float32Array(ringDissolveCount);
  const ringDissolveOrigins=new Float32Array(ringDissolveCount*3);
  const ringDissolveOffsets=new Float32Array(ringDissolveCount);
  for(let i=0;i<ringDissolveCount;i++){
    const a=Math.random()*Math.PI*2,b=Math.random()*Math.PI*2,j=i*3;
    const radius=2.8+.078*Math.cos(b);
    ringDissolveOrigins[j]=radius*Math.cos(a);ringDissolveOrigins[j+1]=radius*Math.sin(a);ringDissolveOrigins[j+2]=.078*Math.sin(b);
    ringDissolveOffsets[i]=Math.random();
  }
  const ringDissolveGeometry=new THREE.BufferGeometry();
  ringDissolveGeometry.setAttribute('position',new THREE.BufferAttribute(ringDissolvePositions,3));
  ringDissolveGeometry.setAttribute('aAlpha',new THREE.BufferAttribute(ringDissolveAlphas,1));
  const ringDissolveMaterial=dissolveMaterial.clone();
  const ringDissolveCloud=new THREE.Points(ringDissolveGeometry,ringDissolveMaterial);
  ringDissolveCloud.visible=false;scene.add(ringDissolveCloud);
  const bronzeDissolve={value:0};
  const bronze = new THREE.MeshStandardMaterial({color:0x0e0805, roughness:0.39, metalness:0.62});
  bronze.onBeforeCompile=shader=>{
    shader.uniforms.uDissolve=bronzeDissolve;
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vDissolvePosition;');
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvDissolvePosition=(modelMatrix*vec4(transformed,1.0)).xyz;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vDissolvePosition; uniform float uDissolve;\nfloat dissolveHash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yxz+33.33);return fract((p.x+p.y)*p.z);}\nfloat dissolveNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);float a=mix(dissolveHash(i),dissolveHash(i+vec3(1,0,0)),f.x);float b=mix(dissolveHash(i+vec3(0,1,0)),dissolveHash(i+vec3(1,1,0)),f.x);float c=mix(dissolveHash(i+vec3(0,0,1)),dissolveHash(i+vec3(1,0,1)),f.x);float d=mix(dissolveHash(i+vec3(0,1,1)),dissolveHash(i+vec3(1,1,1)),f.x);return mix(mix(a,b,f.y),mix(c,d,f.y),f.z);}')
      .replace('#include <color_fragment>','#include <color_fragment>\nfloat dissolveField=(4.2-vDissolvePosition.y)/8.4+(dissolveNoise(vDissolvePosition*5.0)-.5)*.035; if(uDissolve>0.001 && dissolveField<uDissolve) discard; float dissolveRim=uDissolve>0.001 ? 1.0-smoothstep(uDissolve,uDissolve+.025,dissolveField) : 0.0; diffuseColor.rgb+=vec3(.095,.047,.018)*dissolveRim;');
  };
  const detailCanvas = document.createElement('canvas');
  detailCanvas.width = detailCanvas.height = 512;
  const detailContext = detailCanvas.getContext('2d');
  const detailImage = detailContext.createImageData(512,512);
  let noiseSeed = 7391;
  for (let i=0;i<detailImage.data.length;i+=4) {
    noiseSeed = (noiseSeed*1664525+1013904223)>>>0;
    const value = 112 + ((noiseSeed>>>24)-128)*.42;
    detailImage.data[i]=detailImage.data[i+1]=detailImage.data[i+2]=value;
    detailImage.data[i+3]=255;
  }
  detailContext.putImageData(detailImage,0,0);
  const detailTexture = new THREE.CanvasTexture(detailCanvas);
  detailTexture.wrapS = detailTexture.wrapT = THREE.RepeatWrapping;
  detailTexture.repeat.set(3,3);
  detailTexture.colorSpace = THREE.NoColorSpace;
  bronze.bumpMap = detailTexture;
  bronze.bumpScale = .0014;
  function setStatus(message, loaded=false) {
    status.childNodes[0].textContent = message;
    status.classList.toggle('loaded', loaded);
    if (loaded) gsap.to(status,{opacity:0,delay:1.8,duration:.6,onComplete:()=>status.setAttribute('aria-hidden','true')});
  }

  function installModel(object, from3mf=false) {
    for (const child of [...statueGroup.children]) {
      statueGroup.remove(child);
      child.traverse?.(node => { if (node.geometry) node.geometry.dispose(); });
    }
    if (from3mf) object.rotation.x = -Math.PI / 2;
    object.traverse(child => {
      if (!child.isMesh) return;
      if (!child.geometry.attributes.normal) child.geometry.computeVertexNormals();
      child.material = bronze;
      child.castShadow = false;
      child.receiveShadow = false;
    });
    object.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(object);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x,size.y,size.z) || 1;
    object.scale.setScalar(5.8/maxDim);
    object.updateMatrixWorld(true);
    const scaledCenter = new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3());
    object.position.sub(scaledCenter);
    object.position.y -= 0.6;
    statueGroup.add(object);
    statueGroup.updateMatrixWorld(true);
    const inverseGroup=new THREE.Matrix4().copy(statueGroup.matrixWorld).invert();
    const sampledMeshes=[];
    const sampleVertex=new THREE.Vector3();
    object.traverse(child=>{if(child.isMesh&&child.geometry.attributes.position){child.updateWorldMatrix(true,false);sampledMeshes.push({mesh:child,matrix:new THREE.Matrix4().multiplyMatrices(inverseGroup,child.matrixWorld)});}});
    for(let i=0;i<dissolveCount;i++){
      const sample=sampledMeshes[Math.floor(Math.random()*sampledMeshes.length)];
      if(!sample)continue;
      const attribute=sample.mesh.geometry.attributes.position;
      sampleVertex.fromBufferAttribute(attribute,Math.floor(Math.random()*attribute.count)).applyMatrix4(sample.matrix);
      dissolveOrigins[i*3]=sampleVertex.x;dissolveOrigins[i*3+1]=sampleVertex.y;dissolveOrigins[i*3+2]=sampleVertex.z;
      dissolvePositions[i*3]=sampleVertex.x;dissolvePositions[i*3+1]=sampleVertex.y;dissolvePositions[i*3+2]=sampleVertex.z;
    }
    dissolveGeometry.attributes.position.needsUpdate=true;
    setStatus('Скульптура загружена',true);
  }

  const modelLoader = new THREE.GLTFLoader();
  async function loadBust() {
    try {
      const response=await fetch('busto.glb.gz?v=24',{cache:'force-cache'});
      if (!response.ok) throw new Error('Модель не найдена');
      let packed;
      const totalBytes=Number(response.headers.get('Content-Length')||0);
      if (response.body && totalBytes > 0) {
        const reader=response.body.getReader();
        const chunks=[];
        let received=0;
        while (true) {
          const {done,value}=await reader.read();
          if (done) break;
          chunks.push(value);
          received+=value.length;
          const pct=Math.min(99,Math.round((received/totalBytes)*100));
          status.childNodes[0].textContent=`Скульптура ${pct}% `;
        }
        const merged=new Uint8Array(received);
        let offset=0;
        for (const chunk of chunks) { merged.set(chunk,offset); offset+=chunk.length; }
        packed=merged.buffer;
      } else {
        packed=await response.arrayBuffer();
      }
      const signature=new Uint8Array(packed,0,4);
      const glb=signature[0]===0x1f&&signature[1]===0x8b
        ? await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
        : packed;
      modelLoader.parse(glb,'',result=>{
        installModel(result.scene);
        if (typeof window.__triggerBustArrival==='function') window.__triggerBustArrival();
      },()=>setStatus('Не удалось загрузить модель'));
    } catch (error) {
      setStatus('Не удалось загрузить модель');
    }
  }
  loadBust();

  const desktopStates = [
    {camPos:{x:0,y:0,z:10},statuePos:{x:1.05,y:0,z:0},statueRot:{x:0,y:0,z:0},ringPos:{x:1.05,y:.5,z:-2},ringRot:{x:0,y:0,z:0},ringScale:1,keyPos:{x:-2.2,y:3.2,z:3.8}},
    {camPos:{x:0,y:0,z:10},statuePos:{x:2.8,y:-.4,z:1.8},statueRot:{x:0,y:-Math.PI/2.5,z:0},ringPos:{x:14.6,y:.2,z:-5},ringRot:{x:0,y:Math.PI/4,z:0},ringScale:.5,keyPos:{x:-1.5,y:3.8,z:4.2}},
    {camPos:{x:0,y:.4,z:8.2},statuePos:{x:1.8,y:-.25,z:2.4},statueRot:{x:.08,y:-Math.PI/2.5,z:0},ringPos:{x:1.2,y:1.8,z:-1},ringRot:{x:-Math.PI/6,y:Math.PI/8,z:0},ringScale:.85,keyPos:{x:-2.8,y:4.5,z:3.5}},
    {camPos:{x:0,y:.1,z:9.2},statuePos:{x:3.35,y:-.38,z:1.35},statueRot:{x:.05,y:-Math.PI/2.7,z:0},ringPos:{x:-2.35,y:.35,z:-.9},ringRot:{x:-.06,y:.02,z:0},ringScale:.72,keyPos:{x:1.8,y:3.2,z:4.4}}
  ];
  const mobileStates = [
    {camPos:{x:0,y:0,z:10.9},statuePos:{x:.08,y:-.92,z:0},statueRot:{x:0,y:0,z:0},statueScale:.86,ringPos:{x:.15,y:-.25,z:-2},ringRot:{x:0,y:0,z:0},ringScale:.72,keyPos:{x:-2.2,y:3.2,z:3.8}},
    {camPos:{x:0,y:0,z:11.1},statuePos:{x:.48,y:-.94,z:0},statueRot:{x:0,y:-.65,z:0},statueScale:.7,ringPos:{x:8.2,y:0,z:-5},ringRot:{x:0,y:Math.PI/4,z:0},ringScale:.48,keyPos:{x:-1.5,y:3.8,z:4.2}},
    {camPos:{x:0,y:0,z:11.1},statuePos:{x:.42,y:-.96,z:0},statueRot:{x:.04,y:-.65,z:0},statueScale:.68,ringPos:{x:.8,y:.35,z:-1.5},ringRot:{x:-.3,y:.2,z:0},ringScale:.56,keyPos:{x:-2.8,y:4.5,z:3.5}},
    {camPos:{x:0,y:.1,z:11.1},statuePos:{x:.25,y:-.86,z:0},statueRot:{x:.05,y:-.8,z:0},statueScale:.64,ringPos:{x:-.65,y:.4,z:-.9},ringRot:{x:-.06,y:.02,z:0},ringScale:.42,keyPos:{x:1.8,y:3.2,z:4.4}}
  ];
  let isMobile=innerWidth<=760;
  let sceneStates=isMobile?mobileStates:desktopStates;
  camera.position.set(sceneStates[0].camPos.x,sceneStates[0].camPos.y,sceneStates[0].camPos.z);
  statueGroup.position.set(sceneStates[0].statuePos.x,sceneStates[0].statuePos.y,sceneStates[0].statuePos.z);
  statueGroup.rotation.set(sceneStates[0].statueRot.x,sceneStates[0].statueRot.y,sceneStates[0].statueRot.z);
  ring.position.set(sceneStates[0].ringPos.x,sceneStates[0].ringPos.y,sceneStates[0].ringPos.z);
  ring.rotation.set(sceneStates[0].ringRot.x,sceneStates[0].ringRot.y,sceneStates[0].ringRot.z);
  ring.scale.setScalar(sceneStates[0].ringScale);
  key.position.set(sceneStates[0].keyPos.x,sceneStates[0].keyPos.y,sceneStates[0].keyPos.z);
  let ringLightGain=1;

  function revealText(element, html, duration, delay=0) {
    if(!element)return;
    gsap.killTweensOf(element);
    element.innerHTML = html;
    gsap.fromTo(
      element,
      {opacity:0, y:18, clipPath:'inset(0 0 100% 0)'},
      {opacity:1, y:0, clipPath:'inset(0 0 0% 0)', duration:Math.min(0.62, Math.max(0.38, duration)), delay, ease:'power4.out', clearProps:'clipPath'}
    );
  }

  function animateText(index) {
    if (index===0) {
      revealText(document.querySelector('#title-1'),'Экспертиза<br><em>обретает форму.</em>',.58,0);
      gsap.fromTo('#slide-1 .hero-kicker',{opacity:0,y:8},{opacity:.88,y:0,duration:.42,ease:'power3.out'});
      gsap.fromTo('#desc-1',{opacity:0,y:12},{opacity:1,y:0,duration:.45,delay:.1,ease:'power3.out'});
      gsap.fromTo('#slide-1 .hero-aside',{opacity:0,y:8},{opacity:.85,y:0,duration:.42,delay:.16,ease:'power3.out'});
    } else if (index===1) {
      revealText(document.querySelector('#title-2-1'),'Искусство замысла',.45,0);
      revealText(document.querySelector('#title-2-2'),'Точность формы',.45,.08);
      revealText(document.querySelector('#title-2-3'),'Система движения',.45,.16);
      gsap.fromTo('#slide-2 .text-block p',{opacity:0,y:10},{opacity:1,y:0,duration:.4,stagger:.06,delay:.08,ease:'power3.out'});
      gsap.fromTo('.process-step',{opacity:0,y:12},{opacity:1,y:0,duration:.45,stagger:.07,delay:.16,ease:'power3.out'});
      gsap.fromTo('.process-rail>i',{scaleX:0},{scaleX:1,duration:.45,stagger:.08,delay:.22,ease:'power2.out'});
    } else if (index===2) {
      revealText(document.querySelector('#title-3'),'У каждой идеи<br>есть своя форма.',.52,0);
      gsap.fromTo('.columns',{opacity:0,y:14},{opacity:1,y:0,duration:.45,delay:.1,ease:'power3.out'});
    } else {
      revealText(document.querySelector('#title-4'),'Создадим то,<br><em>что имеет значение.</em>',.5,0);
      gsap.fromTo('#slide-4 .slide4-kicker',{opacity:0,x:-12},{opacity:1,x:0,duration:.4,ease:'power2.out'});
      gsap.fromTo('#desc-4',{opacity:0,y:12},{opacity:1,y:0,duration:.42,delay:.1,ease:'power3.out'});
      gsap.fromTo('.slide4-contact',{opacity:0,y:10},{opacity:1,y:0,duration:.42,delay:.16,ease:'power3.out'});
    }
  }

  let currentSlide=0;
  let slideTransitionToken=0;
  let sceneScrollTarget=0;
  let sceneScrollProgress=0;
  let portalProgress=0;
  let portalTarget=0;
  let pageTarget=0;
  let pageProgress=0;
  const portalStart=.60;
  const clamp01=value=>Math.max(0,Math.min(1,value));
  const smoothStep=(start,end,value)=>{const x=clamp01((value-start)/(end-start));return x*x*(3-2*x);};
  // Give the third scene more of the scroll distance, while keeping the camera continuous.
  function sceneTrack(progress){
    const knots=[[0,0],[.25,1],[.46,1.65],[.76,2.35],[1,3]];
    for(let i=0;i<knots.length-1;i++){const [a,x]=knots[i],[b,y]=knots[i+1];if(progress<=b)return x+(y-x)*(progress-a)/(b-a)}
    return 3;
  }
  function activateSlide(index){
    if(index===currentSlide)return;
    const previous=currentSlide;
    currentSlide=index;
    const token=++slideTransitionToken;
    dots.forEach((dot,i)=>{dot.classList.toggle('active',i===index);if(i===index)dot.setAttribute('aria-current','step');else dot.removeAttribute('aria-current');});
    navItems.forEach((link,i)=>link.classList.toggle('active',i===index));
    const previousContent=document.querySelector(`#slide-${previous+1}`);
    const nextContent=document.querySelector(`#slide-${index+1}`);
    gsap.killTweensOf('.slide-content');
    gsap.killTweensOf('.slide-content *');
    // Immediately hide all slides except previous (exiting cleanly) so two slides NEVER overlap
    activeSlides.forEach((content,i)=>{
      if(i!==previous){
        content.classList.remove('active');
        gsap.set(content,{clearProps:'all',opacity:0});
      }
    });
    gsap.to(previousContent,{
      y:-26,
      opacity:0,
      duration:.22,
      ease:'power2.in',
      onComplete:()=>{
        previousContent.classList.remove('active');
        gsap.set(previousContent,{clearProps:'all'});
        if(token!==slideTransitionToken)return;
        nextContent.classList.add('active');
        gsap.fromTo(nextContent,{y:18,opacity:0},{y:0,opacity:1,duration:.42,ease:'power3.out'});
        animateText(index);
        if(typeof window.__updateHeroTextFill==='function') window.__updateHeroTextFill(sceneScrollProgress, index);
      }
    });
  }
  window.goToSlide=function(index){
    if(index<0||index>=sceneStates.length)return;
    const distance=Math.max(1,stage.offsetHeight-sceneHeight());
    window.scrollTo({top:stage.offsetTop+distance*portalStart*([0,.25,.61,.99][index]),behavior:'smooth'});
  };
  function readSceneProgress(){
    const distance=Math.max(1,stage.offsetHeight-sceneHeight());
    pageTarget=clamp01((window.scrollY-stage.offsetTop)/distance);
  }
  document.querySelectorAll('[data-slide]').forEach(control=>control.addEventListener('click',event=>{event.preventDefault();goToSlide(Number(control.dataset.slide));}));
  addEventListener('scroll',readSceneProgress,{passive:true});
  readSceneProgress();
  pageProgress=pageTarget;
  let lastSceneDistance=Math.max(1,stage.offsetHeight-sceneHeight());
  let lastViewportWidth=innerWidth;
  let lastViewportHeight=sceneHeight();
  function resize() {
    const oldProgress=(window.scrollY-stage.offsetTop)/lastSceneDistance;
    const height=sceneHeight();
    camera.aspect=innerWidth/height;
    isMobile=innerWidth<=760;
    sceneStates=isMobile?mobileStates:desktopStates;
    camera.updateProjectionMatrix();
    if(innerWidth!==lastViewportWidth||height!==lastViewportHeight){
      renderer.setSize(innerWidth,height);
      document.querySelector('#canvas-container').style.height=height+'px';
      qualityRatio=Math.min(qualityRatio,targetPixelRatio());
      renderer.setPixelRatio(qualityRatio);
    }
    const newDistance=Math.max(1,stage.offsetHeight-height);
    const widthChanged=Math.abs(innerWidth-lastViewportWidth)>1;
    if(widthChanged&&oldProgress>=0&&oldProgress<=1)window.scrollTo({top:stage.offsetTop+oldProgress*newDistance,behavior:'instant'});
    lastViewportWidth=innerWidth;
    lastViewportHeight=height;
    lastSceneDistance=newDistance;
    readSceneProgress();
  }
  addEventListener('resize',resize);
  animateText(0);

  const lightWorldPosition=new THREE.Vector3();
  const statueWorldPosition=new THREE.Vector3();
  const lightDirection=new THREE.Vector3();
  const finalSlide=document.querySelector('#slide-4');
  const footerNote=document.querySelector('.footer-note');
  const header=document.querySelector('.showcase header');
  const pagination=document.querySelector('.pagination');
  const vignette=document.querySelector('.vignette');
  const tunnelAmbient=document.querySelector('.tunnel-ambient');
  const exitScreen=document.querySelector('.portal-outro');
  const showcaseFrame=document.querySelector('.showcase-frame');
  const exitScreenContent=exitScreen.querySelector('.portal-outro-inner');
  exitScreenContent.style.animation='none';
  const exitWorld=new THREE.Vector3(),exitView=new THREE.Vector3(),exitProjected=new THREE.Vector3();
  const ringFadeMaterials=[];
  ring.traverse(node=>{
    const materials=Array.isArray(node.material)?node.material:(node.material?[node.material]:[]);
    for(const material of materials){
      material.userData.portalBaseOpacity=material.opacity===undefined?1:material.opacity;
      material.transparent=true;material.depthWrite=!!node.isMesh;
      ringFadeMaterials.push(material);
    }
  });
  let previousFrameTime=performance.now();
  let qualityElapsed=0,qualityFrames=0;
  let lastGpuFrame=0;
  let lastInteraction=performance.now();
  addEventListener('scroll',()=>{lastInteraction=performance.now()},{passive:true});
  addEventListener('wheel',()=>{lastInteraction=performance.now()},{passive:true});
  addEventListener('touchstart',()=>{lastInteraction=performance.now()},{passive:true});
  function render(time) {
    requestAnimationFrame(render);
    if(document.hidden)return;
    const t=time*.001;
    const dt=Math.min(.05,(time-previousFrameTime)/1000||0);
    previousFrameTime=time;
    if(!document.hidden){
      qualityElapsed+=dt;qualityFrames++;
      if(qualityElapsed>=6){
        const fps=qualityFrames/qualityElapsed,limit=targetPixelRatio(),floor=Math.min(limit,1.5);
        const next=fps<40?Math.max(floor,qualityRatio-.1):fps>57?Math.min(limit,qualityRatio+.05):qualityRatio;
        if(Math.abs(next-qualityRatio)>.01){qualityRatio=next;renderer.setPixelRatio(qualityRatio);}
        qualityElapsed=0;qualityFrames=0;
      }
    }else{qualityElapsed=0;qualityFrames=0;}
    const damping=1-Math.exp(-dt*10.5);
    pageProgress+=(pageTarget-pageProgress)*damping;
    exitScreen.style.visibility=pageTarget>=1||pageProgress>portalStart?'visible':'hidden';
    showcaseFrame.style.visibility=pageProgress>.999&&pageTarget>=1?'hidden':'visible';
    sceneScrollProgress=clamp01(pageProgress/portalStart);
    portalProgress=clamp01((pageProgress-portalStart)/(1-portalStart));
    lastGpuFrame=time;
    const focusArrival=smoothStep(.16,.96,portalProgress);
    document.body.style.setProperty('--focus-blur',`${(1-focusArrival)*10}px`);
    document.body.style.setProperty('--focus-scale',String(.8+focusArrival*.2));
    document.body.style.setProperty('--portal-light-opacity',String(smoothStep(.08,.25,portalProgress)*(1-smoothStep(.90,1,portalProgress))));
    sceneScrollTarget=sceneScrollProgress;
    portalTarget=portalProgress;
    const activeIdx=Math.min(sceneStates.length-1,Math.round(sceneTrack(sceneScrollProgress)));
    activateSlide(activeIdx);
    if(typeof window.__updateHeroTextFill==='function') window.__updateHeroTextFill(sceneScrollProgress, currentSlide);
    if(pageTarget>=1&&pageProgress>.999){
      document.documentElement.classList.add('epilogue-idle');
      exitScreen.style.opacity='1';exitScreen.style.clipPath='none';
      exitScreen.style.setProperty('--halo-opacity','1');
      exitScreen.style.setProperty('--exit-scale','1');exitScreen.style.setProperty('--exit-x','0px');exitScreen.style.setProperty('--exit-y','0px');
      exitScreenContent.style.transform='none';exitScreenContent.style.filter='none';
      return;
    }
    document.documentElement.classList.remove('epilogue-idle');
    const portalActive=portalProgress>0;
    if(!portalActive){
      portalTunnel.visible=false;
      portalLight.intensity=0;
      dissolveCloud.visible=false;
      bronzeDissolve.value=0;
      bronze.opacity=1;
      backdropLight.scale.set(13,10,1);ringReflection.material.opacity=.20;
      ringFadeMaterials.forEach(material=>material.opacity=material.userData.portalBaseOpacity);
      ringLights.forEach(lamp=>lamp.intensity=lamp.userData.basePower*ringLightGain);
      ringDissolveCloud.visible=false;
      finalSlide.style.opacity='1';
      footerNote.style.opacity='1';
      header.style.opacity='1';header.style.pointerEvents='auto';
      pagination.style.opacity='1';pagination.style.pointerEvents='auto';
      vignette.style.opacity='1';
      tunnelAmbient.style.opacity='0';
      exitScreen.style.opacity='0';
      const track=sceneTrack(sceneScrollProgress);
      const segment=Math.min(sceneStates.length-2,Math.floor(track));
      const blend=smoothStep(0,1,track-segment);
      const from=sceneStates[segment],to=sceneStates[segment+1];
      const mix=(a,b)=>a+(b-a)*blend;
      camera.position.set(mix(from.camPos.x,to.camPos.x),mix(from.camPos.y,to.camPos.y),mix(from.camPos.z,to.camPos.z));
      camera.lookAt(0,0,0);
      statueGroup.position.set(mix(from.statuePos.x,to.statuePos.x),mix(from.statuePos.y,to.statuePos.y),mix(from.statuePos.z,to.statuePos.z));
      statueGroup.rotation.set(mix(from.statueRot.x,to.statueRot.x),mix(from.statueRot.y,to.statueRot.y),mix(from.statueRot.z,to.statueRot.z));
      statueGroup.scale.setScalar(mix(from.statueScale??1,to.statueScale??1));
      ring.position.set(mix(from.ringPos.x,to.ringPos.x),mix(from.ringPos.y,to.ringPos.y),mix(from.ringPos.z,to.ringPos.z));
      ring.rotation.set(mix(from.ringRot.x,to.ringRot.x),mix(from.ringRot.y,to.ringRot.y),mix(from.ringRot.z,to.ringRot.z));
      ring.scale.setScalar(mix(from.ringScale,to.ringScale));
      key.position.set(mix(from.keyPos.x,to.keyPos.x),mix(from.keyPos.y,to.keyPos.y),mix(from.keyPos.z,to.keyPos.z));
      ringLightGain=1+sceneScrollProgress*.32;
    }
    statueGroup.getWorldPosition(statueWorldPosition);
    ringLights.forEach((lamp,index)=>{
      if(portalProgress<.002&&portalTarget<.002){
        lamp.getWorldPosition(lightWorldPosition);
        if(ringLightTargets[index]){
          ringLightTargets[index].position.copy(statueWorldPosition);
          ringLightTargets[index].position.y += .15;
        }
        lightDirection.copy(lightWorldPosition).sub(statueWorldPosition).normalize();
        const facing=Math.max(0,lightDirection.z);
        lamp.userData.sceneFactor=.82+facing*.16;
        lamp.intensity=lamp.userData.basePower*ringLightGain*lamp.userData.sceneFactor;
      }
    });
    ringCore.material.emissiveIntensity = .22;
    backdropLight.material.opacity = .36*ringLightGain;
    glints.forEach(({sprite,base,phase})=>{sprite.material.opacity=base*(.78+.22*Math.sin(t*.55+phase));});
    const p=portalProgress;
    const passage=smoothStep(.10,.24,p);
    const approach=smoothStep(.08,.38,p);
    const travel=smoothStep(.30,.98,p);
    if(portalActive){
      portalTunnel.visible=p<.999;
      const ringSetup=smoothStep(0,.2,p),ringStart=sceneStates[3];
      const ringPositionStart=ringStart.ringPos,ringRotationStart=ringStart.ringRot;
      ring.position.set(ringPositionStart.x,ringPositionStart.y,ringPositionStart.z);
      ring.rotation.set(ringRotationStart.x*(1-ringSetup),ringRotationStart.y*(1-ringSetup),ringRotationStart.z*(1-ringSetup));
      ring.scale.setScalar(ringStart.ringScale);
      portalTunnel.position.copy(ring.position);
      portalTunnel.rotation.copy(ring.rotation);
      const tunnelScale=ringStart.ringScale/.72;
      portalTunnel.scale.setScalar(tunnelScale);
      portalHoops.forEach((hoop,index)=>{
        hoop.rotation.z=hoop.userData.phase;
        hoop.rotation.x=0;
        hoop.position.x=0;
        hoop.scale.setScalar(1);
        hoop.children[0].material.opacity=passage*(1-smoothStep(.96,1,p));
      });
      const drift=smoothStep(.12,.48,p);
      statueGroup.position.set(ringStart.statuePos.x+drift*.16,ringStart.statuePos.y+drift*.12,ringStart.statuePos.z+drift*.08);
      statueGroup.rotation.set(ringStart.statueRot.x+drift*.025,ringStart.statueRot.y+drift*.1,drift*.02);
      statueGroup.scale.setScalar((ringStart.statueScale??1)*(1-drift*.025));
      statueGroup.updateMatrixWorld(true);ring.updateMatrixWorld(true);
      const ringEvaporation=smoothStep(.56,.76,p);
      ringFadeMaterials.forEach(material=>material.opacity=material.userData.portalBaseOpacity*(1-ringEvaporation));
      ringLights.forEach(lamp=>{const initial=lamp.userData.sceneFactor??1;const lightFactor=initial+(1-initial)*smoothStep(0,.16,p);lamp.intensity=lamp.userData.basePower*ringLightGain*lightFactor*(1-ringEvaporation);});
      ringDissolveCloud.visible=p>.53&&p<.93;
      if(ringDissolveCloud.visible){
        ringDissolveMaterial.uniforms.uOpacity.value=.52*(1-smoothStep(.83,.94,p));
        const ringMatrixElements=ring.matrixWorld.elements;
        for(let i=0;i<ringDissolveCount;i++){
          const j=i*3,offset=ringDissolveOffsets[i];
          const ox=ringDissolveOrigins[j],oy=ringDissolveOrigins[j+1],oz=ringDissolveOrigins[j+2];
          const sx=ringMatrixElements[0]*ox+ringMatrixElements[4]*oy+ringMatrixElements[8]*oz+ringMatrixElements[12];
          const sy=ringMatrixElements[1]*ox+ringMatrixElements[5]*oy+ringMatrixElements[9]*oz+ringMatrixElements[13];
          const sz=ringMatrixElements[2]*ox+ringMatrixElements[6]*oy+ringMatrixElements[10]*oz+ringMatrixElements[14];
          const flow=smoothStep(.54+offset*.08,.76+offset*.1,p);
          const depth=18*flow;
          ringDissolvePositions[j]=sx*(1-flow*.82);
          ringDissolvePositions[j+1]=sy*(1-flow*.82);
          ringDissolvePositions[j+2]=sz-depth;
          ringDissolveAlphas[i]=smoothStep(.535+offset*.08,.59+offset*.14,p)*(1-smoothStep(.84,.94,p));
        }
        ringDissolveGeometry.attributes.position.needsUpdate=true;
        ringDissolveGeometry.attributes.aAlpha.needsUpdate=true;
      }
      const startCamera=ringStart.camPos;
      const cameraZ=startCamera.z-approach*(startCamera.z-ringPositionStart.z+.3)-travel*45*tunnelScale;
      const cameraX=startCamera.x+(ringPositionStart.x-startCamera.x)*approach,cameraY=startCamera.y+(ringPositionStart.y-startCamera.y)*approach;
      camera.position.set(cameraX,cameraY,cameraZ);
      camera.lookAt(cameraX*approach,cameraY*approach,(cameraZ-10)*approach);
      camera.updateMatrixWorld();portalTunnel.updateMatrixWorld(true);
      portalHoops[portalHoops.length-1].getWorldPosition(exitWorld);
      exitView.copy(exitWorld).applyMatrix4(camera.matrixWorldInverse);
      exitProjected.copy(exitWorld).project(camera);
      const inFront=exitView.z<-.1;
      const aperture=inFront?Math.min(Math.hypot(innerWidth,sceneHeight()),sceneHeight()*tunnelScale/(Math.tan(camera.fov*Math.PI/360)*(-exitView.z))):Math.hypot(innerWidth,sceneHeight());
      const centerX=inFront?(exitProjected.x*.5+.5)*innerWidth:innerWidth*.5;
      const centerY=inFront?(1-(exitProjected.y*.5+.5))*sceneHeight():sceneHeight()*.5;
      document.body.style.setProperty('--portal-light-x',`${centerX}px`);
      document.body.style.setProperty('--portal-light-y',`${centerY}px`);
      const screenScale=Math.min(1,aperture/(Math.min(innerWidth*.7,760)*.5));
      const settle=1-smoothStep(.82,1,p);
      const screenX=(centerX-exitScreen.clientWidth*.5)*settle,screenY=(centerY-exitScreen.clientHeight*.5)*settle;
      exitScreen.style.opacity=String(smoothStep(.10,.22,p));
      exitScreen.style.clipPath=`circle(${aperture*.95}px at ${centerX}px ${centerY}px)`;
      exitScreen.style.setProperty('--halo-opacity',String(smoothStep(.9,1,p)));
      exitScreen.style.setProperty('--exit-scale',String(screenScale));
      exitScreen.style.setProperty('--exit-x',`${centerX-innerWidth*.5}px`);exitScreen.style.setProperty('--exit-y',`${centerY-sceneHeight()*.5}px`);
      exitScreenContent.style.transform=`translate(${screenX}px,${screenY}px) scale(${screenScale})`;
      const titleFocus=smoothStep(.12,.52,p);
      exitScreenContent.style.filter=`blur(${(1-titleFocus)*10+(1-screenScale)*2}px)`;
      let nearestRingDistance=Infinity;
      for(const hoop of portalHoops){
        const ringZ=ringPositionStart.z+hoop.position.z*tunnelScale;
        nearestRingDistance=Math.min(nearestRingDistance,Math.abs(cameraZ-ringZ));
      }
      const distanceInRadii=nearestRingDistance/(2.2*tunnelScale);
      const nearbyLight=1/(1+distanceInRadii*distanceInRadii);
      tunnelAmbient.style.opacity=String(smoothStep(.14,.35,p)*(.16+.30*nearbyLight));
      tunnelGlow.position.z=(cameraZ-9*tunnelScale-portalTunnel.position.z)/tunnelScale;
      tunnelGlow.material.opacity=(.025+.025*nearbyLight)*smoothStep(.15,.27,p);
      portalLight.position.set(cameraX,cameraY,cameraZ-2.4);
      portalLight.intensity=.32*smoothStep(.02,.2,p);
      portalLight.distance=24;
      ringLightGain=1.32-.07*smoothStep(0,.16,p);
      backdropLight.material.opacity=(.36*ringLightGain+(.38-.36*ringLightGain)*smoothStep(0,.16,p))*(1-smoothStep(.16,.38,p));
      halo.material.opacity=.38*(1-smoothStep(.16,.38,p));
      backdropLight.scale.set(13,10,1);
      ringReflection.material.opacity=(.20+.02*smoothStep(0,.16,p))*(1-smoothStep(.16,.38,p));
      finalSlide.style.opacity=String(1-smoothStep(.035,.25,p));
      footerNote.style.opacity=String(1-smoothStep(0,.045,p));
      const chromeOpacity=1-smoothStep(.05,.22,p);
      header.style.opacity=String(chromeOpacity);header.style.pointerEvents=p>.22?'none':'auto';
      pagination.style.opacity=String(chromeOpacity);pagination.style.pointerEvents=p>.22?'none':'auto';
      vignette.style.opacity=String(1-smoothStep(.04,.46,p)*.82);
    }
    // Start the breakup while the last scene is still moving toward the portal.
    const dissolve=smoothStep(portalStart-.055,portalStart+.09,pageProgress);
    bronzeDissolve.value=dissolve*1.15;
    bronze.opacity=1;
    dissolveCloud.visible=dissolve>0&&p<.84;
    dissolveMaterial.uniforms.uOpacity.value=.38*(1-smoothStep(.62,.84,p));
    if(dissolveCloud.visible){
      statueGroup.updateMatrixWorld(true);
      const statueMatrix=statueGroup.matrixWorld.elements;
      const breezeX=Math.sin(t*.7),breezeY=Math.cos(t*.6);
      for(let i=0;i<dissolveCount;i++){
        const j=i*3;
        const ox=dissolveOrigins[j],oy=dissolveOrigins[j+1],oz=dissolveOrigins[j+2];
        const sx=statueMatrix[0]*ox+statueMatrix[4]*oy+statueMatrix[8]*oz+statueMatrix[12];
        const sy=statueMatrix[1]*ox+statueMatrix[5]*oy+statueMatrix[9]*oz+statueMatrix[13];
        const sz=statueMatrix[2]*ox+statueMatrix[6]*oy+statueMatrix[10]*oz+statueMatrix[14];
        const surface=(4.2-sy)/8.4+(dissolveOffsets[i]-.5)*.025;
        const age=Math.max(0,Math.min(1,(dissolve*1.15-surface)/.38));
        const local=age*age*(3-2*age);
        const swirl=Math.sin(local*Math.PI);
        const dx=sx-1.6-Math.abs(dissolveCos[i])*1.8;
        const dy=sy+.8+Math.abs(dissolveSin[i])*1.5;
        const dz=sz-.6-dissolveRadii[i]*.25;
        dissolvePositions[j]=sx+(dx-sx)*local+(dissolveCurveX[i]+breezeX*dissolveSin[i]*.12)*swirl;
        dissolvePositions[j+1]=sy+(dy-sy)*local+(dissolveCurveY[i]+breezeY*dissolveCos[i]*.10)*swirl;
        dissolvePositions[j+2]=sz+(dz-sz)*local+dissolveCurveZ[i]*swirl;
        dissolveAlphas[i]=smoothStep(0,.1,age)*(1-smoothStep(.65,1,age));
      }
      dissolveGeometry.attributes.position.needsUpdate=true;
      dissolveGeometry.attributes.aAlpha.needsUpdate=true;
    }
    // Built-in Luxury 3D Rig: smooth 60fps museum chiaroscuro light, sculptural arrival, subtle breathing, dynamic FOV-warp & banking
    if(!scene.userData.luxuryRig){
      const museumKey=new THREE.SpotLight(0xffd29d,0,28,Math.PI/4.0,0.85,1.2);
      museumKey.position.set(-4,4,8);
      scene.add(museumKey);
      const warmRim=new THREE.PointLight(0xe59c5b,0,22,1.45);
      warmRim.position.set(4,2,-3);
      scene.add(warmRim);
      scene.userData.luxuryRig={
        museumKey,warmRim,sx:0,sy:0,
        arrivalP:0,arrivalActive:true,
        lastProg:pageProgress,vel:0,fovCur:45,bankCur:0
      };
      window.__triggerBustArrival=()=>{
        const r=scene.userData.luxuryRig;
        if(r){r.arrivalP=0;r.arrivalActive=true;}
      };
    }
    const lrig=scene.userData.luxuryRig;
    const ptr=window.__sitePointer||{nx:0,ny:0};
    lrig.sx+=(ptr.nx-lrig.sx)*.06;
    lrig.sy+=(ptr.ny-lrig.sy)*.06;

    const dp=pageProgress-lrig.lastProg;
    lrig.lastProg=pageProgress;
    const instantVel=Math.max(-.04,Math.min(.04,dp))*100;
    lrig.vel+=(instantVel-lrig.vel)*.12;

    let arrivalEase=0;
    if(lrig.arrivalActive){
      lrig.arrivalP=Math.min(1,lrig.arrivalP+dt*0.95);
      arrivalEase=Math.pow(1-lrig.arrivalP,3.5);
      if(lrig.arrivalP>=1)lrig.arrivalActive=false;
    }

    const portalWarp=p>0&&p<.92 ? Math.sin(p*Math.PI)*18 : 0;
    const speedWarp=Math.min(11,Math.abs(lrig.vel)*5.2);
    const targetFov=45+portalWarp+speedWarp+arrivalEase*12;
    lrig.fovCur+=(targetFov-lrig.fovCur)*.1;
    if(Math.abs(camera.fov-lrig.fovCur)>.02){
      camera.fov=lrig.fovCur;
      camera.updateProjectionMatrix();
    }

    const targetBank=Math.max(-.075,Math.min(.075,lrig.vel*.036-lrig.sx*.018));
    lrig.bankCur+=(targetBank-lrig.bankCur)*.09;

    if(arrivalEase>.0005){
      statueGroup.position.y-=arrivalEase*.55;
      statueGroup.rotation.y-=arrivalEase*.52;
      const ascale=1-arrivalEase*.08;
      statueGroup.scale.multiplyScalar(ascale);
    }

    if(p<.02){
      statueGroup.rotation.y+=lrig.sx*.14+Math.sin(t*.7)*.022;
      statueGroup.rotation.x+=-lrig.sy*.065+Math.cos(t*.55)*.012;
      statueGroup.position.y+=Math.sin(t*1.05)*.038;
      ring.rotation.y+=lrig.sx*.08;
      ring.rotation.x+=-lrig.sy*.05;
      ringCore.material.emissiveIntensity=.22+.08*(.5+.5*Math.sin(t*1.6));
    }
    camera.rotation.z+=lrig.bankCur;

    lrig.museumKey.position.set(lrig.sx*7.2-arrivalEase*5,lrig.sy*4.0+2.6,7.0);
    lrig.museumKey.intensity+=(2.35*(1-arrivalEase*.4)-lrig.museumKey.intensity)*.08;
    lrig.warmRim.position.set(Math.cos(t*.55)*4.8,Math.sin(t*.42)*2.4+1.5,-2.5);
    lrig.warmRim.intensity+=(1.05-lrig.warmRim.intensity)*.06;
    renderer.render(scene,camera);
  }
  requestAnimationFrame(render);
})();

(()=>{if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const targets=document.querySelectorAll('.final-content > .section-kicker,.final-content > h2,.epilogue-intro,.final-row,.work-contact');targets.forEach((element,index)=>{element.classList.add('focus-reveal');element.style.setProperty('--focus-delay',`${Math.min(index%3*90,180)}ms`)});const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('focus-visible',entry.isIntersecting||entry.boundingClientRect.top<0)),{threshold:.12,rootMargin:'0px 0px -3% 0px'});targets.forEach(element=>observer.observe(element))})();

(()=>{const section=document.querySelector('.epilogue');if(!section||!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const observer=new IntersectionObserver(entries=>entries.forEach(entry=>section.classList.toggle('epilogue-visible',entry.isIntersecting)),{threshold:.04});observer.observe(section)})();

(()=>{const section=document.querySelector('.epilogue');if(!section||matchMedia('(prefers-reduced-motion: reduce)').matches)return;let queued=false;function update(){queued=false;const rect=section.getBoundingClientRect(), span=innerHeight+rect.height, progress=Math.min(1,Math.max(0,(innerHeight-rect.top)/span));section.style.setProperty('--final-shift',`${(progress-.5)*-100}px`);section.style.setProperty('--final-turn',`${progress*40}deg`)}function schedule(){if(!queued){queued=true;requestAnimationFrame(update)}}addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);schedule()})();
