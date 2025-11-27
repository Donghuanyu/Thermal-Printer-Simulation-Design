<script setup>
import { ref, computed, watch } from 'vue';
import Toolbar from './components/Toolbar.vue';
import DesignArea from './components/DesignArea.vue';
import PropertyPanel from './components/PropertyPanel.vue';
import PaperSettings from './components/PaperSettings.vue';
import { generateCpcl } from './utils/cpclGenerator.js';
import { generateTspl } from './utils/tsplGenerator.js';

const designElements = ref([]);
let nextId = 0; // Simple ID generator
const selectedElement = ref(null); // Stores the currently selected element
const printerLanguage = ref('TSPL'); // Default to TSPL

const paperWidth = ref(70); // Default paper width in mm
const paperHeight = ref(70); // Default paper height in mm

const addElement = (type) => {
  const newElement = {
    id: nextId++,
    type: type,
    x: 10, // Default position
    y: 10,
    width: 50, // Default size
    height: 20,
    properties: {} // Element specific properties
  };

  // Set default properties based on type
  switch (type) {
    case 'text':
      // Text elements don't have fixed width/height in CPCL, they size based on content and font
      newElement.width = 0; // Will be dynamic, set to 0 for now
      newElement.height = 0; // Will be dynamic, set to 0 for now
      newElement.properties = { content: '新文本', font: 7, size: 1, magnification: 1 };
      break;
    case 'line':
      // x1, y1 is the same as element's x, y
      newElement.properties = {
        x1: newElement.x,
        y1: newElement.y,
        x2: newElement.x + 50, // Default 50mm long horizontal line
        y2: newElement.y,
        thickness: 1 // Default thickness in dots
      };
      // For lines, width/height will define a bounding box for selection/dragging, not the line itself
      newElement.width = 50;
      newElement.height = 1;
      break;
    case 'barcode':
      newElement.width = 0; // Will be dynamic, set to 0 for now
      newElement.height = 0; // Will be dynamic, set to 0 for now
      newElement.properties = { 
        content: '1234567890', 
        showContent: true, 
        type: 'CODE 128', 
        narrowBarWidth: 2, 
        wideToNarrowRatio: 3, 
        barcodeHeight: 50,
        barcodeTextFont: 7,
        barcodeTextSize: 1,
        barcodeTextOffset: 1
      }; // Renamed height to barcodeHeight to avoid confusion
      break;
  }
  designElements.value.push(newElement);
  selectedElement.value = newElement; // Select the newly added element
};

const selectElement = (element) => {
  selectedElement.value = element;
};

const updatePaperWidth = (width) => {
  paperWidth.value = width;
};

const updatePaperHeight = (height) => {
  paperHeight.value = height;
};


const saveDesign = () => {
  const designData = {
    paperWidth: paperWidth.value,
    paperHeight: paperHeight.value,
    elements: designElements.value,
  };
  const designJson = JSON.stringify(designData, null, 2);
  const blob = new Blob([designJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cpcl_design.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  console.log('设计已保存为 cpcl_design.json');
  alert('设计已保存为 cpcl_design.json');
};

const deleteElement = (id) => {
  const index = designElements.value.findIndex(el => el.id === id);
  if (index !== -1) {
    designElements.value.splice(index, 1);
    selectedElement.value = null; // Deselect after deleting
  }
};

const loadDesignFromFile = (loadedData) => {
  if (loadedData.paperWidth && loadedData.paperHeight && loadedData.elements) {
    paperWidth.value = loadedData.paperWidth;
    paperHeight.value = loadedData.paperHeight;
    designElements.value = loadedData.elements;
    // Ensure unique IDs for new elements after loading
    nextId = Math.max(...designElements.value.map(el => el.id)) + 1;
    if (nextId === -Infinity) nextId = 0; // Handle empty array case

    selectedElement.value = null; // Deselect any previously selected element
    alert('设计已成功导入！');
  } else {
    alert('导入文件内容不完整或格式不正确。');
  }
};

const generatedCode = computed(() => {
  if (printerLanguage.value === 'TSPL') {
    return generateTspl(designElements.value, paperWidth.value, paperHeight.value);
  } else {
    return generateCpcl(designElements.value, paperWidth.value, paperHeight.value);
  }
});

// Watch for deep changes in elements array to trigger re-computation
watch(designElements, () => {
  // This is just to ensure deep reactivity is triggered.
  // The computed property will handle the rest.
}, { deep: true });

</script>

<template>
  <div id="app-container">
    <header class="app-header">
      <h1>热敏打印机仿真设计</h1>
    </header>
    <main class="app-main">
      <aside class="app-sidebar">
        <Toolbar @add-element="addElement" @save-design="saveDesign" @load-design-file="loadDesignFromFile" />
        <PaperSettings :paperWidth="paperWidth" :paperHeight="paperHeight" @update:paperWidth="updatePaperWidth" @update:paperHeight="updatePaperHeight" />
      </aside>
      <section class="app-design-area">
        <DesignArea
          :elements="designElements"
          :paperWidth="paperWidth"
          :paperHeight="paperHeight"
          :selectedElement="selectedElement"
          @select-element="selectElement"
        />
      </section>
      <aside class="app-property-panel">
        <PropertyPanel :selectedElement="selectedElement" @delete-element="deleteElement" />
      </aside>
      <aside class="app-cpcl-panel">
        <div class="panel-header">
          <h3>生成的代码</h3>
          <select v-model="printerLanguage">
            <option value="TSPL">TSPL语言</option>
            <option value="CPCL">CPCL语言</option>
          </select>
        </div>
        <textarea readonly :value="generatedCode"></textarea>
      </aside>
    </main>
  </div>
</template>

<style scoped>
#app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: Arial, sans-serif;
}

.app-header {
  background-color: #069d70; /* User specified color */
  color: white; /* User specified color */
  padding: 10px 20px;
  border-bottom: 1px solid #ddd;
  text-align: center;
}

.app-main {
  display: flex;
  flex: 1; /* Takes up remaining vertical space */
  overflow: hidden; /* Prevent layout from breaking */
}

.app-sidebar {
  width: 200px;
  background-color: #f9f9f9;
  border-right: 1px solid #ddd;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.app-design-area {
  flex: 1; /* Takes up remaining horizontal space */
  background-color: #e9e9e9; /* Changed background to differentiate */
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px;
  overflow: auto; /* Ensure canvas is scrollable if large */
}

.app-property-panel {
  width: 250px;
  background-color: #f9f9f9;
  border-left: 1px solid #ddd;
  padding: 10px;
  overflow-y: auto;
}

.app-cpcl-panel {
  width: 300px;
  background-color: #f9f9f9; /* Match other panels */
  color: #333; /* Darker text for light background */
  border-left: 1px solid #ddd;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.panel-header h3 {
  margin: 0;
  color: #333; /* Match general text color */
}

.app-cpcl-panel textarea {
  flex: 1;
  width: 100%;
  background-color: #fff; /* White background for text area */
  color: #333;
  border: 1px solid #ddd;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  white-space: pre;
  resize: none;
}
</style>
