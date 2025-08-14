<template>
  <div class="chat-panel-content"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
    :class="{ 'drag-hover': isDragHovering }"
  >
    <button @click="$emit('close')" class="icon-button"><img :src="sidebarIcon" alt="Close sidebar" class="global-icon" /> </button>

    <!-- Chat Messages -->
    <ChatBox
      ref="chatBox"
      @listing-ready="handleListing"
    />

    <!-- Chat Input -->
    <ChatInputPanel
      :isActive="true"
      ref="chatInput"
      @send-message="handleSendMessage"
    />
  </div>
</template>

<script setup>
import { onMounted, nextTick, ref } from 'vue'
import axios from 'axios'
import ChatBox from './ChatBox.vue'
import ChatInputPanel from './ChatInputPanel.vue'
import sidebarIcon from '../assets/sidebar.svg'

const emit = defineEmits(['close', 'listed'])
const API = import.meta.env.VITE_API_BASE

const chatBox = ref(null)
const isDragHovering = ref(false)

const props = defineProps({
  isActive: { type: Boolean, default: false }
})

const chatInput = ref(null)

// Expose a method the parent (feed.vue) can call after transition.
function focusInput() {
  chatInput.value?.focusInput?.()
}
defineExpose({ focusInput })

// 🔵 DRAG & DROP
function onDragOver() {
  isDragHovering.value = true
}
function onDragLeave() {
  isDragHovering.value = false
}
async function onDrop(e) {
  isDragHovering.value = false   // ✅ fixed typo
  const files = Array.from(e.dataTransfer.files)
    .filter(f => f.type.startsWith('image/'))

  if (files.length) {
    // ✅ Forward files to ChatInputPanel
    await chatInput.value.processFiles(files)
  }
  e.dataTransfer.clearData()
}

// 🔵 ChatInputPanel sends message ➜ forward to ChatBox
function handleSendMessage(payload) {
  chatBox.value?.addMessage(payload)
}

// 🔵 When ChatBox signals it's ready to post listing
async function handleListing(listing) {
  try {
    const formData = new FormData()
    formData.append('description', listing.description)
    if (listing.price) formData.append('price', listing.price)  // ✅ send price
    
    listing.photos.forEach(file => {
      formData.append('photos', file)
    })

    await axios.post(`${API}/listings`, formData)
    emit('listed')
  } catch (err) {
    console.error('❌ Failed to post listing:', err)
  }
}

</script>

<style scoped>
.chat-panel-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0.5rem;
}
.cancel-button {
  cursor: pointer;
  width: 100%;
  color: #4b5563;
  height: 60px;
}
.drag-hover {
  border: 2px dashed #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}
</style>
