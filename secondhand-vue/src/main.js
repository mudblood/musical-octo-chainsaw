import { createApp } from 'vue'
import App from './App.vue'
import TouchEvents from 'vue3-touch-events'
import './assets/main.css'
import router from './router'

const app = createApp(App)     // create the app instance first
app.use(router)                // use the router
app.use(TouchEvents)          // use vue3-touch-events
app.mount('#app')             // mount the app



