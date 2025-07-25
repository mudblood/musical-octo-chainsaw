<template>
  <div class="header">
    <button @click="openChat = true" class="sell-button">Sell</button>
  </div>

  <!-- layout wrapper for feed and chat -->
<div class="main-layout">
  <!-- seller assistant side panel -->
<transition name="slide">
  <div v-if="openChat" class="chat-panel">
    <SellerAssistant
       @listed="handleListed"
       @close="openChat = false"
    />
  </div>
</transition> 


  <!-- feed area -->
  <div :class="['feed-wrapper', { 'feed-shrink': openChat }]">
  <div class="feed-grid">
    <div 
       v-for="(listing, index) in listings" 
       :key="listing._id" 
       class="feed-item"
       tabindex="0"
       @keydown="handleKeydown(index, $event)"
       @keyup.enter="zoomedListing = listing"
       @click="zoomedListing = listing"
       :aria-label="listing.altText || 'Listing image'"
       :title="listing.description"
    >
       <img
        :src="`${API}${listing.photos[0]}`"
        :alt="listing.altText || 'Listing image'"
        class="feed-image"
       />   
    </div>
  </div>
  </div>

</div>

  <!-- fullscreen viewer -->
  <ZoomViewer
    v-if="zoomedListing"
    :listing="zoomedListing"
    :listings="listings"
    :API="API"
    @close="zoomedListing = null"
    @navigate="zoomedListing = $event"
  />
</template>

<script setup>
import { ref, onMounted, onUpdated, watch, nextTick, defineAsyncComponent } from 'vue'
import axios from 'axios'
import SellerAssistant from '../components/SellerAssistant.vue'

// lazy load zoom viewer
const ZoomViewer = defineAsyncComponent(() =>
  import('../components/ZoomViewer.vue')
)

const API = import.meta.env.VITE_API_BASE
const listings = ref([])
const items = ref([])
const openChat = ref(false)
const zoomedListing = ref(null)

const fetchListings = async () => {
  try {
    const res = await axios.get(`${API}/listings`)
    listings.value = res.data
  } catch (err) {
    console.error('Failed to fetch listings:', err)
  }
}

const handleListed = async () => {
  openChat.value = false
  await fetchListings()
}

const handleKeydown = (index, e) => {
  if (e.key === 'Tab') return
  const total = listings.value.length
  const cols = 3
  let targetIndex = null
  switch (e.key) {
    case 'ArrowRight': if ((index + 1) % cols !== 0) targetIndex = index + 1; break
    case 'ArrowLeft': if (index % cols !== 0) targetIndex = index - 1; break
    case 'ArrowDown': if (index + cols < total) targetIndex = index + cols; break
    case 'ArrowUp': if (index - cols >= 0) targetIndex = index - cols; break
  }
  if (targetIndex !== null) {
    e.preventDefault()
    const el = items.value[targetIndex]
    if (el) el.focus()
  }
}

watch(zoomedListing, async (val) => {
  if (val !== null) {
    await nextTick()
    document.querySelector('.zoom-overlay')?.focus()
  }
})

onMounted(fetchListings)
onUpdated(() => {
  items.value = document.querySelectorAll('.feed-item')
})
</script>

<style scoped>

.sell-button {
  cursor: e-resize;
  position: fixed;
  padding-left: 6px;
  padding-right: 6px;
  padding-top: 2px;
  padding-bottom: 2px;
  margin: 8px;  
}

.main-layout {
  display:flex;
  width: 100%;
  height: 100vh; /* adjust based on header height */
}

.chat-panel {
  flex-basis: 25%;
  min-width: 300px;
  max-width: 400px;
  background:white;
  transition: all 0.3s ease;
  z-index: 10;
}

.feed-wrapper {
  flex-grow: 1;
  flex-basis: 100%;
  transition: flex-basis 0.3s ease;
}

.feed-shrink {
  flex-basis: 75%;
}

/* slide transition */
.slide-enter-from {
  transform: translateX(-100%);
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
}
.slide-leave-to {
  transform: translateX(-100%);
}

.feed-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
}

.feed-item {
  cursor: pointer;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
}

.feed-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.feed-item:focus {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

.zoom-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.zoomed-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 8px;
}
</style>

