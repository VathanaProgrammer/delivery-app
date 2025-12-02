import { createApp } from 'vue'
import './style.css'
import Root from './Root.vue'  // <-- minimal root
import router from './router/router.ts'
import i18n from './i18n.js'
import VueGoogleMaps from '@fawmi/vue-google-maps'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createPinia } from 'pinia'

const app = createApp(Root)
app.use(router)
app.use(i18n)
app.use(VueGoogleMaps, {
  load: {
    key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    v: "weekly",
    libraries: "places",
  },
})

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.mount('#app')
