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
  <form class="auth-card" @submit.prevent="submit">
    <h1>Change Password</h1>
    <input v-model="currentPassword" type="password" placeholder="Current password" autocomplete="current-password" />
    <input v-model="newPassword" type="password" placeholder="New password" autocomplete="new-password" />
    <button type="submit"><i class="bi bi-check-lg"></i> Change</button>
    <p v-if="msg" class="msg-success"><i class="bi bi-check-circle"></i> {{ msg }}</p>
    <p v-if="error" class="error"><i class="bi bi-exclamation-circle"></i> {{ error }}</p>
  </form>
</template>
