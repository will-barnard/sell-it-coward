import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import Login from './views/Login.vue';
import Register from './views/Register.vue';
import ItemForm from './views/ItemForm.vue';
import Admin from './views/Admin.vue';
import ChangePassword from './views/ChangePassword.vue';
import Stats from './views/Stats.vue';
import ConsignorList from './views/ConsignorList.vue';
import ConsignorForm from './views/ConsignorForm.vue';
import ConsignorDetail from './views/ConsignorDetail.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/consignors', component: ConsignorList },
  { path: '/consignors/new', component: ConsignorForm },
  { path: '/consignors/:id/edit', component: ConsignorForm, props: true },
  { path: '/consignors/:id', component: ConsignorDetail, props: true },
  { path: '/items/:id/edit', component: ItemForm, props: true },
  { path: '/admin', component: Admin },
  { path: '/password', component: ChangePassword },
  { path: '/stats', component: Stats },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
