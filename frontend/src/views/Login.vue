<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import api from '../api';
import { useAuth } from '../store';

const username = ref('');
const password = ref('');
const error = ref('');
const registrationOpen = ref(false);
const auth = useAuth();
const router = useRouter();

onMounted(async () => {
  const { data } = await api.get('/auth/status');
  registrationOpen.value = data.registrationOpen;
});

async function submit() {
  error.value = '';
  try {
    const { data } = await api.post('/auth/login', {
      username: username.value,
      password: password.value,
    });
    auth.setAuth(data.token, data.user);
    router.push('/');
  } catch (e) {
    error.value = e.response?.data?.error || 'Login failed';
  }
}
</script>

<template>
  <form @submit.prevent="submit">
    <h1>Log in</h1>
    <input v-model="username" placeholder="Username" autofocus autocomplete="username" />
    <input v-model="password" type="password" placeholder="Password" autocomplete="current-password" />
    <button type="submit">Log in</button>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="registrationOpen">
      No users yet — <RouterLink to="/register">register the first admin</RouterLink>.
    </p>
  </form>
</template>
