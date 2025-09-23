import { createApp } from 'vue'
import { createPinia } from 'pinia'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import ToastService from 'primevue/toastservice'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Dropdown from 'primevue/dropdown'
import Divider from 'primevue/divider'
import Message from 'primevue/message'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Listbox from 'primevue/listbox'
import Tag from 'primevue/tag'
import InputTextarea from 'primevue/textarea'

import 'primeicons/primeicons.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      mode: 'light',
    },
  },
})
app.use(ToastService)

app.component('Button', Button)
app.component('Card', Card)
app.component('InputText', InputText)
app.component('Password', Password)
app.component('Checkbox', Checkbox)
app.component('Dropdown', Dropdown)
app.component('Divider', Divider)
app.component('Message', Message)
app.component('TabView', TabView)
app.component('TabPanel', TabPanel)
app.component('Listbox', Listbox)
app.component('Tag', Tag)
app.component('InputTextarea', InputTextarea)

app.mount('#app')
