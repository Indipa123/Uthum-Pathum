<script setup>
import * as THREE from 'three'

const surface = ref(null)
let cleanup

onMounted(() => {
  if (!surface.value || matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const host = surface.value
  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
  } catch {
    return
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65))
  renderer.setClearColor(0x000000, 0)
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 35)
  camera.position.z = 9
  const group = new THREE.Group()
  scene.add(group, new THREE.AmbientLight(0xffd7df, 2.05))
  const light = new THREE.DirectionalLight(0xfff7e8, 3)
  light.position.set(-4, 4, 5)
  scene.add(light)

  const heart = new THREE.Shape()
  heart.moveTo(0, -0.65)
  heart.bezierCurveTo(-0.12, -0.49, -0.87, -0.02, -0.83, 0.42)
  heart.bezierCurveTo(-0.77, 0.91, -0.22, 0.86, 0, 0.5)
  heart.bezierCurveTo(0.22, 0.86, 0.77, 0.91, 0.83, 0.42)
  heart.bezierCurveTo(0.87, -0.02, 0.12, -0.49, 0, -0.65)
  const heartGeometry = new THREE.ExtrudeGeometry(heart, { depth: 0.08, bevelEnabled: true, bevelSize: 0.055, bevelThickness: 0.035, bevelSegments: 3, curveSegments: 10 })
  const star = new THREE.Shape()
  star.moveTo(0, 1)
  star.quadraticCurveTo(0.14, 0.15, 0.75, 0)
  star.quadraticCurveTo(0.14, -0.15, 0, -1)
  star.quadraticCurveTo(-0.14, -0.15, -0.75, 0)
  star.quadraticCurveTo(-0.14, 0.15, 0, 1)
  const starGeometry = new THREE.ExtrudeGeometry(star, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 2, curveSegments: 6 })
  const shell = new THREE.MeshStandardMaterial({ color: 0xed9cac, roughness: 0.38, metalness: 0.24 })
  const gold = new THREE.MeshStandardMaterial({ color: 0xffd5ad, roughness: 0.36, metalness: 0.18 })
  const specifications = [[-0.79, 1.68, 0.21, true], [1.69, -1.05, 0.28, true], [-1.85, -0.51, 0.23, false], [1.6, 1.4, 0.18, false], [-0.38, -1.67, 0.11, false]]
  const pieces = specifications.map(([x, y, scale, isHeart], index) => {
    const mesh = new THREE.Mesh(isHeart ? heartGeometry : starGeometry, isHeart ? shell : gold)
    mesh.scale.setScalar(scale)
    mesh.position.set(x, y, 0.35)
    group.add(mesh)
    return { mesh, x, y, index }
  })

  const target = { x: 0, y: 0 }
  const track = event => {
    const bounds = host.getBoundingClientRect()
    target.x = (event.clientX - bounds.left) / bounds.width - 0.5
    target.y = (event.clientY - bounds.top) / bounds.height - 0.5
  }
  const reset = () => { target.x = 0; target.y = 0 }
  host.parentElement.addEventListener('pointermove', track)
  host.parentElement.addEventListener('pointerleave', reset)

  const resize = new ResizeObserver(() => {
    const { clientWidth: width, clientHeight: height } = host
    if (!width || !height) return
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  })
  resize.observe(host)
  let inView = true
  const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting })
  observer.observe(host)

  renderer.setAnimationLoop(millis => {
    if (!inView || document.hidden) return
    const t = millis / 1000
    group.rotation.x += (target.y * 0.3 - group.rotation.x) * 0.04
    group.rotation.y += (target.x * 0.4 - group.rotation.y) * 0.04
    for (const { mesh, x, y, index } of pieces) {
      mesh.position.x = x + Math.sin(t * 0.8 + index) * 0.10
      mesh.position.y = y + Math.sin(t * 1.15 + index) * 0.12
      mesh.rotation.y = t * 0.45 + index * 0.8
      mesh.rotation.z = Math.sin(t * 0.7 + index) * 0.3
    }
    renderer.render(scene, camera)
  })

  cleanup = () => {
    observer.disconnect()
    resize.disconnect()
    host.parentElement?.removeEventListener('pointermove', track)
    host.parentElement?.removeEventListener('pointerleave', reset)
    renderer.setAnimationLoop(null)
    renderer.dispose()
    renderer.domElement.remove()
    heartGeometry.dispose()
    starGeometry.dispose()
    shell.dispose()
    gold.dispose()
  }
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <div ref="surface" class="hero-scene" aria-hidden="true" />
</template>
