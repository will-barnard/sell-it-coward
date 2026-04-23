<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useAuth } from './store';

const auth = useAuth();
const router = useRouter();

function logout() {
  auth.logout();
  router.push('/');
}
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Items</RouterLink>
      <template v-if="auth.isLoggedIn">
        <RouterLink to="/items/new">Add Item</RouterLink>
        <RouterLink to="/password">Change Password</RouterLink>
        <RouterLink v-if="auth.isAdmin" to="/admin">Admin</RouterLink>
        <span class="user">{{ auth.user.username }}{{ auth.isAdmin ? ' (admin)' : '' }}</span>
        <button @click="logout">Log out</button>
      </template>
      <template v-else>
        <RouterLink to="/login" class="user">Log in</RouterLink>
      </template>
    </nav>
  </header>
  <main>
    <RouterView />
  </main>
</template>
