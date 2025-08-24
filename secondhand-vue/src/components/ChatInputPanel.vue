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
      <label class="upload-button" @click.prevent="triggerFileUpload"> <img :src="mediaIcon" alt="Add media" class="global-icon" /> 
</label>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        @change="handleFiles"
        style="display:none"
      />
      <input
        ref="chatInput"
        v-model="input"
        @keydown.enter.prevent="send"
        placeholder="Type a message..."
        class="chat-input"
      />
    </div>
    <button type="button" @click="send" class="send-button">Send</button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import heic2any from 'heic2any'
import plusIcon from '../assets/plus.svg'
import mediaIcon from '../assets/media.svg'

const props = defineProps({
  isActive: { type: Boolean, default: false }
})

const emit = defineEmits(['send-message'])

const input = ref('')
const images = ref([])
const fileInput = ref(null)
const chatInput = ref(null)

function focusNow() {
  // Focusing after render + one paint is very reliable with CSS transitions.
  nextTick(() => {
    requestAnimationFrame(() => chatInput.value?.focus())
  })
}

// Focus once on first mount (in case the panel renders visible)
onMounted(() => focusNow())

// Focus every time the panel becomes active again
watch(() => props.isActive, (val) => {
  if (val) focusNow()
})

// Expose to parent for the @after-enter hook
function focusInput() { focusNow() }
defineExpose({ processFiles, focusInput }) // keep your existing expose

onMounted(() => {
  nextTick(() => {
    chatInput.value?.focus()
    console.log("Focused element:", document.activeElement);
  })
})

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
  padding-top: 0.5rem;
}

.chat-input {
  caret-color: black;
  color: black;
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
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  width: 24px;
  height: 24px;
  color: #4b5563;
}

.chat-input {
  width: 100%;   
  flex: 1;
  padding: 0.5rem;  
}

.send-button {
  background-color: #3b82f6;
  width: 100%;
  height: 64px;
  color: white;
  padding: 0px;
}
</style>

@media (max-width: 768px) {
  /* keep feed-wrapper as-is so it's still scrollable underneath */
}
