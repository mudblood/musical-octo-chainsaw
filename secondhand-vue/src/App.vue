<template>
  <!-- Root container for all pages -->
  <router-view />
</template>

<script setup>
// No app-level logic needed yet
</script>

<style>
/* 🌍 GLOBAL STYLES (NOT scoped) */

/* Reset margins and fill the screen */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overscroll-behavior: none;           /* Stops iOS “rubber-band” bounce */
  touch-action: pan-x pan-y;           /* Allows scroll but disables pinch zoom */
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-text-size-adjust: 100%;      /* Stops Safari from resizing text */
}

/* ✅ Ensure sizing is consistent everywhere */
*, *::before, *::after {
  box-sizing: border-box;
}

/* ✅ Base button reset */
button {
  all: unset;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-size: inherit;
  line-height: 1.2;
  transition: background 0.2s ease, color 0.2s ease;
}

/* ✅ Utility button classes */
.btn-floating {
  top: 8px;
  left: 8px;
  padding: 2px 6px;
  margin: 8px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #ddd;
}

.btn-underline {
  font-size: 0.875rem;
  color: #4b5563;
  text-decoration: underline;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
}

/* Icons */
.global-icon {
  width: 48px;
  height: 48px;
  display: inline-block;
}

.icon-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

/* ✅ App container */
#app {
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family:
    Arial,
    sans-serif;
  background-color: #fff;
  font-size: 24px;
}

/* ✅ Smooth slide for chat panel */
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* ✅ Mobile: chat covers feed fully */
@media (max-width: 768px) {
  .chat-panel {
    flex-basis: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 20;
  }
}
</style>
