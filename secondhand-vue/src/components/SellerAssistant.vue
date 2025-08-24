<template>
  <div
    class="chat-panel-content"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
    :class="{ 'drag-hover': isDragHovering }"
  >
    <!-- Close button -->
    <button @click="$emit('close')" class="icon-button">
      <img :src="xIcon" alt="Close sidebar" class="global-icon" />
    </button>

    <!-- Chat Messages -->
    <ChatBox
      ref="chatBox"
      @listing-ready="handleListing"
    />

    <!-- Chat Input -->
    <ChatInputPanel
      :isActive="isActive"
      ref="chatInput"
      @send-message="handleSendMessage"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import ChatBox from './ChatBox.vue'
import ChatInputPanel from './ChatInputPanel.vue'
import sidebarIcon from '../assets/sidebar.svg'
import xIcon from '../assets/x.svg'

const emit = defineEmits(['close', 'listed'])
const props = defineProps({
  isActive: { type: Boolean, default: false }
})

const API = import.meta.env.VITE_API_BASE
const chatBox = ref(null)
const chatInput = ref(null)
const isDragHovering = ref(false)

function focusInput() {
  chatInput.value?.focusInput?.()
}
defineExpose({ focusInput })

function onDragOver() {
  isDragHovering.value = true
}
function onDragLeave() {
  isDragHovering.value = false
}
async function onDrop(e) {
  isDragHovering.value = false
  const files = Array.from(e.dataTransfer.files)
    .filter(f => f.type.startsWith('image/'))
  if (files.length) {
    await chatInput.value.processFiles(files)
  }
  e.dataTransfer.clearData()
}

function handleSendMessage(payload) {
  chatBox.value?.addMessage(payload)
}

async function handleListing(listing) {
  try {
    const formData = new FormData()
    formData.append('description', listing.description)
    if (listing.price) formData.append('price', listing.price)
    listing.photos.forEach(file => formData.append('photos', file))
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

.icon-button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
}

.drag-hover {
  border: 2px dashed #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}
</style>
