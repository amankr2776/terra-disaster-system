
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

    // 3. Atmosphere Glow
    const atmosGeometry = new THREE.SphereGeometry(2.1, 64, 64)
    const atmosMaterial = new THREE.MeshBasicMaterial({
      color: 0x0044ff,
      opacity: 0.1,
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
    
    const latLonToVector3 = (lat: number, lon: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lon + 180) * (Math.PI / 180)
      const x = -(radius * Math.sin(phi) * Math.cos(theta))
      const z = (radius * Math.sin(phi) * Math.sin(theta))
      const y = (radius * Math.cos(phi))
      return new THREE.Vector3(x, y, z)
    }

    cities.forEach(city => {
      const pointGeo = new THREE.SphereGeometry(0.03, 16, 16)
      const pointMat = new THREE.MeshStandardMaterial({ 
        color: 0xff3b30, 
        emissive: 0xff3b30, 
        emissiveIntensity: 2 
      })
      const point = new THREE.Mesh(pointGeo, pointMat)
      const pos = latLonToVector3(city.lat, city.lon, 2)
      point.position.copy(pos)
      earth.add(point)
      pulsePoints.push(point)
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
    const particlesCount = 2000
    const posArray = new Float32Array(particlesCount * 3)

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    const particlesMat = new THREE.PointsMaterial({
      size: 0.005,
      color: 0x45AFDB,
      transparent: true,
      opacity: 0.8
    })
    const particleSystem = new THREE.Points(particlesGeo, particlesMat)
    scene.add(particleSystem)

    // 7. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)
    const pointLight = new THREE.PointLight(0xffffff, 1)
    pointLight.position.set(5, 5, 5)
    scene.add(pointLight)

    camera.position.z = 5

    // 8. Animation Loop
    let time = 0
    const animate = () => {
      requestAnimationFrame(animate)
      time += 0.01

      earth.rotation.y += 0.001
      particleSystem.rotation.y += 0.0003
      
      pulsePoints.forEach(p => {
        const s = Math.sin(time * 3) * 0.5 + 1.2
        p.scale.set(s, s, s)
      })

      camera.position.x = Math.sin(time * 0.1) * 6
      camera.position.z = Math.cos(time * 0.1) * 6
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
