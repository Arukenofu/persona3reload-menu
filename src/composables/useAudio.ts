import { Howl } from 'howler'
import type { Ref } from 'vue'

const navigationSound = new Howl({
  src: ['/sfx/navigation.wav'],
  volume: 0.5,
})

export function useAudio(sfxEnabled: Ref<boolean>) {
  function playNavigation() {
    if (sfxEnabled.value) {
      navigationSound.play()
    }
  }

  return { playNavigation }
}
