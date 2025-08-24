<template>
    <button
      v-if="visible"
      class=“header
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
.header {
  position: fixed;
  top: 0px;
  height: 200px
}

.fab-icon {
  color: white;
  width: 96px;
  height: 96px;
  display: inline-block;
}

</style>
