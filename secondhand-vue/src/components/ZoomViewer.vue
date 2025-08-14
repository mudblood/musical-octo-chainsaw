<template>

  <div
    class="zoom-overlay"
    @click.self="$emit('close')"
    tabindex="0"
    v-touch:swipe.down="onSwipeDown"
    v-touch:swipe.left="onSwipeLeft"
    v-touch:swipe.right="onSwipeRight"
  >
  <transition name ="fade" mode="out-in">
    <img
      :src="`${API}${listing.photos[currentIndex]}`"
      :alt="listing.altText || 'Zoomed listing image'"
      class="zoomed-image"
    />
  </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'

const props = defineProps({
  listing: Object,
  API: String,
  listings: Array
})

const emit = defineEmits(['close', 'navigate'])
const currentIndex = ref(0)

// ✅ Preload all images in the current listing
watch(() => props.listing, (val) => {
  if (val && Array.isArray(val.photos)) {
    val.photos.forEach((src) => {
      const img = new Image()
      img.src = `${props.API}${src}`
    })
  }
})

// Touch events swipe handlers
const onSwipeDown = () => {
  console.log('⬇️ Swiped down')
  emit('close')
}

const onSwipeLeft = () => {
  console.log('⬅️ Swiped left')
  const index = props.listings.findIndex(item => item._id === 
props.listing._id)
  if (index < props.listings.length - 1) {
    emit('navigate', props.listings[index + 1])
  }
}

const onSwipeRight = () => {
  console.log('➡️ Swiped right')
  const index = props.listings.findIndex(item => item._id === 
props.listing._id)
  if (index > 0) {
    emit('navigate', props.listings[index - 1])
  }
}

const handleKeydown = (e) => {
  const listingIndex = props.listings.findIndex(item => item._id === props.listing._id)

  if (e.key === 'Escape') {
    emit('close')
  }

  // 🔽 Scroll to next image in current listing
  else if (e.key === 'ArrowDown') {
    if (currentIndex.value < props.listing.photos.length - 1) {
      currentIndex.value++
    }
  }
  // 🔼 Scroll to previous image in current listing
  else if (e.key === 'ArrowUp') {
    if (currentIndex.value > 0) {
      currentIndex.value--
    }
  }
    
  // ⬅️ Go to previous listing
  else if (e.key === 'ArrowLeft' && listingIndex > 0) {
    emit('navigate', props.listings[listingIndex - 1])
  }
  
  // ➡️ Go to next listing
  else if (e.key === 'ArrowRight' && listingIndex < props.listings.length - 1) {
    emit('navigate', props.listings[listingIndex + 1])
  }
}
    
onMounted(async () => {
  await nextTick()
  document.querySelector('.zoom-overlay')?.focus()
  document.body.style.overflow = 'hidden' // prevent feed from scrolling
  window.addEventListener('keydown', handleKeydown)
})
     
onUnmounted(() => {
  document.body.style.overflow = '' // restore feed scroll
  window.removeEventListener('keydown', handleKeydown)
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
  touch-action: none; /* Prevent browser gestures interfering */
  pointer-events: auto;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
.zoomed-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain; 
  border-radius: 0px;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
} 
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

