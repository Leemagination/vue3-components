import { createApp } from 'vue';
import App from './App.vue';
import myComponent from './components';

const app = createApp(App);
app.use(myComponent);
app.mount('#app');
