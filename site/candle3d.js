/* =========================================================
   YUMIYA CANDLE — bougie gourmande en 3D (three.js)
   Utilisation : Candle3D.mount(element, { flavor: 'lav' })
   ========================================================= */
(() => {
  'use strict';
  if (!window.THREE) return;
  const T = window.THREE;
  if (T.ColorManagement) T.ColorManagement.legacyMode = false; // couleurs fidèles (sRGB)

  const FLAVORS = {
    lav: { top: '#b596dc', base: '#f2ece3', deco: '#9b6fd0', decos: ['heart', 'heart', 'heart', 'tablet', 'heart'] },
    aut: { top: '#ea7f1e', base: '#f2ece3', deco: '#f08a2a', decos: ['tablet', 'butterfly', 'heart', 'heart', 'butterfly'] },
  };

  /* ---------- Textures générées ---------- */
  function radialTexture(stops, size = 128) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d'), gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(([o, col]) => gr.addColorStop(o, col));
    g.fillStyle = gr; g.fillRect(0, 0, size, size);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t;
  }
  // Le logo (traits sombres sur fond blanc) devient une étiquette transparente
  function labelTexture(src, done) {
    const img = new Image();
    img.onload = () => {
      const s = 512, c = document.createElement('canvas'); c.width = c.height = s;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0, s, s);
      const d = g.getImageData(0, 0, s, s), p = d.data;
      for (let i = 0; i < p.length; i += 4) {
        const lum = (p[i] * .3 + p[i + 1] * .59 + p[i + 2] * .11);
        const a = Math.max(0, Math.min(255, (235 - lum) * 1.6));
        p[i] = 44; p[i + 1] = 34; p[i + 2] = 40; p[i + 3] = a;
      }
      g.putImageData(d, 0, 0);
      const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 8; done(t);
    };
    img.src = src;
  }

  /* ---------- Environnement lumineux doux (studio) ---------- */
  function studioEnv(renderer) {
    const sc = new T.Scene();
    const room = new T.Mesh(new T.BoxGeometry(10, 10, 10), new T.MeshBasicMaterial({ color: 0x8a7a70, side: T.BackSide }));
    sc.add(room);
    const panel = (w, h, x, y, z, ry, col, k) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(col).multiplyScalar(k), side: T.DoubleSide })); m.position.set(x, y, z); m.rotation.y = ry; m.lookAt(0, 0, 0); sc.add(m); };
    panel(4, 6, -4.5, 1, 1, 0, '#fff6ea', 5);
    panel(3, 5, 4.5, 1.5, -1, 0, '#ffe7cf', 3.2);
    panel(6, 2, 0, 4.8, 0, 0, '#ffffff', 2.4);
    panel(3, 3, 0, 0, 4.8, 0, '#fff0e0', 1.6);
    const pm = new T.PMREMGenerator(renderer);
    const env = pm.fromScene(sc, .04).texture; pm.dispose();
    return env;
  }

  /* ---------- Formes ---------- */
  function rosetteGeo(r, h) {
    const pts = [[0, 0], [.86, 0], [1, .12], [.94, .3], [.78, .46], [.58, .6], [.4, .74], [.24, .86], [.1, .96], [0, 1]].map(([x, y]) => new T.Vector2(x * r, y * h));
    const g = new T.LatheGeometry(pts, 72);
    const pos = g.attributes.position, v = new T.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const th = Math.atan2(v.z, v.x), k = 1 + .14 * Math.cos(8 * th + v.y / h * 5.5);
      pos.setXYZ(i, v.x * k, v.y, v.z * k);
    }
    g.computeVertexNormals();
    return g;
  }
  function heartGeo(s) {
    const sh = new T.Shape();
    sh.moveTo(0, -.9); sh.bezierCurveTo(-1.6, .1, -.8, 1.2, 0, .45); sh.bezierCurveTo(.8, 1.2, 1.6, .1, 0, -.9);
    const g = new T.ExtrudeGeometry(sh, { depth: .35, bevelEnabled: true, bevelThickness: .18, bevelSize: .14, bevelSegments: 4, curveSegments: 24 });
    g.center(); g.scale(s, s, s); return g;
  }
  function wingGeo(s) {
    const sh = new T.Shape();
    sh.moveTo(0, 0); sh.bezierCurveTo(-.4, 1.3, -1.6, 1.3, -1.3, .2); sh.bezierCurveTo(-1.5, -.6, -.6, -.9, 0, 0);
    sh.bezierCurveTo(.6, -.9, 1.5, -.6, 1.3, .2); sh.bezierCurveTo(1.6, 1.3, .4, 1.3, 0, 0);
    const g = new T.ExtrudeGeometry(sh, { depth: .18, bevelEnabled: true, bevelThickness: .08, bevelSize: .07, bevelSegments: 3, curveSegments: 20 });
    g.center(); g.scale(s, s, s); return g;
  }

  function mount(el, opts = {}) {
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); }
    catch (e) { return null; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .95;
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:pan-y;cursor:grab';
    el.appendChild(renderer.domElement);

    const scene = new T.Scene();
    scene.environment = studioEnv(renderer);
    const camera = new T.PerspectiveCamera(30, 1, .1, 50);
    camera.position.set(0, 1.6, 11.5);
    camera.lookAt(0, .3, 0);

    const key = new T.DirectionalLight(0xfff1e0, 1.1); key.position.set(-3, 5, 4); scene.add(key);
    const rim = new T.DirectionalLight(0xffe2c4, .7); rim.position.set(4, 2, -3); scene.add(rim);
    scene.add(new T.HemisphereLight(0xfff8f0, 0xb8a090, .35));
    const flameLight = new T.PointLight(0xffb45a, 0, 6, 2); scene.add(flameLight);

    const root = new T.Group(); scene.add(root);
    const candle = new T.Group(); root.add(candle);

    // Ombre douce au sol
    const shadow = new T.Mesh(new T.PlaneGeometry(4.2, 4.2), new T.MeshBasicMaterial({ map: radialTexture([[0, 'rgba(40,25,20,.42)'], [.45, 'rgba(40,25,20,.16)'], [1, 'rgba(40,25,20,0)']]), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.19; root.add(shadow);

    const R = 1, H = 2.3, yBot = -1.15;
    // Verre
    const glassMat = new T.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: .04, transmission: 1, thickness: .25, ior: 1.45, transparent: true, opacity: 1, envMapIntensity: .85, clearcoat: .4, clearcoatRoughness: .08, specularIntensity: .8 });
    const wall = new T.Mesh(new T.CylinderGeometry(R, R * .985, H, 128, 1, true), glassMat); wall.position.y = yBot + H / 2; candle.add(wall);
    const inner = new T.Mesh(new T.CylinderGeometry(R * .955, R * .94, H - .02, 128, 1, true), new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: .05, transmission: 1, thickness: .1, transparent: true, side: T.BackSide, envMapIntensity: .8 }));
    inner.position.y = wall.position.y; candle.add(inner);
    const base = new T.Mesh(new T.CylinderGeometry(R * .985, R * .97, .2, 128), glassMat); base.position.y = yBot + .1; candle.add(base);
    const lip = new T.Mesh(new T.TorusGeometry(R * .978, .028, 16, 160), glassMat); lip.rotation.x = Math.PI / 2; lip.position.y = yBot + H; candle.add(lip);

    // Cire (deux couches)
    const waxR = R * .935, waxBot = yBot + .2;
    const waxMat = (c) => new T.MeshPhysicalMaterial({ color: c, roughness: .7, sheen: .12, sheenColor: new T.Color(0xffffff), envMapIntensity: .65, clearcoat: .1, clearcoatRoughness: .6 });
    const baseMat = waxMat('#f2ece3'), topMat = waxMat('#b596dc');
    const lowH = .78, topH = .42;
    const low = new T.Mesh(new T.CylinderGeometry(waxR, waxR * .99, lowH, 96), baseMat); low.position.y = waxBot + lowH / 2; candle.add(low);
    const high = new T.Mesh(new T.CylinderGeometry(waxR, waxR, topH, 96), topMat); high.position.y = waxBot + lowH + topH / 2; candle.add(high);
    const waxTop = waxBot + lowH + topH;

    // Chantilly pochée : couronne de rosettes + rosettes du centre
    const creamMat = new T.MeshPhysicalMaterial({ color: 0xf8f1e4, roughness: .55, sheen: .25, sheenColor: new T.Color(0xffffff), envMapIntensity: .8, clearcoat: .15, clearcoatRoughness: .5 });
    const cream = new T.Group(); candle.add(cream);
    const ros = rosetteGeo(.27, .42);
    for (let i = 0; i < 11; i++) { const a = i / 11 * Math.PI * 2, m = new T.Mesh(ros, creamMat); m.position.set(Math.cos(a) * .7, waxTop - .02, Math.sin(a) * .7); m.rotation.y = a * 3; m.scale.setScalar(.95 + (i % 3) * .06); cream.add(m); }
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + .3, m = new T.Mesh(ros, creamMat); m.position.set(Math.cos(a) * .32, waxTop + .06, Math.sin(a) * .32); m.scale.setScalar(1.1); cream.add(m); }
    const centre = new T.Mesh(rosetteGeo(.3, .5), creamMat); centre.position.set(0, waxTop + .18, 0); cream.add(centre);
    const creamTop = waxTop + .62;

    // Décors (cœurs, tablette, papillons)
    const decoMat = new T.MeshPhysicalMaterial({ color: '#9b6fd0', roughness: .38, clearcoat: .5, clearcoatRoughness: .3 });
    const decos = new T.Group(); candle.add(decos);
    const HEART = heartGeo(.16), WING = wingGeo(.15);
    const tabletGeo = new T.BoxGeometry(.5, .36, .09);
    function buildDecos(list) {
      decos.clear();
      const spots = [[-.48, .52, .2, -.5, .25], [.42, .5, .28, .35, -.2], [.1, .64, -.32, .1, .1], [-.2, .58, .44, -.2, .35], [.55, .44, -.22, .6, -.3]];
      list.forEach((type, i) => {
        const [x, y, z, ry, rz] = spots[i];
        let m;
        if (type === 'tablet') {
          m = new T.Group();
          const b = new T.Mesh(tabletGeo, decoMat); m.add(b);
          for (let gx = -1; gx <= 1; gx++) for (let gy = -1; gy <= 1; gy += 2) { const sq = new T.Mesh(new T.BoxGeometry(.13, .13, .04), decoMat); sq.position.set(gx * .155, gy * .085, .06); m.add(sq); }
          m.scale.setScalar(1.15);
        } else if (type === 'butterfly') m = new T.Mesh(WING, decoMat);
        else m = new T.Mesh(HEART, decoMat);
        m.position.set(x, waxTop + y, z); m.rotation.set(-.35, ry, rz);
        decos.add(m);
      });
    }

    // Mèche et flamme
    const wick = new T.Mesh(new T.CylinderGeometry(.03, .035, .75, 12), new T.MeshStandardMaterial({ color: 0xe9dcc6, roughness: .9 }));
    wick.position.y = creamTop + .1; candle.add(wick);
    const wickTip = new T.Mesh(new T.SphereGeometry(.032, 10, 10), new T.MeshStandardMaterial({ color: 0x2a1c18, roughness: .9 }));
    wickTip.position.y = creamTop + .48; candle.add(wickTip);
    const flame = new T.Sprite(new T.SpriteMaterial({ map: radialTexture([[0, 'rgba(255,255,245,1)'], [.25, 'rgba(255,226,140,.95)'], [.55, 'rgba(255,150,50,.45)'], [1, 'rgba(255,120,30,0)']]), blending: T.AdditiveBlending, depthWrite: false, transparent: true }));
    flame.scale.set(.24, .5, 1); flame.position.y = creamTop + .74; candle.add(flame);
    const halo = new T.Sprite(new T.SpriteMaterial({ map: radialTexture([[0, 'rgba(255,200,120,.55)'], [1, 'rgba(255,190,110,0)']]), blending: T.AdditiveBlending, depthWrite: false, transparent: true }));
    halo.scale.set(1.4, 1.4, 1); halo.position.y = creamTop + .74; candle.add(halo);
    flameLight.position.set(0, creamTop + .8, 0);

    // Étiquette (logo) collée sur le verre
    labelTexture('img/logo.webp', (tex) => {
      const lab = new T.Mesh(new T.CylinderGeometry(R * 1.004, R * 1.004, 1.05, 64, 1, true, -.6, 1.2), new T.MeshStandardMaterial({ map: tex, transparent: true, roughness: .6, side: T.FrontSide, depthWrite: false }));
      lab.position.y = waxBot + .58; candle.add(lab);
    });

    /* ---------- État et interactions ---------- */
    let lit = opts.lit !== false, litK = lit ? 1 : 0;
    function setFlavor(k) {
      const f = FLAVORS[k] || FLAVORS.lav;
      topMat.color.set(f.top); baseMat.color.set(f.base); decoMat.color.set(f.deco);
      buildDecos(f.decos);
    }
    setFlavor(opts.flavor || 'lav');

    let rotY = -.5, vel = 0, dragging = false, lastX = 0, lastT = 0, auto = opts.autoRotate !== false, extraRot = 0, tilt = 0, zoom = 1, offX = 0, offY = 0, curX = 0, curY = 0;
    const cv = renderer.domElement;
    cv.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; lastT = e.timeStamp; vel = 0; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; });
    cv.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX, dt = Math.max(1, e.timeStamp - lastT);
      rotY += dx * .01; vel = dx * .01 / dt * 16; lastX = e.clientX; lastT = e.timeStamp;
    });
    const up = () => { dragging = false; cv.style.cursor = 'grab'; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

    function resize() {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false); camera.aspect = w / h;
      camera.position.z = 11.5 * Math.max(1, .75 / (w / h)); // recule sur écran étroit
      camera.updateProjectionMatrix();
    }
    resize(); addEventListener('resize', resize);

    let visible = true, t0 = performance.now();
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(el);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function frame(now) {
      requestAnimationFrame(frame);
      if (!visible) return;
      const t = (now - t0) / 1000;
      if (!dragging) { vel *= .94; rotY += vel; if (auto && !reduce && Math.abs(vel) < .002) rotY += .0035; }
      root.rotation.y = rotY + extraRot;
      root.rotation.x = tilt;
      root.scale.setScalar(zoom);
      curX += (offX - curX) * .08; curY += (offY - curY) * .08;
      root.position.x = curX;
      root.position.y = curY + (reduce ? 0 : Math.sin(t * 1.1) * .04);
      litK += ((lit ? 1 : 0) - litK) * .08;
      const fl = 1 + Math.sin(t * 13) * .05 + Math.sin(t * 7.3) * .04;
      flame.material.opacity = litK; halo.material.opacity = litK * .45;
      flame.scale.set(.24 * fl, .5 * (2 - fl), 1);
      flame.position.x = Math.sin(t * 5) * .012;
      flameLight.intensity = litK * 1.4 * fl;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);

    return {
      setFlavor,
      setLit(v) { lit = v; },
      isLit: () => lit,
      setScroll(rot, tl = 0, z = 1, x = 0, y = 0) { extraRot = rot; tilt = tl; zoom = z; offX = x; offY = y; },
      setAuto(v) { auto = v; },
    };
  }

  window.Candle3D = { mount };
})();
