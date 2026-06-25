"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const material = new THREE.MeshPhongMaterial({
      color: 0x8b5cf6,
      emissive: 0x4c1d95,
      specular: 0xffffff,
      shininess: 100,
      transparent: true,
      opacity: 0.8,
      flatShading: true,
    });

    const geometry = new THREE.IcosahedronGeometry(1.5, 0);
    const core = new THREE.Mesh(geometry, material);
    group.add(core);

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const shellGeometry = new THREE.IcosahedronGeometry(1.8, 1);
    const shell = new THREE.Mesh(shellGeometry, wireframeMaterial);
    group.add(shell);

    const pointGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0x22d3ee });

    for (let i = 0; i < 20; i++) {
      const point = new THREE.Mesh(pointGeometry, pointMaterial);
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.5 + Math.random() * 0.5;
      point.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 2.0,
        Math.sin(angle) * radius
      );
      group.add(point);
    }

    const light = new THREE.PointLight(0xffffff, 1.5, 100);
    light.position.set(5, 5, 5);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    camera.position.z = 5;

    let animationFrameId: number;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      group.rotation.y += 0.005;
      group.rotation.x += 0.002;
      renderer.render(scene, camera);
    }
    animate();

    function handleResize() {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      shellGeometry.dispose();
      wireframeMaterial.dispose();
      pointGeometry.dispose();
      pointMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
}
