<template>
  <div class="toolbar">
    <h3>工具栏</h3>
    <div class="tool-buttons">
      <button @click="addElement('text')">添加文本</button>
      <button @click="addElement('line')">添加直线</button>
      <button @click="addElement('barcode')">添加条形码</button>
    </div>
    <div class="action-buttons">
      <button @click="saveDesign">保存设计</button>
      <input type="file" ref="fileInput" @change="handleFileChange" style="display: none;" accept=".json" />
      <button @click="triggerFileInput">导入设计</button>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, ref } from 'vue';

const emits = defineEmits(['addElement', 'saveDesign', 'loadDesignFile']);

const fileInput = ref(null);

const addElement = (type) => {
  emits('addElement', type);
};

const saveDesign = () => {
  emits('saveDesign');
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target.result);
        emits('loadDesignFile', content);
      } catch (error) {
        alert('导入文件格式不正确，请确保它是有效的JSON文件。');
        console.error('Error parsing JSON file:', error);
      }
    };
    reader.readAsText(file);
  }
};
</script>

<style scoped>
.toolbar {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.tool-buttons button, .action-buttons button {
  display: block;
  width: 100%;
  padding: 8px;
  margin-bottom: 5px;
  background-color: #069d70; /* User specified color */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.tool-buttons button:hover, .action-buttons button:hover {
  background-color: #047a5a; /* A slightly darker shade for hover */
}

.action-buttons {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}
</style>
