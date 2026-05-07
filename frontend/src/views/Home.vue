<script setup>
import { ref, onMounted, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
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
  <div class="search-wrap">
    <i class="bi bi-search search-icon"></i>
    <input class="search" v-model="search" placeholder="Search items…" />
  </div>
  <p v-if="!items.length">No items {{ search ? 'match that search' : 'yet' }}.</p>
  <div v-else class="table-wrap">
    <table>
      <thead>
        <tr>
          <th v-if="auth.isLoggedIn">ID</th>
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
          <td v-if="auth.isLoggedIn">{{ item.id }}</td>
          <td>{{ item.description }}</td>
          <td v-if="auth.isLoggedIn">
              <RouterLink :to="`/consignors/${item.consignor_id}`">{{ item.consignor_name }}</RouterLink>
            </td>
          <td>{{ money(item.list_price) }}</td>
          <template v-if="auth.isLoggedIn">
            <td>{{ money(item.low_price) }}</td>
            <td>{{ money(item.sold_price) }}</td>
            <td>{{ item.picked_up ? 'Yes' : '—' }}</td>
            <td class="row-actions">
              <button class="btn-sm" @click="router.push(`/items/${item.id}/edit`)"><i class="bi bi-pencil"></i> Edit</button>
              <button class="btn-sm btn-danger" @click="remove(item.id)"><i class="bi bi-trash"></i> Delete</button>
            </td>
          </template>
          <template v-else>
            <td>
              <span :class="item.sold ? 'badge badge-sold' : 'badge badge-available'">
                {{ item.sold ? 'Sold' : 'Available' }}
              </span>
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>
