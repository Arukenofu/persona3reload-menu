<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import ToggleButton from '@/components/ToggleButton.vue'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  isSelected: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: []
}>()
</script>

<template>
  <ToggleButton
    :is-selected="isSelected"
    :toggle-value="props.modelValue ? t('settings.on') : t('settings.off')"
    @toggle="emit('update:modelValue', !props.modelValue)"
    @select="emit('select')"
  >
    <slot />
  </ToggleButton>
</template>
