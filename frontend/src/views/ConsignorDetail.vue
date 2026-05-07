<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';

const props = defineProps({ id: String });
const router = useRouter();

const consignor = ref(null);
const items = ref([]);

const showAdd = ref(false);
const newItem = ref(emptyItem());
const addError = ref('');
const addSaving = ref(false);

function emptyItem() {
  return { description: '', list_price: null, low_price: null, sold_price: null, picked_up: false };
}

async function load() {
  const [{ data: c }, { data: its }] = await Promise.all([
    api.get(`/consignors/${props.id}`),
    api.get(`/consignors/${props.id}/items`),
  ]);
  consignor.value = c;
  items.value = its;
}

onMounted(load);

async function deleteItem(id) {
  if (!confirm('Delete this item?')) return;
  await api.delete(`/items/${id}`);
  items.value = items.value.filter(i => i.id !== id);
}

async function saveNewItem() {
  addError.value = '';
  addSaving.value = true;
  try {
    const { data } = await api.post('/items', { ...newItem.value, consignor_id: Number(props.id) });
    items.value.unshift(data);
    newItem.value = emptyItem();
    showAdd.value = false;
  } catch (e) {
    addError.value = e.response?.data?.error || 'Failed to add item';
  } finally {
    addSaving.value = false;
  }
}

function cancelAdd() {
  showAdd.value = false;
  newItem.value = emptyItem();
  addError.value = '';
}

function money(v) {
  return v == null ? '—' : `$${Number(v).toFixed(2)}`;
}

function location(c) {
  return [c.street_address, [c.city, c.state].filter(Boolean).join(', '), c.zip]
    .filter(Boolean).join(' · ');
}
</script>

<template>
  <button class="back-link" type="button" @click="router.push('/consignors')">
    <i class="bi bi-arrow-left"></i> Consignors
  </button>

  <div v-if="consignor">
    <div class="page-header">
      <div>
        <h1>{{ consignor.name }}</h1>
        <div class="consignor-meta">
          <span><i class="bi bi-hash"></i> Consignor #{{ consignor.id }}</span>
          <span v-if="location(consignor)"><i class="bi bi-geo-alt"></i> {{ location(consignor) }}</span>
          <span v-if="consignor.mobile_phone"><i class="bi bi-telephone"></i> {{ consignor.mobile_phone }}</span>
          <span v-if="consignor.email"><i class="bi bi-envelope"></i> {{ consignor.email }}</span>
        </div>
      </div>
      <button @click="router.push(`/consignors/${props.id}/edit`)">
        <i class="bi bi-pencil"></i> Edit Consignor
      </button>
    </div>

    <div class="section-header">
      <h2>Items ({{ items.length }})</h2>
      <button @click="showAdd ? cancelAdd() : showAdd = true">
        <i :class="showAdd ? 'bi bi-x-lg' : 'bi bi-plus-lg'"></i>
        {{ showAdd ? 'Cancel' : 'Add Item' }}
      </button>
    </div>

    <div v-if="showAdd" class="add-item-panel">
      <form @submit.prevent="saveNewItem">
        <div class="add-item-fields">
          <input v-model="newItem.description" placeholder="Description" required style="flex:3" />
          <input v-model.number="newItem.list_price" type="number" step="0.01" placeholder="List $" />
          <input v-model.number="newItem.low_price" type="number" step="0.01" placeholder="Low $" />
          <input v-model.number="newItem.sold_price" type="number" step="0.01" placeholder="Sold $" />
          <label><input type="checkbox" v-model="newItem.picked_up" /> Picked up</label>
        </div>
        <div class="form-actions" style="margin-top:0.75rem">
          <button type="submit" :disabled="addSaving">
            <i class="bi bi-plus-lg"></i> {{ addSaving ? 'Saving…' : 'Add Item' }}
          </button>
          <button type="button" @click="cancelAdd">Cancel</button>
        </div>
        <p v-if="addError" class="error"><i class="bi bi-exclamation-circle"></i> {{ addError }}</p>
      </form>
    </div>

    <p v-if="!items.length" style="color:#888">No items for this consignor yet.</p>
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Description</th>
            <th>List</th>
            <th>Low</th>
            <th>Sold</th>
            <th>Picked Up</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.description }}</td>
            <td>{{ money(item.list_price) }}</td>
            <td>{{ money(item.low_price) }}</td>
            <td>{{ money(item.sold_price) }}</td>
            <td>{{ item.picked_up ? 'Yes' : '—' }}</td>
            <td class="row-actions">
              <button class="btn-sm" @click="router.push(`/items/${item.id}/edit`)">
                <i class="bi bi-pencil"></i> Edit
              </button>
              <button class="btn-sm btn-danger" @click="deleteItem(item.id)">
                <i class="bi bi-trash"></i> Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <p v-else style="color:#888">Loading…</p>
</template>
