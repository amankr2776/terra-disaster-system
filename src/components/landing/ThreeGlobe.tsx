"use client"

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeGlobe() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // 1. Scene Setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)

    // 2. Earth Globe
    const loader = new THREE.TextureLoader()
    const earthGeometry = new THREE.SphereGeometry(2, 64, 64)
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'),
      bumpScale: 0.05,
      specular: new THREE.Color('grey'),
      shininess: 10
    })
    const earth = new THREE.Mesh(earthGeometry, earthMaterial)
    scene.add(earth)

    // NEW: Wireframe Sphere (aesthetic surveillance grid)
    const wireGeo = new THREE.SphereGeometry(2.08, 32, 32)
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      opacity: 0.04,
      transparent: true,
      wireframe: true
    })
    const wireframe = new THREE.Mesh(wireGeo, wireMat)
    scene.add(wireframe)

    // 3. Atmosphere Glow
    const atmosGeometry = new THREE.SphereGeometry(2.1, 64, 64)
    const atmosMaterial = new THREE.MeshBasicMaterial({
      color: 0x0044ff,
      opacity: 0.13, // Increased from 0.08 for better visual punch
      transparent: true,
      side: THREE.BackSide
    })
    const atmosphere = new THREE.Mesh(atmosGeometry, atmosMaterial)
    scene.add(atmosphere)

    // 4. Disaster Pulse Points
    const cities = [
      { name: 'Mumbai', lat: 19.07, lon: 72.87 },
      { name: 'Chennai', lat: 13.08, lon: 80.27 },
      { name: 'Kolkata', lat: 22.57, lon: 88.36 },
      { name: 'Delhi', lat: 28.61, lon: 77.21 },
      { name: 'Dhaka', lat: 23.81, lon: 90.41 },
      { name: 'Karachi', lat: 24.86, lon: 67.01 }
    ]

    const pulsePoints: THREE.Mesh[] = []
    const rings: THREE.Mesh[] = []
    
    const latLonToVector3 = (lat: number, lon: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lon + 180) * (Math.PI / 180)
      const x = -(radius * Math.sin(phi) * Math.cos(theta))
      const z = (radius * Math.sin(phi) * Math.sin(theta))
      const y = (radius * Math.cos(phi))
      return new THREE.Vector3(x, y, z)
    }

    cities.forEach(city => {
      const pos = latLonToVector3(city.lat, city.lon, 2)
      
      // Core Point
      const pointGeo = new THREE.SphereGeometry(0.03, 16, 16)
      const pointMat = new THREE.MeshStandardMaterial({ 
        color: 0xff3b30, 
        emissive: 0xff3b30, 
        emissiveIntensity: 2 
      })
      const point = new THREE.Mesh(pointGeo, pointMat)
      point.position.copy(pos)
      earth.add(point)
      pulsePoints.push(point)

      // Expanding Ring (Individual Material for fading)
      const ringGeo = new THREE.RingGeometry(0.03, 0.05, 16)
      const ringMat = new THREE.MeshBasicMaterial({ 
        color: 0xff3b30, 
        transparent: true, 
        opacity: 0.4,
        side: THREE.DoubleSide
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.position.copy(pos.clone().multiplyScalar(1.01))
      ring.lookAt(pos.clone().multiplyScalar(2))
      earth.add(ring)
      rings.push(ring)
    })

    // 5. Arc Line between Mumbai & Chennai
    const p1 = latLonToVector3(19.07, 72.87, 2)
    const p2 = latLonToVector3(13.08, 80.27, 2)
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5).normalize().multiplyScalar(2.4)
    const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2)
    const curveGeo = new THREE.TubeGeometry(curve, 32, 0.005, 8, false)
    const curveMat = new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.5 })
    const arc = new THREE.Mesh(curveGeo, curveMat)
    earth.add(arc)

    // 6. Particle Field
    const particlesGeo = new THREE.BufferGeometry()
    const particlesCount = 3500 // Increased from 2000 for denser data look
    const posArray = new Float32Array(particlesCount * 3)
    const colorsArray = new Float32Array(particlesCount * 3)

    const color1 = new THREE.Color(0xffffff) // White
    const color2 = new THREE.Color(0x00ffff) // Cyan

    for (let i = 0; i < particlesCount; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * 15
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 15
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 15

      // 70% white, 30% cyan mix
      const color = Math.random() > 0.3 ? color1 : color2
      colorsArray[i * 3] = color.r
      colorsArray[i * 3 + 1] = color.g
      colorsArray[i * 3 + 2] = color.b
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3))
    const particlesMat = new THREE.PointsMaterial({
      size: 0.005,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    })
    const particleSystem = new THREE.Points(particlesGeo, particlesMat)
    scene.add(particleSystem)

    // 7. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)
    
    // Key Light
    const light1 = new THREE.PointLight(0xffffff, 1.2)
    light1.position.set(5, 3, 5)
    scene.add(light1)

    // Sub-Blue Shadow Light
    const light2 = new THREE.PointLight(0x0044ff, 0.4)
    light2.position.set(-4, -2, -3)
    scene.add(light2)

    camera.position.z = 5

    // 8. Animation Loop
    let time = 0
    const animate = () => {
      requestAnimationFrame(animate)
      time += 0.01

      // Movement & Wobble
      earth.rotation.y += 0.0015 // Faster rotation
      earth.rotation.z = Math.sin(time * 0.3) * 0.08 // Tilt wobble
      wireframe.rotation.y -= 0.0008 // Counter-rotation
      particleSystem.rotation.y += 0.0005 // Faster particle drift
      
      // Pulse Points
      pulsePoints.forEach(p => {
        const s = Math.sin(time * 4) * 0.6 + 1 // Faster pulse rate
        p.scale.set(s, s, s)
      })

      // Expanding Rings Animation
      rings.forEach((r, i) => {
        const t = (time * 0.5 + i * 0.1) % 1 // Cycles over ~2 seconds
        const s = 1 + t * 4
        r.scale.set(s, s, 1)
        if (r.material instanceof THREE.MeshBasicMaterial) {
          r.material.opacity = 0.4 * (1 - t)
        }
      })

      // Camera Orbit - Cinematic drifting movement
      camera.position.x = Math.sin(time * 0.07) * 5.2
      camera.position.z = Math.cos(time * 0.07) * 5.2
      camera.position.y = Math.sin(time * 0.04) * 0.6
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }

    animate()

    // 9. Resize Handling
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={containerRef} className="fixed inset-0 z-0 bg-black" />
}
