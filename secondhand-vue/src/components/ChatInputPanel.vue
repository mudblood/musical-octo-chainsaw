<template>
  <div class="chat-input-panel">
    <!-- Image preview strip -->
    <div v-if="images.length > 0" class="image-strip">
      <div v-for="(img, index) in images" :key="index" class="image-wrapper">
        <img :src="getObjectURL(img)" class="preview-image" />
        <button @click="removeImage(index)" class="remove-button">×</button>
      </div>
    </div>

    <!-- Input row -->
    <div class="input-row">
      <label class="upload-button" @click.prevent="triggerFileUpload">➕</label>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        @change="handleFiles"
        style="display:none"
      />
      <input
        v-model="input"
        @keydown.enter.prevent="send"
        placeholder="Type a message..."
        class="chat-input"
      />
      <button type="button" @click="send" class="send-button">Send</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import heic2any from 'heic2any'

const emit = defineEmits(['send-message'])

const input = ref('')
const images = ref([])
const fileInput = ref(null)

function triggerFileUpload() {
  fileInput.value?.click()
}

async function handleFiles(e) {
  await processFiles(Array.from(e.target.files))
  e.target.value = '' // reset file input
}

async function processFiles(files) {
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue
    if (images.value.length >= 24) break

    let finalFile = file
    // ✅ Convert HEIC to JPEG if needed
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      try {
        const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg' })
        finalFile = new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), {
          type: 'image/jpeg',
        })
      } catch (err) {
        console.error('❌ HEIC conversion failed', err)
        continue
      }
    }

    images.value.push(finalFile)
  }
}

// ✅ Expose processFiles to parent
defineExpose({ processFiles })

function send() {
  const text = input.value.trim()
  if (!text && images.value.length === 0) return
  
  // ✅ Look for a price in the text
  const priceMatch = text.match(/\$?(\d+(?:\.\d{1,2})?)/)
  const price = priceMatch ? parseFloat(priceMatch[1]) : null

  emit('send-message', {
    text,
    images: [...images.value],
    price
  })

  input.value = ''
  images.value = []
}

function removeImage(index) {
  images.value.splice(index, 1)
}

function getObjectURL(file) {
  return URL.createObjectURL(file)
}
</script>

<style scoped>
.chat-input-panel {
  border-top: 1px solid #e5e7eb;
  padding-top: 0.5rem;
}

.image-strip {
  display: flex;
  overflow-x: auto;
  gap: 0.5rem;
  padding: 0.5rem;
}

.image-wrapper {
  position: relative;
  flex-shrink: 0;
  background-color: #d1fae5;
  padding: 0.25rem; 
  border-radius: 0.5rem;
}

.preview-image {
  width: 6rem;
  height: 6rem;
  object-fit: cover;
  border-radius: 0.5rem;
}

.remove-button {   
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  background: white;
  border: 1px solid #d1d5db;   
  border-radius: 9999px;
  width: 1.25rem;
  height: 1.25rem;
  font-size: 0.75rem;
  line-height: 1.25rem;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.upload-button {
  font-size: 1.5rem;
  color: #4b5563;
}

.chat-input {   
  flex: 1;
  border: 1px solid #d1d5db;
  padding: 0.5rem;  
}

.send-button {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
}
</style>
