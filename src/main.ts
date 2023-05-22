import { createApp } from 'vue'
import App from './App.vue'
import LeeComponent from './components'
const app = createApp(App)
app.use(LeeComponent)
app.mount('#app')
