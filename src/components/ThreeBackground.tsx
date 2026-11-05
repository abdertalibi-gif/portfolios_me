import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement("canvas").getContext("webgl2");
      if (!gl) return true;
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Group for objects
    const group = new THREE.Group();
    scene.add(group);

    // Create floating objects
    const createObject = (color: number) => {
      const geometry = new THREE.IcosahedronGeometry(Math.random() * 2, 0);
      const material = new THREE.MeshPhongMaterial({
        color: color,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      mesh.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      );
      
      mesh.userData = {
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
      };
      
      return mesh;
    };

    const objects: THREE.Mesh[] = [];
    const colors = [0x0F7DB8, 0xF28C28]; // Primary Blue and Accent Orange
    
    for (let i = 0; i < 20; i++) {
      const obj = createObject(colors[i % colors.length]);
      group.add(obj);
      objects.push(obj);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x0F7DB8, 1);
    pointLight1.position.set(20, 20, 20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xF28C28, 0.5);
    pointLight2.position.set(-20, -20, 20);
    scene.add(pointLight2);

    // Particles/Stars - subtler for light mode
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 400;
    const posArray = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 200;
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    const starsMaterial = new THREE.PointsMaterial({
      size: 0.2,
      color: 0x0F7DB8,
      transparent: true,
      opacity: 0.15,
    });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    let frameId: number;
    const animate = () => {
      objects.forEach((obj) => {
        obj.rotation.x += obj.userData.rotationSpeed;
        obj.rotation.y += obj.userData.rotationSpeed;
        obj.position.add(obj.userData.velocity);

        // Boundary check
        if (Math.abs(obj.position.x) > 50) obj.userData.velocity.x *= -1;
        if (Math.abs(obj.position.y) > 50) obj.userData.velocity.y *= -1;
        if (Math.abs(obj.position.z) > 50) obj.userData.velocity.z *= -1;
      });

      group.rotation.y += 0.001;
      starField.rotation.y -= 0.0005;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      // Cleanup Three.js resources
      scene.clear();
      renderer.dispose();
      objects.forEach((obj) => {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      });
      starsGeometry.dispose();
      starsMaterial.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[-1] pointer-events-none opacity-40"
    />
  );
}
