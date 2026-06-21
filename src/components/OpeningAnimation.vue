<script setup lang="ts">
import { ref, onMounted } from 'vue'

const FRAME_TIME = 3 / 60 * 1000
const FRAME_COUNT = 10

const frames = Array.from({ length: FRAME_COUNT }, (_, i) =>
  `/textures/ui_menu_opening/frame_${i + 1}.png`
)

const currentFrame = ref(-1)
const isPlaying = ref(false)

let preloadPromise: Promise<void> | undefined

function preloadImages(): Promise<void> {
  if (!preloadPromise) {
    preloadPromise = Promise.all(
      frames.map(src => new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => resolve()
        img.src = src
      }))
    ).then(() => {})
  }
  return preloadPromise
}

async function play() {
  await preloadImages()
  isPlaying.value = true

  for (let i = 0; i < FRAME_COUNT; i++) {
    currentFrame.value = i
    await new Promise(r => setTimeout(r, FRAME_TIME))
  }

  currentFrame.value = -1
  isPlaying.value = false
}

onMounted(() => {
  preloadImages()
})

defineExpose({ play })
</script>

<template>
  <div v-if="isPlaying" :class="classes.container">
    <img
      v-for="(src, i) in frames"
      :key="i"
      :src="src"
      :class="classes.frame"
      :style="{ display: currentFrame === i ? 'block' : 'none' }"
    >
  </div>
</template>

<style module="classes">
.container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 30;
  pointer-events: none;
}

.frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  object-fit: cover;
}
</style>
