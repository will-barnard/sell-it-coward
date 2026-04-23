import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import Login from './views/Login.vue';
import Register from './views/Register.vue';
import ItemForm from './views/ItemForm.vue';
import Admin from './views/Admin.vue';
import ChangePassword from './views/ChangePassword.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/items/new', component: ItemForm },
  { path: '/items/:id/edit', component: ItemForm, props: true },
  { path: '/admin', component: Admin },
  { path: '/password', component: ChangePassword },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
