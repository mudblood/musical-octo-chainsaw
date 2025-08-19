<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="bg-white w-full max-w-sm p-6 rounded-lg shadow-md">
      <h1 class="text-2xl font-bold text-center mb-6">
        {{ isLogin ? 'Log In' : 'Sign Up' }}
      </h1>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
	  <label class="block text-sm font-medium mb-1">Email address </label>
	  <input
 	     v-model="form.email"
             type="email"
             placeholder=""
             class="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Password</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="Enter password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {{ isLogin ? 'Log In' : 'Sign Up' }}
        </button>
      </form>

      <p class="text-center text-sm mt-4">
        {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
        <button @click="isLogin = !isLogin" class="text-blue-600 underline ml-1">
          {{ isLogin ? 'Sign Up' : 'Log In' }}
        </button>
      </p >
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import axios from 'axios'

const isLogin = ref(true)

const form = reactive({
  email: '',
  password: '',
})

const API = import.meta.env.VITE_API_BASE

const handleSubmit = async () => {
  if (!form.email || !form.password) {
    alert('Please fill in both fields.')
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    alert('Please enter a valid email address.')
    return
  }

  try {
    if (isLogin.value) {
      const res = await axios.post(`${API}/login`, form)
      alert('Login successful 🎉')
    } else {
      const res = await axios.post(`${API}/signup`, form)
      alert(`Signed up: ${form.email}`)
    }
  } catch (err) {
    const msg = err.response?.data?.message || 'Something went wrong'
    alert(`Error: ${msg}`)
  }
}
</script>
