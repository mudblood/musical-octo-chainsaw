<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center 
justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
     <h2 class="text-xl font-bold mb-4">What are you selling today?</h2>
     
     <div v-if="loading" class="text-sm text-gray-500 mb-2">Converting images, please 
wait...</div>

      <input
        type="file"
        accept="image/*"
        multiple
        @change="handleFiles"
        class="mb-4"
      />

      <textarea
        v-model="message"
        placeholder="Describe your item (e.g. Vintage Jonelle gold plated 
non clasp necklace. $9)"
        class="w-full border p-2 rounded mb-4"
      ></textarea>

      <div class="flex justify-between">
        <button @click="submit" class="bg-green-600 text-white px-4 py-2 
rounded">Post</button>
        <button @click="$emit('listed')" class="text-gray-600 
underline">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import heic2any from 'heic2any'

const loading = ref(false)
const message = ref('')
const images = ref([])
const emit = defineEmits(['close','listed'])
const API = import.meta.env.VITE_API_BASE

const handleFiles = async (e) => {
  loading.value = true
  const fileList = Array.from(e.target.files)
  const converted = []

  for (const file of fileList) {
    if (file.type === 'image/heic' || file.name.endsWith('.HEIC')) {
      try {
        const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.8 })
        const jpegFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), {
          type: 'image/jpeg',
        })
        converted.push(jpegFile)
      } catch (err) {
        console.error('Failed to convert HEIC:', err)
        alert('Failed to convert one of your HEIC images.')
      }
    } else {
      converted.push(file)
    }
  }

  images.value = converted
  loading.value = false
}

const submit = async () => {
  if (!message.value || images.value.length === 0) {
    alert('Please add photos and a description.')
    return
  }

  try {
    const formData = new FormData()
    formData.append('message', message.value)
    images.value.forEach((img) => formData.append('photos', img))

    await axios.post(`${API}/listings`, formData)

    alert('Item listed!')
    message.value = ''
    images.value = []
    emit('listed')
    emit('close')
  } catch (err) {
    alert('Something went wrong. Please try again.')
  }
}
</script>
