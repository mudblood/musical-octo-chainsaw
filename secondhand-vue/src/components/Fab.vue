<!-- src/components/Fab.vue -->
<template>
    <button
      v-if="visible" 
      class="fab"
      @click="$emit('click')"
    >
      <img :src="plusIcon" alt="Add something" class="fab-icon" />
    </button>
</template>

<script setup>
import plusIcon from '../assets/plus.svg'

defineProps({
  visible: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.fab {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  font-size: 24px;
  cursor: pointer;
}

.fab-icon {
  color: white;
  width: 96px;
  height: 96px;
  display: inline-block;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
