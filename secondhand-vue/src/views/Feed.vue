<template>
        
  <!-- layout wrapper for feed and chat -->
<div class="main-layout"> 
  <!-- seller assistant side panel -->
<transition name="slide" mode="out-in">
  <div v-show="openChat" class="chat-panel">
    <SellerAssistant
       @listed="handleListed"
       @close="openChat = false"
    />
  </div>
</transition>
    
    
  <!-- feed area -->
  <div class="feed-wrapper">

  <div class="header">
    <button @click="openChat = true" class="btn-floatiing">Sell</button>
  </div>
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

       <!-- ✅ Only show if listing has a price -->
       <div v-if="listing.price" class="price-badge">
         {{ formatPrice(listing.price) }}
       </div>
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
  await fetchListings()
}

function formatPrice(value) {
  // handles "$10", "10", 10, 10.5, etc.
  if (typeof value === 'string' && value.trim().startsWith('$')) {
    return value.trim()
  }
  return `$${parseFloat(value).toFixed(2)}`
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

.header {
  position: sticky;
  top: 0;
  height: 50px;
  background: white;
}
  
.main-layout {  
  display:flex;
  width: 100%;
  height: 100%;
  padding-bottom: 24px;
  min-height: 100dvh;
  overflow: hidden;
}
    
.chat-panel {
  flex-basis: 25%;
  min-width: 300px;     
  max-width: 400px;
  background: white;  
  z-index: 10;
  will-change: transform;
  /* side panel stays pinned and can scroll on its own */
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}  
   
/* ✅ Feed container takes up full width by default */
.feed-wrapper {
  flex-grow: 1;  
  height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* ✅ iOS native scroll feel */
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.feed-grid {    
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
}
 
.feed-item {
  position: relative;
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

.price-badge {
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.8rem;
  font-weight: 600;
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
  
@media (max-width: 768px) {
  
  /* keep feed-wrapper as-is so it's still scrollable underneath */
  .feed-wrapper {
    flex-basis: 100%;
  }
}
  
</style>


