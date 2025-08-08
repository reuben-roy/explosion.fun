'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import styles from './page.module.css';
import Navbar from '@/components/Navbar'; // NEW (ensure this path matches your project)

export default function SolarSystemClient() {
    const containerRef = useRef(null);
    const threeRootRef = useRef(null);
    const tooltipRef = useRef(null);
    const animationRef = useRef(null);
    const controlsRef = useRef(null);
    const rotateByRef = useRef(() => { });
    const systemGroupRef = useRef(null);
    const [info, setInfo] = useState({
        title: 'Interactive 3D Solar System',
        body: 'Hover or tap planets for details. Scroll (or buttons) to zoom. Drag to rotate. Rotate buttons spin the system.'
    });

    useEffect(() => {
        const container = containerRef.current;
        const mountEl = threeRootRef.current;
        const tooltipEl = tooltipRef.current;
        if (!container || !mountEl) return;

        /* --- Data --- */
        const planetData = [
            { name: 'Mercury', orbitRadius: 60, r: 4, color: '#a7a7a7', periodDays: 88, description: 'Smallest planet; no atmosphere; extreme temperatures.' },
            { name: 'Venus', orbitRadius: 90, r: 6, color: '#e0c16e', periodDays: 224.7, description: 'Dense CO2 atmosphere; runaway greenhouse effect.' },
            { name: 'Earth', orbitRadius: 120, r: 6.5, color: '#4aa3ff', periodDays: 365.25, description: 'Liquid water; life-supporting atmosphere.' },
            { name: 'Mars', orbitRadius: 150, r: 5, color: '#d1603d', periodDays: 687, description: 'Red planet; past water evidence.' },
            { name: 'Jupiter', orbitRadius: 210, r: 11, color: '#d9b48f', periodDays: 4333, description: 'Gas giant; Great Red Spot.' },
            { name: 'Saturn', orbitRadius: 270, r: 10, color: '#e8d9b5', periodDays: 10759, description: 'Gas giant with rings.' },
            { name: 'Uranus', orbitRadius: 330, r: 9, color: '#8dd1d1', periodDays: 30687, description: 'Ice giant; tilted axis.' },
            { name: 'Neptune', orbitRadius: 380, r: 9, color: '#4976ff', periodDays: 60190, description: 'Distant windy ice giant.' }
        ];

        /* --- Scene Setup --- */
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        mountEl.appendChild(renderer.domElement);

        const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 5000);
        camera.position.set(0, 220, 520);

        const ORBIT_SPEED_FACTOR = 4; // NEW: >1 speeds up orbital motion (4x)

        /* Light & Sun */
        const sunGroup = new THREE.Group();
        scene.add(sunGroup);

        const sunGeo = new THREE.SphereGeometry(22, 48, 48);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xffcc33 });
        const sunMesh = new THREE.Mesh(sunGeo, sunMat);
        sunGroup.add(sunMesh);

        const sunLight = new THREE.PointLight(0xffc450, 2.2, 0, 2);
        sunGroup.add(sunLight);

        // Pulsing halo via sprite
        const haloTexture = new THREE.TextureLoader().load(
            'data:image/svg+xml;utf8,' +
            encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
            <radialGradient id="g" cx="50%" cy="50%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
              <stop offset="60%" stop-color="#ffcc33" stop-opacity="0.4"/>
              <stop offset="100%" stop-color="#ff8800" stop-opacity="0"/>
            </radialGradient>
            <circle cx="128" cy="128" r="128" fill="url(#g)"/>
          </svg>`
            )
        );
        const haloMat = new THREE.SpriteMaterial({ map: haloTexture, depthWrite: false, transparent: true });
        const halo = new THREE.Sprite(haloMat);
        halo.scale.setScalar(220);
        sunGroup.add(halo);

        /* System group (rotated & scaled) */
        const systemGroup = new THREE.Group();
        scene.add(systemGroup);
        systemGroupRef.current = systemGroup;

        /* Stars (points) */
        const starGeo = new THREE.BufferGeometry();
        const starCount = 2000;
        const starPositions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            const r = 1600 * Math.cbrt(Math.random());
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
            starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            starPositions[i * 3 + 2] = r * Math.cos(phi);
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starMat = new THREE.PointsMaterial({ color: 0x000000, size: 2, sizeAttenuation: true, transparent: true, opacity: 0.30 }); // changed to black
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);

        /* Orbits (wire circles) and Planets */
        const ORBIT_SCALE = 1.2; // adjust to space out
        const SIZE_SCALE = 1.2;
        const planets = [];

        planetData.forEach(d => {
            // Orbit path
            const orbitCurve = new THREE.EllipseCurve(0, 0, d.orbitRadius * ORBIT_SCALE, d.orbitRadius * ORBIT_SCALE, 0, Math.PI * 2, false, 0);
            const points = orbitCurve.getPoints(180);
            const orbitGeo = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, 0, p.y)));
            const orbitMat = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 }); // was gray; now black
            const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
            systemGroup.add(orbitLine);

            // Planet mesh
            const geo = new THREE.SphereGeometry(d.r * SIZE_SCALE, 32, 32);
            const mat = new THREE.MeshStandardMaterial({
                color: d.color,
                emissive: new THREE.Color(d.color).multiplyScalar(0.12),
                roughness: 0.6,
                metalness: 0.1
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.userData = d;
            systemGroup.add(mesh);

            // Saturn ring
            if (d.name === 'Saturn') {
                const ringGeo = new THREE.RingGeometry(d.r * SIZE_SCALE * 1.8, d.r * SIZE_SCALE * 2.8, 64);
                // fade ring inside
                const ringMat = new THREE.MeshBasicMaterial({
                    color: 0xd9c79f,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.55
                });
                const ring = new THREE.Mesh(ringGeo, ringMat);
                ring.rotation.x = Math.PI / 2.4;
                ring.userData.ignoreRaycast = true;
                mesh.add(ring);
            }

            planets.push({ data: d, mesh, angle: 0 });
        });

        /* Controls */
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.rotateSpeed = 0.6;
        controls.zoomSpeed = 0.9;
        controls.minDistance = 80;
        controls.maxDistance = 1400;
        controlsRef.current = controls;

        /* Resize */
        function resize() {
            const w = container.clientWidth;
            const h = container.clientHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        resize();
        window.addEventListener('resize', resize);

        /* Tooltip helpers (raycasting) */
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let hovered = null;

        function onPointerMove(e) {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        }

        function updateTooltip(intersection) {
            if (!intersection) {
                tooltipEl.style.opacity = 0;
                return;
            }
            const d = intersection.object.userData;
            tooltipEl.style.opacity = 1;
            tooltipEl.innerHTML = `<strong>${d.name}</strong><br/>Period: ${d.periodDays} d<br/>Orbit: ${d.orbitRadius}`;
            const rect = container.getBoundingClientRect();
            // Project 3D position to screen
            const v = intersection.object.position.clone().applyMatrix4(systemGroup.matrixWorld);
            const projected = v.clone().project(camera);
            const x = (projected.x * 0.5 + 0.5) * rect.width;
            const y = (-projected.y * 0.5 + 0.5) * rect.height;
            tooltipEl.style.left = x + 'px';
            tooltipEl.style.top = y + 'px';
        }

        function clickHandler() {
            if (hovered) {
                const d = hovered.object.userData;
                setInfo({
                    title: d.name + ' (Selected)',
                    body: d.description +
                        `\nOrbit radius: ${d.orbitRadius} (scaled units)\nOrbital period: ${d.periodDays} days`
                });
            }
        }

        renderer.domElement.addEventListener('pointermove', onPointerMove);
        renderer.domElement.addEventListener('click', clickHandler);

        /* Public rotation buttons */
        rotateByRef.current = (deg) => {
            systemGroup.rotation.y += THREE.MathUtils.degToRad(deg);
        };

        /* Animation */
        const start = performance.now();
        function animate() {
            const elapsed = performance.now() - start;

            // Planet revolution
            planets.forEach(p => {
                const periodMs = (p.data.periodDays * 1000) / ORBIT_SPEED_FACTOR; // accelerated
                const angle = (elapsed / periodMs) * Math.PI * 2;
                const r = p.data.orbitRadius * ORBIT_SCALE;
                p.mesh.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
                // Slow axial self-rotation
                p.mesh.rotation.y += 0.004; // was 0.002 (faster axial spin)
            });

            // Sun halo pulse
            const pulse = 0.55 + Math.sin(elapsed * 0.0012) * 0.15;
            halo.material.opacity = pulse * 0.7;
            halo.scale.setScalar(200 + pulse * 40);

            controls.update();

            // Raycast for hover
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));
            const first = intersects.find(i => !i.object.userData.ignoreRaycast);
            if (first) {
                if (hovered?.object !== first.object) {
                    const d = first.object.userData;
                    setInfo(i => ({
                        title: d.name,
                        body: d.description +
                            `\nOrbit radius: ${d.orbitRadius} (scaled units)\nOrbital period: ${d.periodDays} days`
                    }));
                }
                hovered = first;
                updateTooltip(first);
            } else {
                hovered = null;
                updateTooltip(null);
            }

            renderer.render(scene, camera);
            animationRef.current = requestAnimationFrame(animate);
        }
        animate();

        /* Zoom helpers for buttons */
        function zoom(amount) {
            // Dolly using controls (simulate)
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            const delta = dir.multiplyScalar(amount);
            camera.position.add(delta);
            controls.target.add(delta.multiplyScalar(0)); // keep target
        }

        /* Provide closures to buttons via refs */
        (renderer.domElement).__zoomIn = () => zoom(-40);
        (renderer.domElement).__zoomOut = () => zoom(40);

        /* Cleanup */
        return () => {
            cancelAnimationFrame(animationRef.current);
            window.removeEventListener('resize', resize);
            renderer.domElement.removeEventListener('pointermove', onPointerMove);
            renderer.domElement.removeEventListener('click', clickHandler);
            renderer.dispose();
            mountEl.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div className={styles.page}>
            <Navbar /> {/* NEW */}
            <section className={styles.solarSection}>
                <div className={styles.solarBox}>
                    <div ref={containerRef} className={styles.container}>
                        <div ref={threeRootRef} className={styles.webglHost} />
                        <div ref={tooltipRef} className={styles.tooltip} />
                        <div className={styles.zoomControls}>
                            <button
                                onClick={() => {
                                    const canvas = threeRootRef.current?.querySelector('canvas');
                                    canvas && canvas.__zoomIn && canvas.__zoomIn();
                                }}
                            >
                                +
                            </button>
                            <button
                                onClick={() => {
                                    const canvas = threeRootRef.current?.querySelector('canvas');
                                    canvas && canvas.__zoomOut && canvas.__zoomOut();
                                }}
                            >
                                −
                            </button>
                            <button aria-label="Rotate Left" onClick={() => rotateByRef.current(-10)}>⟲</button>
                            <button aria-label="Rotate Right" onClick={() => rotateByRef.current(10)}>⟳</button>
                        </div>
                        <div className={styles.infoPanel}>
                            <h3>{info.title}</h3>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{info.body}</pre>
                            <div className={styles.zoomHint}>Scroll / buttons to zoom. Drag to rotate view. Rotate buttons spin system.</div>
                        </div>
                        <div className={styles.footerHint}>Three.js Solar System (3D)</div>
                    </div>
                </div>
            </section>
            <section className={styles.extraContent}>
                <h2>About This Visualization</h2>
                <p>
                    This interactive 3D solar system is a simplified, scaled representation using accelerated orbital
                    periods (1 real second ~ 1 planet day). You can rotate the view, zoom in, and inspect each planet.
                </p>
                <p>
                    The orbital radii and sizes are visually adjusted for clarity, not to scale. Lighting is simulated with a
                    central point light and emissive sun sprite. Hover for quick facts, click for details.
                </p>
                <h2>Possible Extensions</h2>
                <p>
                    Add moons (e.g. Luna, Io, Europa), dynamic labels, realistic textures, asteroid belts, or a time
                    slider. You can also integrate data overlays (temperature, gravity, inclination).
                </p>
                <p>
                    To customize, edit <code>planetData</code> inside this page or extract it into a shared module.
                </p>
            </section>
        </div>
    );
}
