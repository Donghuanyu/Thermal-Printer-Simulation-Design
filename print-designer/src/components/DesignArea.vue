<script setup>
import { defineProps, defineEmits, ref, computed } from 'vue';
import BarcodeDisplay from './BarcodeDisplay.vue'; // Import the new component

const DOTS_PER_MM = 8; // Assuming 203 DPI (8 dots per mm) - Keep consistent with cpclGenerator.js

const props = defineProps({
  elements: {
    type: Array,
    default: () => [],
  },
  paperWidth: {
    type: Number,
    default: 100,
  },
  paperHeight: {
    type: Number,
    default: 150,
  },
  selectedElement: {
    type: Object,
    default: null,
  }
});

const emits = defineEmits(['select-element']);

const lineElements = computed(() => props.elements.filter(el => el.type === 'line'));
const nonLineElements = computed(() => props.elements.filter(el => el.type !== 'line'));

const selectElement = (element) => {
  emits('select-element', element);
};

const deselectElement = () => {
  emits('select-element', null);
};

// Drag functionality
const dragging = ref(false);
const startX = ref(0);
const startY = ref(0);
let draggedElement = null;
let initialDragState = {};

const startDrag = (event, element) => {
  dragging.value = true;
  draggedElement = element;
  startX.value = event.clientX;
  startY.value = event.clientY;

  if (element.type === 'line') {
    initialDragState = { x1: element.properties.x1, y1: element.properties.y1, x2: element.properties.x2, y2: element.properties.y2 };
  } else {
    initialDragState = { x: element.x, y: element.y };
  }

  window.addEventListener('mousemove', drag);
  window.addEventListener('mouseup', stopDrag);
};

const drag = (event) => {
  if (!dragging.value || !draggedElement) return;

  const dx = event.clientX - startX.value;
  const dy = event.clientY - startY.value;

  const pxPerMm = 3.78; // This might need adjustment
  const dxMm = dx / pxPerMm;
  const dyMm = dy / pxPerMm;

  if (draggedElement.type === 'line') {
    draggedElement.properties.x1 = initialDragState.x1 + dxMm;
    draggedElement.properties.y1 = initialDragState.y1 + dyMm;
    draggedElement.properties.x2 = initialDragState.x2 + dxMm;
    draggedElement.properties.y2 = initialDragState.y2 + dyMm;
  } else {
    draggedElement.x = initialDragState.x + dxMm;
    draggedElement.y = initialDragState.y + dyMm;
  }
};

const stopDrag = () => {
  dragging.value = false;
  draggedElement = null;
  window.removeEventListener('mousemove', drag);
  window.removeEventListener('mouseup', stopDrag);
};


const getFontStyles = (font, size) => {
  const styles = {
    fontFamily: 'monospace', // Default fallback
    fontSize: '16px', // Default size
    fontWeight: 'normal',
  };

  switch (font) {
    case 0:
      styles.fontFamily = "'Courier New', Courier, monospace";
      styles.fontSize = `${10 + size * 2}px`;
      break;
    case 1:
      styles.fontFamily = "'Brush Script MT', cursive";
      styles.fontSize = `${20 + size * 4}px`;
      break;
    case 2:
      styles.fontFamily = "'Courier New', Courier, monospace";
      styles.fontSize = '10px';
      break;
    case 4:
      styles.fontFamily = "'Arial Black', Gadget, sans-serif";
      styles.fontWeight = 'bold';
      styles.fontSize = `${12 + size * 8}px`; // Size increases dramatically
      break;
    case 5:
      styles.fontFamily = "Arial, sans-serif";
      styles.fontSize = `${12 + size * 2}px`;
      break;
    case 6:
    case 7:
      styles.fontFamily = "'Courier New', Courier, monospace";
      styles.fontSize = `${16 + size * 2}px`;
      break;
    default:
      styles.fontSize = `${12 + size * 2}px`;
  }
  return styles;
};


const getElementStyle = (element) => {
  const style = {
    position: 'absolute',
    left: `${element.x}mm`,
    top: `${element.y}mm`,
    boxSizing: 'border-box',
    width: 'auto', // Let width be determined by content
    height: 'auto', // Let height be determined by content
  };

  if (element.type === 'text') {
    const fontStyles = getFontStyles(element.properties.font, element.properties.size);
    Object.assign(style, {
      ...fontStyles,
      display: 'inline-block', // To wrap content
      whiteSpace: 'nowrap', // Prevent line breaks
    });
  } else if (element.type === 'barcode') {
    Object.assign(style, {
      border: '1px solid #ccc', // For visualization of the bounding box
    });
  }
  return style;
};
</script>

<template>
  <div class="design-area-component" @click="deselectElement">
    <div
      class="paper-canvas"
      :style="{ width: `${paperWidth}mm`, height: `${paperHeight}mm` }"
    >
      <!-- Non-line elements -->
      <div
        v-for="element in nonLineElements"
        :key="element.id"
        class="design-element"
        :class="{ 'is-selected': selectedElement && selectedElement.id === element.id }"
        :style="getElementStyle(element)"
        @mousedown.stop="startDrag($event, element)"
        @click.stop="selectElement(element)"
      >
        <div v-if="element.type === 'text'">{{ element.properties.content }}</div>
        <BarcodeDisplay
          v-else-if="element.type === 'barcode'"
          :content="element.properties.content"
          :barcodeType="element.properties.type"
          :narrowBarWidth="element.properties.narrowBarWidth"
          :wideToNarrowRatio="element.properties.wideToNarrowRatio"
          :barcodeHeight="element.properties.barcodeHeight"
          :showContent="element.properties.showContent"
        />
      </div>

      <!-- SVG overlay for lines -->
      <svg class="svg-overlay" width="100%" height="100%" :viewBox="`0 0 ${paperWidth} ${paperHeight}`">
        <g
          v-for="line in lineElements"
          :key="line.id"
          @mousedown.stop="startDrag($event, line)"
          @click.stop="selectElement(line)"
          style="cursor: grab;"
        >
          <line
            :x1="line.properties.x1"
            :y1="line.properties.y1"
            :x2="line.properties.x2"
            :y2="line.properties.y2"
            stroke="transparent"
            :stroke-width="Math.max(line.properties.thickness / DOTS_PER_MM, 2)" 
          />
          <line
            :x1="line.properties.x1"
            :y1="line.properties.y1"
            :x2="line.properties.x2"
            :y2="line.properties.y2"
            :stroke="selectedElement && selectedElement.id === line.id ? '#007bff' : 'black'"
            :stroke-width="line.properties.thickness / DOTS_PER_MM"
          />
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.design-area-component {
  flex: 1;
  background-color: #f0f0f0;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  overflow: auto; /* Enable scrolling if paper is larger than view */
}

.paper-canvas {
  position: relative;
  background-color: white;
  border: 1px solid #333;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  overflow: hidden; /* Elements outside paper are hidden */
  /* Width and Height are set dynamically via style binding */
}

.svg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Allow clicks to pass through to elements below */
}

.svg-overlay line {
  pointer-events: all; /* Make lines clickable */
  cursor: grab;
}

.design-element {
  position: absolute;
  /* Dynamic styles will be applied via getElementStyle */
  cursor: grab;
}

.design-element.is-selected {
  outline: 2px solid #007bff; /* Highlight selected element */
  z-index: 10; /* Bring selected element to front */
}

/* Removed old barcode visual CSS */
</style>
