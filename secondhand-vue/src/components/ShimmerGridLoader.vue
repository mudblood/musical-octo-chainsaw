<template>
  <div class="shimmer-box"></div>
</template>

<script setup>
// no props, no logic — this is just a block with shimmer
</script>

<style>
.shimmer-box {
  width: 100%;
  aspect-ratio: 1 / 1;

  /* shimmer background */
  background: linear-gradient(
    90deg,
    #eee 25%,
    #f5f5f5 50%,
    #eee 75%
  );
  background-size: 200% 100%;
  animation: shimmer 10s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
