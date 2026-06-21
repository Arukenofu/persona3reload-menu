<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Howl } from 'howler'
import { musicNames } from '@/.generated/music-names'

const TRACK_NAMES = Object.keys(musicNames)
const TRACK_PATHS = Object.values(musicNames)

const props = defineProps<{
  enabled: boolean
}>()

const currentTrackIndex = ref(0)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

let howl: Howl | undefined
let updateInterval: ReturnType<typeof setInterval> | undefined

const trackName = computed(() => TRACK_NAMES[currentTrackIndex.value])

const formattedTime = computed(() => {
  const mins = Math.floor(currentTime.value / 60)
  const secs = Math.floor(currentTime.value % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

const formattedDuration = computed(() => {
  const mins = Math.floor(duration.value / 60)
  const secs = Math.floor(duration.value % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

const progressPercent = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

function loadTrack(index: number) {
  stopUpdating()
  howl?.unload()

  howl = new Howl({
    src: TRACK_PATHS[index],
    volume: 0.15,
    onload() {
      duration.value = howl!.duration()
    },
    onend() {
      nextTrack()
    },
  })

  currentTime.value = 0
  duration.value = 0

  if (isPlaying.value) {
    howl.play()
    startUpdating()
  }
}

function togglePlay() {
  if (!howl) return

  if (isPlaying.value) {
    howl.pause()
    stopUpdating()
  } else {
    howl.play()
    startUpdating()
  }
  isPlaying.value = !isPlaying.value
}

function nextTrack() {
  currentTrackIndex.value = (currentTrackIndex.value + 1) % TRACK_NAMES.length
  loadTrack(currentTrackIndex.value)
}

function prevTrack() {
  if (currentTime.value > 3) {
    howl?.seek(0)
    currentTime.value = 0
    return
  }
  currentTrackIndex.value = (currentTrackIndex.value - 1 + TRACK_NAMES.length) % TRACK_NAMES.length
  loadTrack(currentTrackIndex.value)
}

function startUpdating() {
  stopUpdating()
  updateInterval = setInterval(() => {
    if (howl && isPlaying.value) {
      currentTime.value = howl.seek() as number
    }
  }, 250)
}

function stopUpdating() {
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = undefined
  }
}

watch(() => props.enabled, (enabled) => {
  if (enabled) {
    loadTrack(currentTrackIndex.value)
    isPlaying.value = true
    howl?.play()
    startUpdating()
  } else {
    howl?.pause()
    isPlaying.value = false
    stopUpdating()
  }
})

onMounted(() => {
  if (props.enabled) {
    loadTrack(currentTrackIndex.value)
    isPlaying.value = true
    howl?.play()
    startUpdating()
  }
})

onUnmounted(() => {
  stopUpdating()
  howl?.unload()
})
</script>

<template>
  <div :class="classes.wrapper">
    <div :class="classes.deviceRow">
      <div :class="classes.ring" />
      <div :class="classes.clip" />
      <div :class="classes.device">
        <div :class="classes.groove" />

        <div :class="classes.screen">
          <div :class="classes.trackName">{{ trackName }}</div>
          <div :class="classes.progressBar">
            <div :class="classes.progressFill" :style="{ width: progressPercent + '%' }" />
          </div>
          <div :class="classes.meta">
            <span>▶ {{ formattedTime }} / {{ formattedDuration }}</span>
            <span>{{ String(currentTrackIndex + 1).padStart(2, '0') }}/{{ String(TRACK_NAMES.length).padStart(2, '0') }}</span>
          </div>
        </div>

        <div :class="classes.groove" />

        <div :class="classes.brand">PERSONA 3 RELOAD</div>
      </div>
    </div>

    <div :class="classes.controls">
      <button :class="classes.btn" @click="prevTrack">
        <iconify-icon icon="mdi:skip-previous" width="16" />
      </button>
      <button :class="classes.btn" @click="togglePlay">
        <iconify-icon :icon="isPlaying ? 'mdi:pause' : 'mdi:play'" width="16" />
      </button>
      <button :class="classes.btn" @click="nextTrack">
        <iconify-icon icon="mdi:skip-next" width="16" />
      </button>
    </div>
  </div>
</template>

<style module="classes">
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  user-select: none;
}

.deviceRow {
  display: flex;
  align-items: center;
}

.ring {
  width: 12px;
  height: 12px;
  border: 2.5px solid #1a1a1a;
  border-radius: 50%;
  margin-right: -1px;
  position: relative;
  z-index: 2;
}

.clip {
  width: 14px;
  height: 22px;
  background: #1a1a1a;
  border-radius: 2px;
  margin-right: -1px;
  position: relative;
  z-index: 1;
}

.device {
  display: flex;
  align-items: center;
  height: 48px;
  background: #fff;
  border: 3px solid #1a1a1a;
  border-radius: 8px 24px 24px 8px;
  padding: 0 4px 0 6px;
  gap: 0;
}

.groove {
  width: 2px;
  height: 34px;
  background: #ccc;
  flex-shrink: 0;
  border-radius: 1px;
}

.screen {
  width: 150px;
  height: 34px;
  flex-shrink: 0;
  margin: 0 6px;
  background: linear-gradient(180deg, #b8d8f0 0%, #8ec0e8 100%);
  border: 2px solid #2a2a2a;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 3px 8px;
}

.trackName {
  font-family: 'Courier New', monospace;
  font-size: 10px;
  font-weight: bold;
  color: #0a1e3c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.progressBar {
  width: 100%;
  height: 2px;
  background: rgba(0, 0, 0, 0.12);
  border-radius: 1px;
  overflow: hidden;
}

.progressFill {
  height: 100%;
  background: #0a1e3c;
  transition: width 0.25s linear;
}

.meta {
  display: flex;
  justify-content: space-between;
  font-family: 'Courier New', monospace;
  font-size: 7.5px;
  color: #1a3050;
  line-height: 1;
}

.brand {
  font-family: system-ui, sans-serif;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.12em;
  color: #1a1a1a;
  white-space: nowrap;
  padding: 0 14px 0 8px;
}

.controls {
  display: flex;
  gap: 0.375rem;
  margin-right: 0.5rem;
}

.btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.25);
  background: rgba(3, 31, 100, 0.5);
  color: var(--color-fg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: background 100ms;
  box-shadow: var(--shadow-under);
}

.btn:hover {
  background: rgba(3, 31, 100, 0.8);
  border-color: rgba(255, 255, 255, 0.5);
}

.btn:active {
  background: rgba(3, 31, 100, 1);
}
</style>
