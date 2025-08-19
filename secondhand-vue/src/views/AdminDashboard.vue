<template>
  <div class="max-w-3xl mx-auto mt-10">
	<div class="flex items-center mb-4">
  	   <div
    	      :class="['w-3 h-3 rounded-full mr-2', isAlive ? 
'bg-green-500 animate-pulse' : 'bg-red-500']"
  	   ></div>
  	   <span class="text-sm text-gray-600">
    		Backend: {{ isAlive ? 'Online' : 'Offline' }}
  	   </span>
	</div>
    <h2 class="text-2xl font-bold mb-4">Admin Dashboard</h2>
    <div v-if="loading">Loading users...</div>

<div v-else>
  <table class="w-full text-left border border-gray-300">
    <thead class="bg-gray-100">
      <tr>
        <th class="py-2 px-4 border-b">Email</th>
        <th class="py-2 px-4 border-b">Signup Date</th>
        <th class="py-2 px-4 border-b">Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in users" :key="user._id">
        <td class="py-2 px-4 border-b">
          <input
            :value="user.email"
            @input="user.email = $event.target.value"
            class="border px-2 py-1 w-full"
          />
        </td>
        <td class="py-2 px-4 border-b">{{ formatDate(user._id) }}</td>
        <td class="py-2 px-4 border-b">
          <button @click="updateUser(user)" class="text-blue-600 mr-2">Save</button>
          <button @click="deleteUser(user._id)" class="text-red-600">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const isAlive = ref(false)

// Heartbeat
const checkBackend = async () => {
  try {
    const res = await axios.get(`${API}/ping`)
    isAlive.value = res.data?.status === 'ok'
  } catch {
    isAlive.value = false
  }
}

// Ping every 5 seconds
onMounted(() => {
  checkBackend()
  setInterval(checkBackend, 5000)
})

const users = ref([])
const loading = ref(true)

const API = import.meta.env.VITE_API_BASE

const fetchUsers = async () => {
  try {
    const res = await axios.get(`${API}/admin/users`)
    users.value = res.data
  } catch (err) {
    alert('Failed to load users')
  } finally {
    loading.value = false
  }
}

const formatDate = (id) => {
  // Use MongoDB _id timestamp as creation date
  const date = new Date(parseInt(id.substring(0, 8), 16) * 1000)
  return date.toLocaleString()
}

const deleteUser = async (id) => {
  if (!confirm('Are you sure you want to delete this user?')) return

  try {
    await axios.delete(`${API}/admin/users/${id}`)
    users.value = users.value.filter(u => u._id !== id)
  } catch (err) {
    alert('Failed to delete user')
  }
}

const updateUser = async (user) => {
  try {
    const res = await axios.put(`${API}/admin/users/${user._id}`, {
      phone: user.phone,
    })
    alert('User updated!')
  } catch (err) {
    alert('Failed to update user')
  }
}

onMounted(fetchUsers)
</script>
