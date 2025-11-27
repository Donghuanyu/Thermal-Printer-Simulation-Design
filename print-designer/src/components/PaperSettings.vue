<template>
  <div class="paper-settings">
    <h3>纸张设置 (mm)</h3>
    <div class="setting-item">
      <label for="paper-width">宽度:</label>
      <input type="number" id="paper-width" v-model.number="currentPaperWidth" min="1" />
    </div>
    <div class="setting-item">
      <label for="paper-height">高度:</label>
      <input type="number" id="paper-height" v-model.number="currentPaperHeight" min="1" />
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  paperWidth: {
    type: Number,
    default: 100,
  },
  paperHeight: {
    type: Number,
    default: 150,
  },
});

const emits = defineEmits(['update:paperWidth', 'update:paperHeight']);

const currentPaperWidth = computed({
  get: () => props.paperWidth,
  set: (value) => emits('update:paperWidth', value),
});

const currentPaperHeight = computed({
  get: () => props.paperHeight,
  set: (value) => emits('update:paperHeight', value),
});
</script>

<style scoped>
.paper-settings {
  padding: 10px;
  border-top: 1px solid #eee;
}

.setting-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.setting-item label {
  width: 60px;
  margin-right: 5px;
  white-space: nowrap; /* Prevent label from wrapping */
}

.setting-item input {
  flex: 1;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 0; /* Allow input to shrink */
  box-sizing: border-box; /* Include padding and border in the element's total width */
}
</style>
