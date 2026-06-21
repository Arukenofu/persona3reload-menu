<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { animate } from 'animejs'
import { useAudio } from '@/composables/useAudio'
import { musicNames } from '@/.generated/music-names'
import type { OptionValue } from '@/types'
import Option from '@/components/Option.vue'
import Control from '@/components/Control.vue'
import SettingsOption from '@/components/SettingsOption.vue'
import LanguageToggle from '@/components/LanguageToggle.vue'
import ShaderBackground from '@/components/ShaderBackground.vue'
import OpeningAnimation from '@/components/OpeningAnimation.vue'
import MusicPlayer from '@/components/MusicPlayer.vue'

const openingFrames = Array.from({ length: 10 }, (_, i) => {
  const n = i + 1
  const paths = [`/textures/ui_menu_opening/frame_${n}.png`]
  if (n <= 5) paths.push(`/textures/ui_menu_opening/frame_${n}_mask.png`)
  return paths
}).flat()

function preload(href: string, as: string) {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = as
  link.href = href
  document.head.appendChild(link)
}

preload(Object.values(musicNames)[0], 'audio')
for (const src of openingFrames) {
  preload(src, 'image')
}

const { t, locale } = useI18n()

const options: OptionValue[] = [
  { nameKey: 'menu.skill', descriptionKey: 'description.skill', rotation: -25, zIndex: 1, offsetX: -60, offsetY: 55 },
  { nameKey: 'menu.item', descriptionKey: 'description.item', rotation: -15, zIndex: 0, offsetX: 0, offsetY: 30 },
  { nameKey: 'menu.equip', descriptionKey: 'description.equip', rotation: -20, zIndex: 1, offsetX: -50, offsetY: 35 },
  { nameKey: 'menu.persona', descriptionKey: 'description.persona', rotation: -15, zIndex: 2, offsetX: -80, offsetY: 40 },
  { nameKey: 'menu.stats', descriptionKey: 'description.stats', rotation: -7.5, zIndex: 0, offsetX: 0, offsetY: 15 },
  { nameKey: 'menu.quest', descriptionKey: 'description.quest', rotation: -14, zIndex: 1, offsetX: -40, offsetY: 20 },
  { nameKey: 'menu.socialLink', descriptionKey: 'description.socialLink', rotation: -8, zIndex: 2, offsetX: -20, offsetY: 20 },
  { nameKey: 'menu.calendar', descriptionKey: 'description.calendar', rotation: -5, zIndex: 1, offsetX: -60, offsetY: 10 },
  { nameKey: 'menu.system', descriptionKey: 'description.system', rotation: 8, zIndex: 0, offsetX: 0, offsetY: 0 },
]

const settingsHighlightEl = ref<HTMLDivElement>()
const openingAnimationRef = ref<InstanceType<typeof OpeningAnimation>>()
const shaderBackgroundRef = ref<InstanceType<typeof ShaderBackground>>()

const isStarted = ref(false)
const isOpening = ref(false)
const selectedIndex = ref(0)
const currentSettingIndex = ref(0)

const isMusicEnabled = ref(localStorage.getItem('musicEnabled') !== 'false')
const isSFXEnabled = ref(localStorage.getItem('sfxEnabled') !== 'false')

const savedLocale = localStorage.getItem('locale')
if (savedLocale === 'en' || savedLocale === 'ru') {
  locale.value = savedLocale
}

watch(isMusicEnabled, (v) => localStorage.setItem('musicEnabled', String(v)))
watch(isSFXEnabled, (v) => localStorage.setItem('sfxEnabled', String(v)))
watch(locale, (v) => localStorage.setItem('locale', v))

const { playNavigation } = useAudio(isSFXEnabled)

function setIndex(index: number) {
  if (index === selectedIndex.value) return
  selectedIndex.value = index
  playNavigation()
}

function setSettingsIndex(index: number) {
  if (index === currentSettingIndex.value) return
  currentSettingIndex.value = index
  animate(settingsHighlightEl.value!, {
    translateY: index * 56,
    duration: 100,
    easing: 'easeOutQuad',
  })
}

async function start() {
  if (isOpening.value) return
  isOpening.value = true

  await openingAnimationRef.value?.play()
  isStarted.value = true
  shaderBackgroundRef.value?.showCharacter()
}

function handleKeydown(e: KeyboardEvent) {
  if (!isStarted.value) return

  if (e.key === 'ArrowDown' || e.key === 's') {
    setIndex((selectedIndex.value + 1) % options.length)
  } else if (e.key === 'ArrowUp' || e.key === 'w') {
    setIndex((selectedIndex.value - 1 + options.length) % options.length)
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <main :class="classes.main">
    <OpeningAnimation ref="openingAnimationRef" />

    <Transition name="fade">
      <div v-if="!isStarted && !isOpening" :class="classes.startOverlay">
        <div :class="classes.titleWrapper">
          <h1 :class="classes.title">
            {{ t('start.title') }}<br>
            {{ t('start.subtitle') }}
          </h1>
          <h2 :class="classes.subtitle">
            <span>{{ t('start.recreated') }}</span>
            <hr :class="classes.dividerLine">
            <a href="https://github.com/Arukenofu">By dotenv</a>
          </h2>

          <h2 :class="classes.subtitle">
            <span>{{ t('start.inspired') }} #1</span>
            <hr :class="classes.dividerLine">
            <a href="https://github.com/deltea">deltea</a>
          </h2>

          <h2 :class="classes.subtitle">
            <span>{{ t('start.inspired') }} #2</span>
            <hr :class="classes.dividerLine">
            <a href="https://github.com/Ultipuk/persona_3_reload_pause_menu/tree/main">Ultipuk</a>
          </h2>
        </div>

        <div :class="classes.settingsWrapper">
          <SettingsOption
            :is-selected="currentSettingIndex === 0"
            v-model="isMusicEnabled"
            @select="setSettingsIndex(0)"
          >
            {{ t('settings.music') }}
          </SettingsOption>
          <SettingsOption
            :is-selected="currentSettingIndex === 1"
            v-model="isSFXEnabled"
            @select="setSettingsIndex(1)"
          >
            {{ t('settings.sfx') }}
          </SettingsOption>
          <LanguageToggle
            :is-selected="currentSettingIndex === 2"
            @select="setSettingsIndex(2)"
          />

          <div
            ref="settingsHighlightEl"
            :class="classes.settingsHighlight"
          />
        </div>

        <button :class="classes.enterButton" @click="start">
          <span :class="classes.enterText">{{ t('start.enter') }}</span>
          <iconify-icon icon="mdi:arrow-right-bold" />
        </button>
      </div>
    </Transition>

    <ShaderBackground ref="shaderBackgroundRef" />

    <div :class="classes.optionsContainer">
      <Option
        v-for="(option, i) in options"
        :key="option.nameKey"
        :index="i"
        :is-selected="selectedIndex === i"
        :option="option"
        @select="setIndex(i)"
      />
    </div>

    <div :class="classes.controlsSection">
      <p :class="classes.description">
        {{ t(options[selectedIndex].descriptionKey) }}
      </p>

      <div :class="classes.commandLabel">
        <span>{{ t('controls.command') }}</span>
        <hr :class="classes.dividerLine">
      </div>

      <div :class="classes.controlButtons">
        <Control key-label="B">{{ t('controls.confirm') }}</Control>
        <Control key-label="A">{{ t('controls.close') }}</Control>
      </div>
    </div>

    <div
      :class="classes.sideText"
      style="left: -4.5rem; top: -18rem; font-size: 37vh;"
    >
      <span :class="classes.sideTextInner">0{{ selectedIndex + 1 }}</span>
    </div>

    <Transition name="fade">
      <div v-if="isStarted" :class="classes.playerWrapper">
        <MusicPlayer :enabled="isMusicEnabled && isStarted" />
      </div>
    </Transition>
  </main>
</template>

<style module="classes">
.main {
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
}

.startOverlay {
  position: fixed;
  background-color: rgba(1, 95, 204, 0.9);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8rem;
  justify-content: center;
  align-items: center;
  z-index: 20;
}

.titleWrapper {
  transform: rotate(3deg);
}

.titleWrapper > * + * {
  margin-top: 0.5rem;
}

.title {
  background-color: var(--color-fg);
  color: var(--color-bg);
  padding: 1rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 3.75rem;
  line-height: 1;
  letter-spacing: -0.08em;
}

.subtitle {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0.5rem;
  font-style: italic;
  font-size: 1.25rem;
  line-height: 1.75rem;
  font-family: var(--font-new-rodin);
  text-shadow: var(--text-shadow-under);
}

.dividerLine {
  border: 1px solid var(--color-fg);
  flex-grow: 1;
  box-shadow: var(--shadow-under);
}

.settingsWrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
}

.settingsHighlight {
  width: 32rem;
  height: 3rem;
  background-color: var(--color-red);
  z-index: -1;
  position: absolute;
  top: -0.5rem;
  right: -0.25rem;
  border-radius: 0.375rem;
}

.enterButton {
  font-size: 3.75rem;
  line-height: 1;
  display: flex;
  gap: 1rem;
  cursor: pointer;
}

.enterText {
  letter-spacing: -0.05em;
}

.optionsContainer {
  left: 46vw;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: 100%;
  position: relative;
}

.optionsContainer > * + * {
  margin-top: -8rem;
}

@media screen and (width <= 768px) {
  .optionsContainer {
    left: 2rem;
    transform: scale(0.5);
    transform-origin: left center;
  }
}

@media screen and (width <= 480px) {
  .optionsContainer {
    left: 1rem;
    transform: scale(0.4);
    transform-origin: left center;
  }
}

.controlsSection {
  position: absolute;
  bottom: 0;
  right: 0;
  font-family: var(--font-new-rodin);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 10;
}

.description {
  font-style: italic;
  font-size: 1.875rem;
  line-height: 2.25rem;
  padding-right: 5rem;
  text-shadow: var(--text-shadow-under);
}

.commandLabel {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0.25rem;
  text-shadow: var(--text-shadow-under);
}

.controlButtons {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  padding-right: 5rem;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  text-shadow: var(--text-shadow-under);
}

.sideText {
  position: absolute;
  transform: rotate(90deg);
  letter-spacing: -0.2em;
  color: var(--color-muted);
  font-style: italic;
}

.sideTextInner {
  z-index: 1;
}

.playerWrapper {
  position: fixed;
  top: 1rem;
  right: 2rem;
  z-index: 15;
}

@media screen and (width <= 768px) {
  .controlsSection {
    display: none;
  }

  .sideText {
    display: none;
  }

  .startOverlay {
    gap: 3rem;
    padding: 1rem;
  }

  .title {
    font-size: 1.75rem;
  }

  .subtitle {
    font-size: 0.875rem;
  }

  .settingsHighlight {
    width: 18rem;
  }

  .enterButton {
    font-size: 2rem;
  }
}
</style>
