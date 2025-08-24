<template>
  <div class="main-layout">

    <!-- Seller assistant side panel -->
    <transition name="slide" mode="out-in" @after-enter="onChatAfterEnter">
      <div v-show="openChat" class="chat-panel">
        <SellerAssistant
          ref="sellerAssistant"
          :isActive="openChat"
          @listed="handleListed"
          @close="openChat = false"
        />
      </div>
    </transition>

    <!-- Feed area -->
    <div class="feed-wrapper">
      <div class="feed-grid">
        <!-- Loading state -->
        <template v-if="loading">
          <ShimmerGridLoader v-for="n in 12" :key="n" />
        </template>

        <!-- Loaded state -->
        <template v-else>
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
            <!-- Show shimmer while image not loaded -->
            <ShimmerGridLoader v-if="!imageLoadedMap[listing._id]" />

            <img
              v-show="imageLoadedMap[listing._id]"
              :src="`${API}${listing.photos[0]}`"
              :alt="listing.altText || 'Listing image'"
              class="feed-image"
              @load="imageLoadedMap[listing._id] = true"
            />

            <div v-if="listing.price" class="price-badge">
              {{ formatPrice(listing.price) }}
            </div>
          </div>
        </template>
      </div>
      
      <Fab :visible="!openChat && !zoomedListing" @click="openChat = true"></Fab>
    </div>
  </div>

  <!-- Fullscreen viewer -->
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
import ShimmerGridLoader from '../components/ShimmerGridLoader.vue'
import Fab from '../components/Fab.vue'

const ZoomViewer = defineAsyncComponent(() =>
  import('../components/ZoomViewer.vue')
)

const API = import.meta.env.VITE_API_BASE
const listings = ref([])
const items = ref([])
const openChat = ref(false)
const sellerAssistant = ref(null)
const zoomedListing = ref(null)
const loading = ref(true)
const imageLoadedMap = ref({})

function onChatAfterEnter() {
  nextTick(() => sellerAssistant.value?.focusInput?.())
}

const fetchListings = async () => {
  try {
    loading.value = true
    const res = await axios.get(`${API}/listings`)
    listings.value = res.data
    imageLoadedMap.value = Object.fromEntries(
      listings.value.map((l) => [l._id, false])
    )
  } catch (err) {
    console.error('Failed to fetch listings:', err)
  } finally {
    loading.value = false
  }
}

const handleListed = async () => {
  await fetchListings()
}

function formatPrice(value) {
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
    case 'ArrowRight':
      if ((index + 1) % cols !== 0) targetIndex = index + 1
      break
    case 'ArrowLeft':
      if (index % cols !== 0) targetIndex = index - 1
      break
    case 'ArrowDown':
      if (index + cols < total) targetIndex = index + cols
      break
    case 'ArrowUp':
      if (index - cols >= 0) targetIndex = index - cols
      break
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

.main-layout {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 100dvh;
  overflow: hidden;
}

.chat-panel {
  flex-basis: 25%;
  min-width: 300px;
  max-width: 400px;
  background: white;
  z-index: 10;
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
  -webkit-overflow-scrolling: touch;
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
