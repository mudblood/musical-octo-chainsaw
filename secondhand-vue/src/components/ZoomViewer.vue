<template>
  <div  
    class="zoom-overlay"
    :style="overlayStyle"
    @click.self="$emit('close')"
    tabindex="0"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <!-- prev listing -->
    <img
      v-if="prevListing"
      class="zoomed-image prev-image"
      :src="`${API}${prevListing.photos[0]}`"
      :style="listingStyles.prev"
    />

    <!-- current listing -->
    <img
      v-if="currentListing"
      class="zoomed-image"
      :src="`${API}${currentListing.photos[currentPhotoIndex]}`"
      :alt="currentListing.altText || 'Zoomed listing image'"
      :style="listingStyles.current"
    />

    <!-- next listing -->
    <img
      v-if="nextListing"
      class="zoomed-image next-image"
      :src="`${API}${nextListing.photos[0]}`"
      :style="listingStyles.next"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

const dragY = ref(0)
const dragX = ref(0)
const dragging = ref(false)
let startX = 0
let startY = 0
let axis = null

const props = defineProps({
  listing: Object,
  API: String,
  listings: Array
})

const emit = defineEmits(['close', 'navigate'])

// 🔑 local state for current listing index
const currentListingIndex = ref(
  props.listings.findIndex(item => item._id === props.listing._id)
)

// index of photo within current listing
const currentPhotoIndex = ref(0)

// computed references
const currentListing = computed(() => props.listings[currentListingIndex.value] || null)
const prevListing = computed(() =>
  currentListingIndex.value > 0 ? props.listings[currentListingIndex.value - 1] : null
)
const nextListing = computed(() =>
  currentListingIndex.value < props.listings.length - 1 ? props.listings[currentListingIndex.value + 1] : null
)

// reactive reference for viewport width
const vw = ref(window.innerWidth)

const handleResize = () => {
  vw.value = window.innerWidth
  // cancel any partial drags when the viewport changes
  dragX.value = 0
  dragY.value = 0
  dragging.value = false
  axis = null
}

const onTouchStart = (e) => {
  const t = e.touches[0]
  startX = t.clientX
  startY = t.clientY
  dragY.value = 0
  dragX.value = 0
  dragging.value = false
  axis = null
}

const onTouchMove = (e) => {
  const t = e.touches[0]
  const dx = t.clientX - startX
  const dy = t.clientY - startY

  if (!axis) axis = Math.abs(dy) > Math.abs(dx) ? 'y' : 'x'

  if (axis === 'y') {
    dragging.value = true
    dragY.value = dy
    e.preventDefault()
  } else {
    dragging.value = true
    dragX.value = dx
    e.preventDefault()
  }
}

const onTouchEnd = () => {
  const threshold = 120
  if (axis === 'y') {   
    if (Math.abs(dragY.value) > threshold) {
      emit('close') 
    } else {
      dragX.value = 0
      dragY.value = 0   
    }
  } else if (axis === 'x') {
    if (dragX.value > threshold && prevListing.value) {
      currentListingIndex.value--
      emit('navigate', props.listings[currentListingIndex.value])
    } else if (dragX.value < -threshold && nextListing.value) {
      currentListingIndex.value++
      emit('navigate', props.listings[currentListingIndex.value])
    }
    dragX.value = 0
    dragY.value = 0  
  }
  dragging.value = false
  axis = null
}

const listingStyles = computed(() => {
  const x = dragX.value
  const y = dragY.value

  const fade = axis === 'y'
    ? 1 - Math.min(Math.abs(y) / 300, 0.4)
    : 1

  const scale = axis === 'y' && y > 0
    ? 1 - Math.min(y / 1000, 0.05)
    : 1

  const baseStyle = (offsetX = 0, offsetY = 0) => ({
    transform: `translate3d(${x + offsetX}px, ${y + offsetY}px, 0) scale(${scale})`,
    opacity: fade,
    transition: dragging.value ? 'none' : 'transform 200ms ease, opacity 200ms ease'
  })

  return {
    current: baseStyle(0, 0),
    prev: baseStyle(-vw.value, 0),
    next: baseStyle(vw.value, 0)
  }
})

const overlayStyle = computed(() => {
  const y = dragY.value
  const bgOpacity = y > 0
    ? 1 - Math.min(Math.abs(y) / 500, 0.12)
    : 1
  return {
    background: `rgba(255,255,255,${bgOpacity})`,
    transition: dragging.value ? 'none' : 'background 200ms ease'
  }
})

// Preload current listing images
watch(currentListing, (val) => {
  if (val && Array.isArray(val.photos)) {
    val.photos.forEach((src) => {
      const img = new Image()
      img.src = `${props.API}${src}`
    })
  }
})

// Keyboard navigation
const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    emit('close')
  } else if (e.key === 'ArrowDown') {
    if (currentListing.value && currentPhotoIndex.value < currentListing.value.photos.length - 1) {
      currentPhotoIndex.value++
    }
  } else if (e.key === 'ArrowUp') {
    if (currentPhotoIndex.value > 0) {
      currentPhotoIndex.value--
    }
  } else if (e.key === 'ArrowLeft' && prevListing.value) {
    currentListingIndex.value--
    emit('navigate', props.listings[currentListingIndex.value])
  } else if (e.key === 'ArrowRight' && nextListing.value) {
    currentListingIndex.value++
    emit('navigate', props.listings[currentListingIndex.value])
  }
}

onMounted(async () => {
  await nextTick()
  document.querySelector('.zoom-overlay')?.focus()
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
html, body {
  overscroll-behavior: contain;
  touch-action: none;
}
.zoom-overlay {
  position: fixed;
  inset: 0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  touch-action: none;
  pointer-events: auto;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  overflow: hidden;
}
.zoomed-image {
  position: absolute;
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  will-change: transform, opacity;
  transition: transform 0.3s ease;
}
.prev-image,
.next-image {
  left: 0;
}
</style>
