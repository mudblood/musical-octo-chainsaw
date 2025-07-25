import { createRouter, createWebHistory } from 'vue-router'
import AuthPage from '../views/AuthPage.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import Feed from '../views/Feed.vue'

const routes = [
  { path: '/', component: AuthPage },
  { path: '/feed', component: Feed },
  { path: '/admin', component: AdminDashboard },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
