<script setup>
import { ref } from 'vue';
import api from '../api';

const currentPassword = ref('');
const newPassword = ref('');
const msg = ref('');
const error = ref('');

async function submit() {
  msg.value = '';
  error.value = '';
  try {
    await api.post('/auth/password', {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    });
    msg.value = 'Password changed.';
    currentPassword.value = '';
    newPassword.value = '';
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed';
  }
}
</script>

<template>
  <form @submit.prevent="submit">
    <h1>Change Password</h1>
    <input v-model="currentPassword" type="password" placeholder="Current password" autocomplete="current-password" />
    <input v-model="newPassword" type="password" placeholder="New password" autocomplete="new-password" />
    <button type="submit">Change</button>
    <p v-if="msg">{{ msg }}</p>
    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>
