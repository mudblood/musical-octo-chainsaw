<template>
  <div class="max-w-md mx-auto mt-20 p-6 bg-white shadow-md rounded-md">
    <h2 class="text-2xl font-semibold mb-4 text-center">
      <template v-if="stage === 'email'">Login or Create Account</template>
      <template v-else-if="stage === 'login'">Enter Your Password</template>
      <template v-else-if="stage === 'signup'">Create an Account</template>
    </h2>

    <!-- EMAIL INPUT STAGE -->
    <form v-if="stage === 'email'" class="space-y-4" @submit.prevent="checkEmail">
      <input
        type="email"
        v-model="form.email"
        placeholder="Enter your email"
        class="w-full border border-gray-300 rounded px-3 py-2"
      />
      <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
        Continue
      </button>
    </form>

    <!-- PASSWORD INPUT STAGE -->
    <form v-else class="space-y-4" @submit.prevent="handleSubmit">
      <input
        type="password"
        v-model="form.password"
        placeholder="Enter your password"
        class="w-full border border-gray-300 rounded px-3 py-2"
      />
      <button type="submit" class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
        <template v-if="isExistingUser">Login</template>
        <template v-else>Create Account</template>
      </button>
      <button
        type="button"
        @click="goBack"
        class="w-full text-sm text-gray-500 hover:text-gray-700 mt-2"
      >
        ← Back
      </button>
    </form>

    <!-- SUCCESS MESSAGE -->
    <p v-if="successMessage" class="mt-4 text-green-600 text-center">{{ successMessage }}</p>
  </div>
</template>

<script setup> 
import { ref, reactive } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
    
const stage = ref('email') // 'email', 'login', 'signup'
const isExistingUser = ref(false)
const API = import.meta.env.VITE_API_BASE
const error = ref('')
        
const form = reactive({
  email: '', 
  password: '',
})
       
const router = useRouter()
        
// Step 1: Check if the email exists in the database
const checkEmail = async () => {
  if (!form.email) {   
    alert('Please enter an email.')
    return
  }
      
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    alert('Please enter a valid email address.')
    return
  }

  try {
    const res = await axios.post(`${API}/check-email`, { email: form.email })
    isExistingUser.value = res.data.exists
    stage.value = res.data.exists ? 'login' : 'signup'  
  } catch (err) {
    alert('Something went wrong checking the email.')
  }
}       
// Step 2: Handle login or signup based on result
const successMessage = ref('')

const handleSubmit = async () => {
  if (!form.password) {
    alert('Please enter your password.')
    return
  }

  try {
    const route = isExistingUser.value ? '/login' : '/signup'
    const res = await axios.post(`${API}${route}`, {
      email: form.email,
      password: form.password,
    })

    localStorage.setItem('token', res.data.token)
    localStorage.setItem('userEmail', res.data.user.email)

    if (isExistingUser.value) {
      router.push('/feed')
    } else {
      successMessage.value = '✅ Account created successfully!'
      setTimeout(() => router.push('/feed'), 1500)
    }
  } catch (err) {
    const msg = err.response?.data?.message || 'Something went wrong'
    alert(`Error: ${msg}`)
  }
}
    
const goBack = () => {
  stage.value = 'email'
  form.password = ''
  error.value = ''
}
</script>

