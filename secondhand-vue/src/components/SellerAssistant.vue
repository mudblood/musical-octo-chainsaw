<template>
  <div class="assistant-panel">
    <div class="assistant-wrapper">
      <button @click="$emit('close')" class="cancel-button">Cancel</button>
      <!-- Chat area -->
      <div id="chat-box" class="chat-messages">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['chat-bubble', msg.sender === 'user' ? 'user' : 'assistant']"
        >
          {{ msg.text }}
        </div>
      </div>

      <!-- Image preview strip -->
      <div v-if="images.length > 0" class="image-strip">
        <div v-for="(img, index) in images" :key="index" class="image-wrapper">
          <img :src="getObjectURL(img)" class="preview-image" />
          <button @click="removeImage(index)" class="remove-button" title="Remove">×</button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading">Converting images…</div>

      <!-- Upload + Chat input + Send -->
      <div class="input-row">
        <label class="upload-button">
          ➕
          <input type="file" accept="image/*" multiple @change="handleFiles" class="hidden" />
        </label>

        <input
          v-model="input"
          @keydown.enter.prevent="sendMessage"
          placeholder="Type a message..."
          class="chat-input"
        />

        <button @click="sendMessage" class="send-button">Send</button>
      </div>

    </div>
  </div>
</template> 

<script setup>
import { ref, reactive, nextTick } from 'vue'
import axios from 'axios'
import heic2any from 'heic2any'
      
const emit = defineEmits(['close', 'listed'])
const API = import.meta.env.VITE_API_BASE
    
const input = ref('')
const messages = reactive([
  { sender: 'assistant', text: "Hi! What are you selling today?" }
]) 
const images = ref([])  
const loading = ref(false)
  
const getObjectURL = (file) =>
  file instanceof File ? URL.createObjectURL(file) : file
  
const scrollToBottom = async () => {
  await nextTick()
  const el = document.getElementById('chat-box')
  if (el) el.scrollTop = el.scrollHeight
}

const sendMessage = async () => {
  const trimmed = input.value.trim()
  if (!trimmed) return

  messages.push({ sender: 'user', text: trimmed })
  input.value = ''
  await scrollToBottom()

  // Assistant replies
  if (trimmed.toLowerCase().includes('necklace')) {
    messages.push({
      sender: 'assistant',
      text: 'Great! Please upload a few photos of the necklace and let me know the price.',
    })
  } else {
    messages.push({
      sender: 'assistant',
      text: 'Got it! Can you tell me the price and upload photos?',
    })
  }
  await scrollToBottom()

  // 🚀 Auto-submit the listing if valid
  if (images.value.length > 0 && trimmed.length > 5) {
    console.log('[DEBUG] Attempting to submit listing...')  
    await submitListing()
  }
}

const handleFiles = async (e) => {
  const files = Array.from(e.target.files)

  for (const file of files) {
    if (images.value.length >= 24) break
  
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      try {
        const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg' })
        const jpegFile = new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), {
          type: 'image/jpeg',
        })
        images.value.push(jpegFile)
      } catch (err) {   
        console.error('HEIC conversion failed:', err)
      }
    } else {
      images.value.push(file)
    }
  }
      
  e.target.value = '' // reset file input
}
      
const removeImage = (index) => {
  images.value.splice(index, 1)
}  
const submitListing = async () => {
  console.log('[DEBUG] Inside submitListing with images:', images.value)
  if (!messages.length || images.value.length === 0) return
  loading.value = true
  
  const description = messages.find((m) => m.sender === 'user')?.text || ''
  const priceMatch = description.match(/\$?(\d+(\.\d{1,2})?)/)
  const price = priceMatch ? parseFloat(priceMatch[1]) : null
  
  const formData = new FormData()
  formData.append('description', description)
  if (price !== null) formData.append('price', price)
  formData.append('styleTag', 'misc')
          
  for (const file of images.value) {
    formData.append('photos', file)
  }
        
  try {
    await axios.post(`${API}/listings`, formData)
    emit('listed')
    emit('close')
  } catch (err) {
    console.error('Failed to post listing:', err)
  } finally {
    loading.value = false
  }   
}
</script>

<style scoped>
.assistant-panel {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 25%;
  min-width: 300px;
  max-width: 400px;       
  background-color: white;
  overflow-y: auto;
  z-index: 50;
}
        
.assistant-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
  gap: 0.5rem;
  box-sizing: border-box;
}

.cancel-button {
  cursor: w-resize;
  width: 100%;
  font-size: 0.875rem;
  color: #4b5563;
  text-decoration: underline;
}
  
.chat-messages {
  flex: 1;   
  overflow-y: auto;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chat-bubble {
  display: inline-block;
  padding: 0.75rem;
  border-radius: 0.5rem;
  max-width: 100%;
  word-wrap: break-word;
}
.chat-bubble.user {
  align-self: flex-end;
  background-color: #d1fae5;
  text-align: right;
}       
.chat-bubble.assistant {
  align-self: flex-start;
  background-color: #f3f4f6;
  text-align: left;
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
  text-align: center;
}
  
.loading {
  font-size: 0.875rem;
  color: #6b7280;
}
.input-row {    
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
}
.upload-button {
  font-size: 1.5rem;
  color: #4b5563;
  cursor: pointer;
}
.chat-input {
  width: 100%;
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
