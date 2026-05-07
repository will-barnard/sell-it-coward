<script setup>
const props = defineProps({ modelValue: { type: Number, default: 5 } });
const emit = defineEmits(['update:modelValue']);

function adjust(delta) {
  emit('update:modelValue', Math.max(0, (props.modelValue ?? 5) + delta));
}
</script>

<template>
  <div class="fee-stepper">
    <button type="button" class="fee-btn" @click="adjust(-5)">−5</button>
    <input
      type="number"
      step="0.01"
      min="0"
      :value="modelValue ?? 5"
      @input="e => emit('update:modelValue', Math.max(0, parseFloat(e.target.value) || 0))"
    />
    <button type="button" class="fee-btn" @click="adjust(5)">+5</button>
  </div>
</template>
