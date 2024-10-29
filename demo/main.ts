import { createApp } from 'vue';
import Demo from './demo.vue';
import myComponent from '../src/components/index';

const app = createApp(Demo);
app.use(myComponent);
app.mount('#app');
