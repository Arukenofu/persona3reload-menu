<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { WebGLRenderer, OrthographicCamera, PlaneGeometry, Clock } from 'three'
import { createPipeline } from '@/rendering/pipeline'
import { createCharacter, type CharacterController } from '@/rendering/character'

const canvasRef = ref<HTMLCanvasElement>()
const RENDER_SCALE = 0.5

let character: CharacterController | undefined
let characterVisible = false
let whiteEnabled = false

async function setup() {
  const canvas = canvasRef.value!
  const w = window.innerWidth
  const h = window.innerHeight

  const dpr = window.devicePixelRatio
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false })
  renderer.setPixelRatio(dpr)
  renderer.setSize(w, h)
  renderer.autoClear = false

  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const geometry = new PlaneGeometry(2, 2)

  const pipeline = createPipeline(renderer, camera, geometry, w, h, RENDER_SCALE)
  const charController = await createCharacter(pipeline.finalTarget.texture, w * dpr, h * dpr)
  character = charController

  const clock = new Clock()
  const startTime = performance.now()
  let animationId: number

  function render() {
    const elapsed = (performance.now() - startTime) / 1000
    const delta = clock.getDelta()

    pipeline.render(elapsed)
    pipeline.renderToScreen(whiteEnabled)

    if (characterVisible) {
      charController.update(delta)
      charController.render(renderer)
    }

    animationId = requestAnimationFrame(render)
  }

  function onResize() {
    const nw = window.innerWidth
    const nh = window.innerHeight
    renderer.setSize(nw, nh)
    pipeline.resize(nw, nh, RENDER_SCALE)
    charController.resize(nw * dpr, nh * dpr)
  }

  window.addEventListener('resize', onResize)
  animationId = requestAnimationFrame(render)

  return () => {
    window.removeEventListener('resize', onResize)
    cancelAnimationFrame(animationId)
    pipeline.dispose()
    charController.dispose()
    geometry.dispose()
    renderer.dispose()
  }
}

function showCharacter() {
  characterVisible = true
  whiteEnabled = true
  character?.playEntrance()
}

let cleanup: (() => void) | undefined

onMounted(async () => {
  cleanup = await setup()
})

onUnmounted(() => {
  cleanup?.()
})

defineExpose({ showCharacter })
</script>

<template>
  <canvas ref="canvasRef" :class="classes.canvas" />
</template>

<style module="classes">
.canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -10;
}
</style>
