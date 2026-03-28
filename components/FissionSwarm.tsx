"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

interface FissionSwarmProps {
    onFinish: () => void;
}

const FissionSwarm: React.FC<FissionSwarmProps> = ({ onFinish }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>(0);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const width = window.innerWidth;
        const height = window.innerHeight;

        // CONFIG
        const COUNT = 12000;
        const SPEED_MULT = 0.55;
        const AUTO_SPIN = true;

        // SETUP
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000000, 0.008);
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
        camera.position.set(0, 0, 110);

        const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance", alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.autoRotate = AUTO_SPIN;
        controls.autoRotateSpeed = 0.8;
        controls.enableZoom = false;

        // POST PROCESSING
        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.5, 0.4, 0.85);
        bloomPass.strength = 1.4;
        bloomPass.radius = 0.6;
        bloomPass.threshold = 0.1;
        composer.addPass(bloomPass);

        // SWARM OBJECTS
        const dummy = new THREE.Object3D();
        const color = new THREE.Color();
        const target = new THREE.Vector3();

        // INSTANCED MESH
        const geometry = new THREE.TetrahedronGeometry(0.28);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

        const instancedMesh = new THREE.InstancedMesh(geometry, material, COUNT);
        instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        scene.add(instancedMesh);

        // DATA ARRAYS
        const positions: THREE.Vector3[] = [];
        for (let i = 0; i < COUNT; i++) {
            positions.push(new THREE.Vector3((Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150));
            instancedMesh.setColorAt(i, color.setHex(0xffffff));
        }

        const PARAMS = { "simSpeed": 0.16, "nuclScale": 24, "yieldForce": 140, "instability": 3.0 };
        const clock = new THREE.Clock();
        let finished = false;

        function animate() {
            requestRef.current = requestAnimationFrame(animate);
            const time = clock.getElapsedTime() * SPEED_MULT;

            controls.update();

            const simSpeed = PARAMS.simSpeed;
            const nuclScale = PARAMS.nuclScale;
            const yieldForce = PARAMS.yieldForce;
            const instability = PARAMS.instability;

            const cycle = (time * simSpeed) % 1.0;

            // Trigger finish exactly at the peak 'boom' (scission point)
            // 0.42 / 0.16 = ~2.6 seconds
            if (time * simSpeed >= 0.42 && !finished) {
                finished = true;
                onFinish();
            }

            const defCycle = Math.min(cycle, 0.42);
            const cs = (defCycle - 0.38) * 8.0;
            const tStretch = Math.exp(-(cs * cs));

            const cp = (cycle - 0.15) * 10.0;
            const tPulse = Math.exp(-(cp * cp));

            const tSplit = Math.max(0, cycle - 0.42) * 2.0;
            const tFade = Math.max(0, 1.0 - Math.max(0, cycle - 0.85) * 6.66);

            for (let i = 0; i < COUNT; i++) {
                const u = i / COUNT;
                const phi = Math.acos(1.0 - 2.0 * ((i * 0.754877) % 1.0));
                const theta = Math.PI * 2.0 * i * 1.61803398875;
                const dirX = Math.sin(phi) * Math.cos(theta);
                const dirY = Math.sin(phi) * Math.sin(theta);
                const dirZ = Math.cos(phi);

                let posX = 0, posY = 0, posZ = 0;
                let hue = 0.0, sat = 1.0, lig = 0.5;

                if (u < 0.8) {
                    const rBase = Math.pow((i * 0.618033) % 1.0, 0.333) * nuclScale;
                    const localX = rBase * dirX;
                    const localY = rBase * dirY;
                    const localZ = rBase * dirZ;
                    const vib = Math.sin(time * 50.0 + localY) * Math.cos(time * 40.0 + localX) * instability * 0.05;
                    const pulseExp = 1.0 + tPulse * (0.3 + vib);
                    let px = localX * pulseExp;
                    let py = localY * pulseExp;
                    let pz = localZ * pulseExp;
                    const side = px >= 0 ? 1.0 : -1.0;
                    const centerShift = side * tStretch * nuclScale * 0.85;
                    const neck = Math.max(0, 1.0 - Math.abs(px) / (nuclScale * 1.2));
                    py -= py * neck * tStretch * 0.75;
                    pz -= pz * neck * tStretch * 0.75;
                    let rotX = px;
                    let rotY = py;
                    if (tSplit > 0) {
                        const spin = tSplit * 6.0 * side;
                        const cosS = Math.cos(spin);
                        const sinS = Math.sin(spin);
                        rotX = px * cosS - py * sinS;
                        rotY = px * sinS + py * cosS;
                    }
                    const sepAmount = tSplit * yieldForce * side;
                    posX = rotX + centerShift + sepAmount;
                    posY = rotY;
                    posZ = pz;
                    const heat = tSplit * instability * 2.0;
                    posX += dirX * heat;
                    posY += dirY * heat;
                    posZ += dirZ * heat;
                    let h = 0.28 - tStretch * 0.15 - tSplit * 0.25;
                    hue = (h % 1.0 + 1.0) % 1.0;
                    lig = 0.4 + tPulse * 0.4 + tStretch * 0.2 - Math.min(0.3, tSplit * 0.2);
                } else if (u < 0.85) {
                    if (cycle < 0.42) { lig = 0.0; } else {
                        const flashT = cycle - 0.42;
                        const nSpeed = yieldForce * 3.5;
                        const dist = flashT * nSpeed;
                        const scatterX = dirX + Math.sin(i * 11.1) * 0.5;
                        const scatterY = dirY + Math.cos(i * 13.3) * 0.5;
                        const scatterZ = dirZ + Math.sin(i * 17.7) * 0.5;
                        posX = scatterX * dist; posY = scatterY * dist; posZ = scatterZ * dist;
                        hue = 0.55; sat = 0.8; lig = Math.max(0, 0.9 - flashT * 1.5);
                    }
                } else {
                    if (cycle < 0.42) { lig = 0.0; } else {
                        const flashT = cycle - 0.42;
                        const rWave = Math.pow(flashT * 2.5, 0.4) * yieldForce * 1.5;
                        const noise = Math.sin(i * 12.3 + time * 15.0) * instability * 8.0;
                        const spread = rWave + noise;
                        posX = dirX * spread; posY = dirY * spread; posZ = dirZ * spread;
                        hue = 0.65 - flashT * 0.4; sat = Math.max(0, 1.0 - flashT); lig = Math.max(0, 1.0 - flashT * 2.5);
                    }
                }

                lig *= tFade;
                target.set(posX, posY, posZ);
                color.setHSL(hue, sat, lig);

                positions[i].lerp(target, 0.1);
                dummy.position.copy(positions[i]);
                dummy.updateMatrix();
                instancedMesh.setMatrixAt(i, dummy.matrix);
                instancedMesh.setColorAt(i, color);
            }
            instancedMesh.instanceMatrix.needsUpdate = true;
            if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

            composer.render();
        }
        animate();

        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            composer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(requestRef.current);
            window.removeEventListener('resize', handleResize);
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            // Dispose Three.js objects
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, [onFinish]);

    return <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

export default FissionSwarm;
