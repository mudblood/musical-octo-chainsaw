<template>
  <div id="chat-box" class="chat-messages">
    <div
      v-for="(msg, index) in messages"
      :key="index"
      :class="['chat-bubble', msg.sender]"
    >
      <div v-if="msg.text">{{ msg.text }}</div>
      <img
        v-if="msg.image"
        :src="msg.image"
        class="chat-image"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, nextTick, onMounted } from 'vue'

const emit = defineEmits(['listing-ready'])
const userEmail = localStorage.getItem('userEmail') || ''



// 🟠 State for messages & listing
const messages = reactive([
  { sender: 'assistant', text: userEmail ? `Hi, ${userEmail}! What would you like to post?` : "Hi! What do you want to post?" }
])

const listingState = reactive({
  description: '',
  photos: [],
  price: null
})

// 📤 Exposed method for parent
function addMessage({ text, images, price }) {
  if (text) {
    messages.push({ sender: 'user', text })
    if (!listingState.description) listingState.description = text
  }

  if (images && images.length > 0) {
    images.forEach(img => {
      messages.push({ sender: 'user', image: URL.createObjectURL(img) })
      listingState.photos.push(img)
    })
    messages.push({ sender: 'assistant', text: "Nice photo! Thanks for adding it." })
  }

  // ✅ store price if provided
  if (price) {
    listingState.price = price
  }

  // Think and respond
  const reply = getAssistantReply()
  if (reply) {
    messages.push({ sender: 'assistant', text: reply })
  }

  scrollToBottom()

  // 🔥 Trigger listing if ready
  if (listingState.description && listingState.photos.length > 0) {
    emit('listing-ready', {
      description: listingState.description,
      photos: listingState.photos,
      price: listingState.price  // ✅ pass price when listing is ready
    })
  }
}

// 📜 Assistant reply logic
function getAssistantReply() {
  if (!listingState.description) {
    return randomReply([
      "What are you selling today?",
      "Can you describe the item for me?",
      "What do you have for sale?"
    ])
  }
  if (listingState.description && listingState.photos.length === 0) {
    return randomReply([
      "Looks good! Could you upload at least one photo?",
      "Can you attach a picture so buyers can see it?",
      "Awesome! Add a photo to show what it looks like."
    ])
  }
  if (listingState.description && listingState.photos.length > 0) {
    return "Perfect! I have everything I need. Posting it now ✅"
  }
}

function randomReply(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function scrollToBottom() {
  await nextTick()
  const el = document.getElementById('chat-box')
  if (el) el.scrollTop = el.scrollHeight
}

defineExpose({ addMessage })
</script>

<style scoped>
.chat-messages {
  width: 100%;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 0;
}
.chat-bubble {
  border-radius: 0.5rem;
  max-width: 100%;
  word-wrap: break-word;
  padding: 8px;
}
.chat-bubble.user {
  align-self: flex-end;
  background-color: #d1fae5;
  margin-right:8px;
}
.chat-bubble.assistant {
  align-self: flex-start;
  background-color: #f3f4f6;
  margin-left:8px;
}
.chat-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 0.5rem;
}
</style>
