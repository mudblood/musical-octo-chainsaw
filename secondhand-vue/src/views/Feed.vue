<template>
  <div class="feed-grid">
    <div v-for="item in feedItems" :key="item._id" class="feed-item">
      <img
        :src="item.imageUrl"
        :alt="item.altText || 'Product image'"
        class="feed-image"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const feedItems = ref([])
const API = import.meta.env.VITE_API_BASE

const fetchFeed = async () => {
  try {
    const res = await axios.get(`${API}/api/feed`)
    feedItems.value = res.data
  } catch (err) {
    console.error('Failed to fetch feed:', err)
  }
}

onMounted(fetchFeed)
</script>

<style scoped>
.feed-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.feed-item {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
}

.feed-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
