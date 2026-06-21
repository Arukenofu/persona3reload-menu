<script setup lang="ts">
defineProps<{
  isSelected: boolean
  toggleValue: string
}>()

const emit = defineEmits<{
  toggle: []
  select: []
}>()
</script>

<template>
  <button
    :class="[classes.button, isSelected ? classes.selected : classes.unselected]"
    @click="emit('toggle')"
    @mouseenter="emit('select')"
    @focus="emit('select')"
  >
    <span><slot /></span>
    <div :class="classes.toggle">{{ toggleValue }}</div>
  </button>
</template>

<style module="classes">
.button {
  display: flex;
  gap: 2rem;
  align-items: center;
  justify-content: space-between;
  width: 32rem;
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  font-family: var(--font-skip);
  font-weight: bold;
  font-size: 1.5rem;
  line-height: 2rem;
  cursor: pointer;
}

.selected {
  background-color: var(--color-fg);
  color: var(--color-muted);
}

.unselected {
  color: var(--color-button-3);
}

.toggle {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 9999px;
  height: 2rem;
  width: 6rem;
  background-color: black;
  color: var(--color-fg);
  font-family: var(--font-new-rodin);
  font-size: 1.25rem;
  line-height: 1.75rem;
  font-weight: normal;
}
</style>
