<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ToggleButton from '@/components/ToggleButton.vue'

const { t, locale } = useI18n()

defineProps<{
  isSelected: boolean
}>()

const emit = defineEmits<{
  select: []
}>()

function toggle() {
  locale.value = locale.value === 'en' ? 'ru' : 'en'
}
</script>

<template>
  <ToggleButton
    :is-selected="isSelected"
    :toggle-value="locale === 'en' ? 'EN' : 'RU'"
    @toggle="toggle"
    @select="emit('select')"
  >
    {{ t('settings.language') }}
  </ToggleButton>
</template>
