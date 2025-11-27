<template>
  <div class="property-panel">
    <h3>属性面板</h3>
    <div v-if="selectedElement">
      <h4>{{ selectedElement.type === 'text' ? '文本' : selectedElement.type === 'line' ? '直线' : '条形码' }} 属性</h4>
      <div class="property-group">
        <label>ID:</label>
        <span>{{ selectedElement.id }}</span>
      </div>

      <template v-if="selectedElement.type !== 'line' && selectedElement.type !== 'text' && selectedElement.type !== 'barcode'">
        <div class="property-group">
          <label>X (mm):</label>
          <input type="number" v-model.number="selectedElement.x" min="0" />
        </div>
        <div class="property-group">
          <label>Y (mm):</label>
          <input type="number" v-model.number="selectedElement.y" min="0" />
        </div>
        <div class="property-group">
          <label>宽度 (mm):</label>
          <input type="number" v-model.number="selectedElement.width" min="0" />
        </div>
        <div class="property-group">
          <label>高度 (mm):</label>
          <input type="number" v-model.number="selectedElement.height" min="0" />
        </div>
      </template>

      <template v-if="selectedElement.type === 'text'">
        <div class="property-group">
          <label>X (mm):</label>
          <input type="number" v-model.number="selectedElement.x" min="0" />
        </div>
        <div class="property-group">
          <label>Y (mm):</label>
          <input type="number" v-model.number="selectedElement.y" min="0" />
        </div>
        <div class="property-group">
          <label>内容:</label>
          <input type="text" v-model="selectedElement.properties.content" />
        </div>
        <div class="property-group">
          <label>字体编号:</label>
          <input type="number" v-model.number="selectedElement.properties.font" min="0" />
        </div>
        <div class="property-group">
          <label>字体大小:</label>
          <input type="number" v-model.number="selectedElement.properties.size" min="0" max="10" step="1" />
        </div>
        <div class="property-group">
          <label>放大倍数:</label>
          <input type="number" v-model.number="selectedElement.properties.magnification" min="1" />
        </div>

      </template>

      <template v-if="selectedElement.type === 'line'">
        <div class="property-group">
          <label>X1 (mm):</label>
          <input type="number" v-model.number="selectedElement.properties.x1" min="0" />
        </div>
        <div class="property-group">
          <label>Y1 (mm):</label>
          <input type="number" v-model.number="selectedElement.properties.y1" min="0" />
        </div>
        <div class="property-group">
          <label>X2 (mm):</label>
          <input type="number" v-model.number="selectedElement.properties.x2" min="0" />
        </div>
        <div class="property-group">
          <label>Y2 (mm):</label>
          <input type="number" v-model.number="selectedElement.properties.y2" min="0" />
        </div>
        <div class="property-group">
          <label>粗细 (mm):</label>
          <input type="number" v-model.number="selectedElement.properties.thickness" min="1" />
        </div>
      </template>

      <template v-if="selectedElement.type === 'barcode'">
        <div class="property-group">
          <label>X (mm):</label>
          <input type="number" v-model.number="selectedElement.x" min="0" />
        </div>
        <div class="property-group">
          <label>Y (mm):</label>
          <input type="number" v-model.number="selectedElement.y" min="0" />
        </div>
        <div class="property-group">
          <label>内容:</label>
          <input type="text" v-model="selectedElement.properties.content" />
        </div>
        <div class="property-group">
          <label>显示内容:</label>
          <input type="checkbox" v-model="selectedElement.properties.showContent" />
        </div>
        <template v-if="selectedElement.properties.showContent">
          <div class="property-group">
            <label>字体编号:</label>
            <input type="number" v-model.number="selectedElement.properties.barcodeTextFont" min="0" />
          </div>
          <div class="property-group">
            <label>字体大小:</label>
            <input type="number" v-model.number="selectedElement.properties.barcodeTextSize" min="0" />
          </div>
          <div class="property-group">
            <label>偏移量 (mm):</label>
            <input type="number" v-model.number="selectedElement.properties.barcodeTextOffset" min="0" />
          </div>
        </template>
        <div class="property-group">
          <label>类型:</label>
          <select v-model="selectedElement.properties.type">
            <option value="CODE 39">CODE 39</option>
            <option value="CODE 128">CODE 128</option>
          </select>
        </div>
        <div class="property-group">
          <label>窄条单位宽度:</label>
          <input type="number" v-model.number="selectedElement.properties.narrowBarWidth" min="0" />
        </div>
        <div class="property-group">
          <label>宽条与窄条比例:</label>
          <input type="number" v-model.number="selectedElement.properties.wideToNarrowRatio" min="0" />
        </div>
        <div class="property-group">
          <label>条码单位高度:</label>
          <input type="number" v-model.number="selectedElement.properties.barcodeHeight" min="0" />
        </div>
      </template>
      <div class="delete-button-container">
        <button class="delete-button" @click="$emit('delete-element', selectedElement.id)">删除元素</button>
      </div>
    </div>
    <p v-else>请选择一个元素进行编辑。</p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  selectedElement: {
    type: Object,
    default: null,
  },
});
</script>

<style scoped>
.property-panel {
  padding: 10px;
  background-color: #f9f9f9;
  border-left: 1px solid #ddd;
}

.property-panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.property-panel h4 {
  margin-top: 20px;
  margin-bottom: 10px;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
  font-size: 16px; /* Smaller font size for element type titles */
}

.property-group {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.property-group label {
  width: 90px;
  margin-right: 5px;
  font-weight: bold;
  white-space: nowrap; /* Prevent label from wrapping */
  font-size: 12px; /* Smaller font size for property labels */
}

.property-group span {
  flex: 1;
}

.property-group input[type="text"],
.property-group input[type="number"],
.property-group select {
  flex: 1;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 0; /* Allow input to shrink */
  box-sizing: border-box; /* Include padding and border in the element's total width */
}

.property-group input[type="checkbox"] {
  margin-left: 0;
}

.delete-button-container {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.delete-button {
  width: 100%;
  padding: 8px;
  background-color: #069d70; /* User specified color */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-button:hover {
  background-color: #047a5a; /* A slightly darker shade for hover */
}
</style>
