import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const canvas = document.createElement('canvas')
canvas.width = 650
canvas.height = 650

window.addEventListener('load', init)

function init() {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, canvas.width / canvas.height, 0.1, 100)
  camera.position.z = 2.5

  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(canvas.width, canvas.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  document.body.append(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.125
  controls.update()

  window.addEventListener('resize', () => {
    camera.aspect = canvas.width / canvas.height
    camera.updateProjectionMatrix()
    renderer.setSize(canvas.width, canvas.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  })

  const shaderGeo = new THREE.BoxBufferGeometry(1, 1, 1, 128, 128, 128)

  const shaderMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uElevation: { value: 0.2 },
      uFrequency: { value: new THREE.Vector2(10, 5) },
      uVelocity: { value: 0.725 }
    },
    vertexShader: `
    uniform float uTime;
    uniform float uElevation;
    uniform vec2 uFrequency;
    uniform float uVelocity;
    varying vec2 vUv;

    void main() {
      vec4 modelPos = modelMatrix * vec4(position, 1.0);
      float elevation = sin(modelPos.x * uFrequency.x + uTime * uVelocity) * sin(modelPos.z * uFrequency.y + uTime * uVelocity) * uElevation;
      modelPos.y += elevation;


      vec4 viewPos = viewMatrix * modelPos;
      vec4 projectionPos = projectionMatrix * viewPos;
      gl_Position = projectionPos;

      vUv = uv;
    }`,
    fragmentShader: `
    varying vec2 vUv;
    void main() {
;      gl_FragColor = vec4(vUv, 1.0, 1.0);
    }
      `,
    wireframe: true,
  })

  const shader = new THREE.Mesh(shaderGeo, shaderMat)
  shader.rotation.z = -Math.PI / 2


  scene.add(shader)

  const clock = new THREE.Clock()
  const animate = () => {
    const elapsedTime = clock.getElapsedTime()

    shaderMat.uniforms.uTime.value = elapsedTime
    controls.update()

    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()
}