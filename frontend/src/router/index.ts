import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import LoginForm from '../components/LoginForm.vue'
import RegisterForm from '../components/RegisterForm.vue'
import SignOut from '../components/SignOut.vue'
import PostLoginMenu from '../components/PostLoginMenu.vue'
import TodoApp from '../components/TodoApp.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginForm,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterForm,
    },
    {
      path: '/logout',
      name: 'logout',
      component: SignOut,
    },
    {
      path: '/menu',
      name: 'post-login-menu',
      component: PostLoginMenu,
    },
    {
      path: '/todo',
      name: 'todo',
      component: TodoApp,
    },
  ],
})

export default router

