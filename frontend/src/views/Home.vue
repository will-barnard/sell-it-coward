<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';
import { useAuth } from '../store';

const items = ref([]);
const search = ref('');
const auth = useAuth();
const router = useRouter();

async function load() {
  const { data } = await api.get('/items', { params: { search: search.value } });
  items.value = data;
}

let debounce;
watch(search, () => {
  clearTimeout(debounce);
  debounce = setTimeout(load, 250);
});

onMounted(load);

async function remove(id) {
  if (!confirm('Delete this item?')) return;
  await api.delete(`/items/${id}`);
  load();
}

function money(v) {
  return v == null ? '—' : `$${Number(v).toFixed(2)}`;
}
</script>

<template>
  <h1>Consigned Items</h1>
  <input class="search" v-model="search" placeholder="Search items…" />
  <p v-if="!items.length">No items {{ search ? 'match that search' : 'yet' }}.</p>
  <table v-else>
    <thead>
      <tr>
        <th>ID</th>
        <th>Item</th>
        <th v-if="auth.isLoggedIn">Consignor</th>
        <th>List</th>
        <th v-if="auth.isLoggedIn">Low</th>
        <th v-if="auth.isLoggedIn">Sold</th>
        <th v-if="auth.isLoggedIn">Picked Up</th>
        <th v-else>Status</th>
        <th v-if="auth.isLoggedIn"></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item.id">
        <td>{{ item.id }}</td>
        <td>{{ item.description }}</td>
        <td v-if="auth.isLoggedIn">{{ item.consignor_name }}</td>
        <td>{{ money(item.list_price) }}</td>
        <template v-if="auth.isLoggedIn">
          <td>{{ money(item.low_price) }}</td>
          <td>{{ money(item.sold_price) }}</td>
          <td>{{ item.picked_up ? 'Yes' : 'No' }}</td>
          <td class="row-actions">
            <button @click="router.push(`/items/${item.id}/edit`)">Edit</button>
            <button @click="remove(item.id)">Delete</button>
          </td>
        </template>
        <template v-else>
          <td>{{ item.sold ? 'Sold' : 'Available' }}</td>
        </template>
      </tr>
    </tbody>
  </table>
</template>
