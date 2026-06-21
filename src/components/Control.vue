<script setup lang="ts">
defineProps<{
  keyLabel: string
}>()
</script>

<template>
  <div :class="classes.control">
    <span :class="classes.key">{{ keyLabel }}</span>
    <span :class="classes.label"><slot /></span>
  </div>
</template>

<style module="classes">
.control {
  display: flex;
  gap: 0.125rem;
  align-items: center;
}

.key {
  border-radius: 9999px;
  width: 2rem;
  height: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: bold;
  background-color: rgba(3, 31, 100, 0.8);
  outline: 3px solid var(--color-border);
  box-shadow: var(--shadow-under);
  font-size: 1.25rem;
  line-height: 1.75rem;
  border: 3px solid var(--color-fg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.label {
  text-shadow: var(--text-shadow-border);
  font-size: 1.875rem;
  line-height: 2.25rem;
  font-family: system-ui, -apple-system, sans-serif;
  letter-spacing: -0.025em;
  font-style: italic;
}
</style>
