<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import api from '../api';

const consignors = ref([]);
const router = useRouter();

onMounted(async () => {
  const { data } = await api.get('/consignors');
  consignors.value = data;
});
</script>

<template>
  <div class="page-header">
    <h1><i class="bi bi-people"></i> Consignors</h1>
    <button @click="router.push('/consignors/new')">
      <i class="bi bi-person-plus"></i> New Consignor
    </button>
  </div>
  <p v-if="!consignors.length">No consignors yet.</p>
  <div v-else class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Location</th>
          <th>Phone</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in consignors" :key="c.id">
          <td><RouterLink :to="`/consignors/${c.id}`">{{ c.name }}</RouterLink></td>
          <td>{{ [c.city, c.state].filter(Boolean).join(', ') || '—' }}</td>
          <td>{{ c.mobile_phone || '—' }}</td>
          <td>{{ c.email || '—' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
