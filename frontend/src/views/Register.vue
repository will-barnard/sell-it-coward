<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';
import { useAuth } from '../store';

const username = ref('');
const password = ref('');
const error = ref('');
const allowed = ref(null);
const auth = useAuth();
const router = useRouter();

onMounted(async () => {
  const { data } = await api.get('/auth/status');
  allowed.value = data.registrationOpen;
});

async function submit() {
  error.value = '';
  try {
    const { data } = await api.post('/auth/register', {
      username: username.value,
      password: password.value,
    });
    auth.setAuth(data.token, data.user);
    router.push('/');
  } catch (e) {
    error.value = e.response?.data?.error || 'Registration failed';
  }
}
</script>

<template>
  <h1>Register first admin</h1>
  <p v-if="allowed === null">Loading…</p>
  <p v-else-if="!allowed">
    Registration is closed. An admin can create additional user logins from the Admin page.
  </p>
  <form v-else @submit.prevent="submit">
    <p>The first registered user becomes the admin.</p>
    <input v-model="username" placeholder="Username" autofocus autocomplete="username" />
    <input v-model="password" type="password" placeholder="Password" autocomplete="new-password" />
    <button type="submit">Register</button>
    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>
