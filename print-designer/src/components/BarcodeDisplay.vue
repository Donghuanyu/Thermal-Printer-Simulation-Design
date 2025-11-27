<template>
  <div class="barcode-display">
    <svg ref="barcodeSvg"></svg>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import JsBarcode from 'jsbarcode';

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
  barcodeType: {
    type: String,
    default: 'CODE128', // JsBarcode uses CODE128, CODE39, etc.
  },
  narrowBarWidth: {
    type: Number,
    default: 2,
  },
  wideToNarrowRatio: {
    type: Number,
    default: 3,
  },
  barcodeHeight: { // Using barcodeHeight to avoid conflict with element.height
    type: Number,
    default: 50,
  },
  showContent: {
    type: Boolean,
    default: true,
  },
});

const barcodeSvg = ref(null);

const generateBarcode = () => {
  if (barcodeSvg.value && props.content) {
    JsBarcode(barcodeSvg.value, props.content, {
      format: props.barcodeType.replace(/\s/g, ''), // JsBarcode format (e.g., "CODE128")
      width: props.narrowBarWidth, // This might need tuning too, but height is the main issue
      height: props.barcodeHeight * 3.78, // Convert mm to px (assuming 96 DPI screen)
      displayValue: props.showContent,
    });
  }
};

onMounted(generateBarcode);
watch(() => [
  props.content,
  props.barcodeType,
  props.narrowBarWidth,
  props.barcodeHeight,
  props.showContent,
], generateBarcode);
</script>

<style scoped>
.barcode-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.barcode-display svg {
  max-width: 100%;
  max-height: 100%;
}
</style>
