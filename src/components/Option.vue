<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { animate, createTimeline, spring, utils, type Timeline } from 'animejs'
import type { OptionValue } from '@/types'

const { t, locale } = useI18n()

const BUTTON_COLORS = ['#16CFFB', '#7DE6FD', '#77FEFC']
const SELECTOR_PATH = 'M 24.853754, 93.31573 135.14625, 49.684266 114.14751, 97.331142 Z'
const SELECTOR_BG_PATH = 'M 12.7428765,95.50088 144.25712,47.499123 116.75625,95.465764 Z'

const props = defineProps<{
  index: number
  isSelected: boolean
  option: OptionValue
}>()

const emit = defineEmits<{
  select: []
}>()

const svgElement = ref<SVGElement>()
const textElement = ref<SVGTextElement>()
const textRedElement = ref<SVGTextElement>()
const backgroundElement = ref<SVGPathElement>()
const backgroundMaskElement = ref<SVGPathElement>()

let pulseTimeline: Timeline | undefined

const selectorMaskId = computed(() => `selector-mask-${props.index}`)

const optionName = computed(() => t(props.option.nameKey))

const selectorTransform = computed(() => {
  const charCount = optionName.value.replaceAll(' ', '').length
  return `translate(-60, -10) rotate(8, 0, 100) scale(${charCount * 0.5 + 1.5}, 3)`
})

const textLetterSpacing = computed(() => locale.value === 'ru' ? '-0.05em' : '-0.14em')

const textFill = computed(() => {
  if (props.isSelected) return 'black'
  return BUTTON_COLORS[(props.index + 2) % BUTTON_COLORS.length]
})

function playSelectAnimation() {
  const targets = [textElement.value, textRedElement.value].filter(Boolean)
  if (targets.length === 0) return
  animate(targets, {
    scale: 1.5,
    duration: 100,
    ease: spring({ bounce: 0.5, stiffness: 300, duration: 100 }),
    direction: 'alternate',
  })
}

function resetScale() {
  if (!textElement.value) return
  animate(textElement.value, {
    scale: 1,
    duration: 0,
  })
}

onMounted(() => {
  utils.set(svgElement.value!, {
    translateX: props.option.offsetX,
    translateY: props.option.offsetY,
    rotate: props.option.rotation,
  })

  if (props.isSelected) {
    playSelectAnimation()
  }

  pulseTimeline = createTimeline({
    loop: Infinity,
    autoplay: props.isSelected,
  }).add([backgroundElement.value!, backgroundMaskElement.value!], {
    delay: 600,
    duration: 100,
    scale: 1.05,
  }).add([backgroundElement.value!, backgroundMaskElement.value!], {
    duration: 50,
    scale: 1,
  })
})

watch(() => props.isSelected, (selected) => {
  if (selected) {
    playSelectAnimation()
    pulseTimeline?.play()
  } else {
    resetScale()
    pulseTimeline?.pause()
  }
}, { flush: 'post' })
</script>

<template>
  <div
    :class="classes.wrapper"
    :style="{ zIndex: isSelected ? 5 : option.zIndex }"
  >
    <button
      :class="classes.hitArea"
      @mouseover="emit('select')"
      @focus="emit('select')"
      :title="t(option.descriptionKey)"
    />

    <svg
      ref="svgElement"
      width="950"
      height="200"
      xmlns="http://www.w3.org/2000/svg"
      :class="classes.svg"
      transform-origin="25% center"
    >
      <defs>
        <mask
          :id="selectorMaskId"
          maskUnits="userSpaceOnUse"
          maskContentUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="950"
          height="200"
        >
          <rect width="100%" height="100%" fill="black" />
          <g :transform="selectorTransform" transform-origin="left center">
            <path fill="white" :d="SELECTOR_PATH" />
            <path
              ref="backgroundMaskElement"
              transform-origin="52 100"
              fill="white"
              :d="SELECTOR_BG_PATH"
            />
          </g>
        </mask>
      </defs>

      <g
        :transform="selectorTransform"
        transform-origin="left center"
        :style="{ display: isSelected ? 'block' : 'none' }"
      >
        <path
          ref="backgroundElement"
          fill="#FD77D9"
          transform-origin="52 100"
          :d="SELECTOR_BG_PATH"
        />
        <path fill="#fff" :d="SELECTOR_PATH" />
      </g>

      <text
        ref="textElement"
        :class="classes.text"
        :letter-spacing="textLetterSpacing"
        transform-origin="25% center"
        x="150"
        y="120"
        :fill="textFill"
      >
        {{ optionName }}
      </text>

      <g v-if="isSelected" :mask="`url(#${selectorMaskId})`">
        <text
          ref="textRedElement"
          :class="classes.text"
          :letter-spacing="textLetterSpacing"
          transform-origin="25% center"
          x="150"
          y="120"
          fill="#F00"
        >
          {{ optionName }}
        </text>
      </g>
    </svg>
  </div>
</template>

<style module="classes">
.wrapper {
  position: relative;
  pointer-events: none;
}

.hitArea {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  height: 4rem;
  outline: none;
  pointer-events: auto;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}

.svg {
  cursor: pointer;
  outline: none;
  pointer-events: none;
}

.text {
  font-size: 4.5rem;
  font-style: italic;
}
</style>
