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
      <RouterLink to="/" class="nav-brand">
        <i class="bi bi-tag-fill"></i> Consignment
      </RouterLink>
      <RouterLink to="/"><i class="bi bi-box-seam"></i> Items</RouterLink>
      <RouterLink to="/reference"><i class="bi bi-book"></i> Reference</RouterLink>
      <template v-if="auth.isLoggedIn">
        <RouterLink to="/consignors"><i class="bi bi-people"></i> Consignors</RouterLink>
        <RouterLink to="/stats"><i class="bi bi-bar-chart-line"></i> Stats</RouterLink>
        <RouterLink to="/password"><i class="bi bi-key"></i> Password</RouterLink>
        <RouterLink v-if="auth.isAdmin" to="/admin"><i class="bi bi-people"></i> Admin</RouterLink>
        <span class="nav-spacer"></span>
        <span class="nav-user"><i class="bi bi-person-circle"></i> {{ auth.user.username }}{{ auth.isAdmin ? ' (admin)' : '' }}</span>
        <button class="btn-logout" @click="logout"><i class="bi bi-box-arrow-right"></i> Log out</button>
      </template>
      <template v-else>
        <span class="nav-spacer"></span>
        <RouterLink to="/login"><i class="bi bi-box-arrow-in-right"></i> Log in</RouterLink>
      </template>
    </nav>
  </header>
  <main>
    <RouterView />
  </main>
</template>
