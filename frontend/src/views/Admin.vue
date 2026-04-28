<script setup>
import { ref, onMounted } from 'vue';
import api from '../api';
import { useAuth } from '../store';

const auth = useAuth();
const users = ref([]);
const username = ref('');
const password = ref('');
const isAdminNew = ref(false);
const error = ref('');

async function load() {
  const { data } = await api.get('/users');
  users.value = data;
}

async function createUser() {
  error.value = '';
  try {
    await api.post('/users', {
      username: username.value,
      password: password.value,
      is_admin: isAdminNew.value,
    });
    username.value = '';
    password.value = '';
    isAdminNew.value = false;
    load();
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed';
  }
}

async function remove(id) {
  if (!confirm('Delete this user?')) return;
  await api.delete(`/users/${id}`);
  load();
}

onMounted(() => {
  if (auth.isAdmin) load();
});
</script>

<template>
  <div v-if="!auth.isAdmin">
    <p>Admin access required.</p>
  </div>
  <div v-else>
    <h1>Users</h1>
    <table>
      <thead>
        <tr><th>Username</th><th>Admin</th><th>Created</th><th></th></tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.username }}</td>
          <td>{{ u.is_admin ? 'Yes' : '' }}</td>
          <td>{{ new Date(u.created_at).toLocaleDateString() }}</td>
          <td>
            <button class="btn-sm btn-danger" v-if="u.id !== auth.user.id" @click="remove(u.id)"><i class="bi bi-trash"></i> Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <h2>Add User</h2>
    <form @submit.prevent="createUser">
      <input v-model="username" placeholder="Username" autocomplete="off" />
      <input v-model="password" type="password" placeholder="Password" autocomplete="new-password" />
      <label><input type="checkbox" v-model="isAdminNew" /> Admin</label>
      <div class="form-actions">
        <button type="submit"><i class="bi bi-person-plus"></i> Add User</button>
      </div>
      <p v-if="error" class="error"><i class="bi bi-exclamation-circle"></i> {{ error }}</p>
    </form>
  </div>
</template>
