import { createApp } from 'vue'
import { createVuetify } from 'vuetify'

import App from './App.vue'

import './registerServiceWorker'
import router from './router'
import services from './services'

import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import {createPinia} from "pinia";

const vuetify = createVuetify({
    components,
    directives
})
const pinia = createPinia();
const app = createApp(App);

app.use(router)
    .use(vuetify)
    .use(services)
    .use(pinia)
    .mount('#app')
