<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';
import FeeInput from '../components/FeeInput.vue';

const props = defineProps({ id: String });
const router = useRouter();

const consignor = ref(null);
const items = ref([]);
const payouts = ref([]);

const showAdd = ref(false);
const newItem = ref(emptyItem());
const addError = ref('');
const addSaving = ref(false);

const payoutAmount = ref('');
const payoutNote = ref('');
const payoutError = ref('');
const payoutSaving = ref(false);

function emptyItem() {
  return { description: '', list_price: null, low_price: null, sold_price: null, picked_up: false, fee: 5 };
}

async function load() {
  const [{ data: c }, { data: its }, { data: pays }] = await Promise.all([
    api.get(`/consignors/${props.id}`),
    api.get(`/consignors/${props.id}/items`),
    api.get(`/consignors/${props.id}/payouts`),
  ]);
  consignor.value = c;
  items.value = its;
  payouts.value = pays;
}

onMounted(load);

const totalSold = computed(() =>
  items.value.reduce((s, i) => s + (i.sold_price != null ? Number(i.sold_price) : 0), 0)
);
const totalPaidOut = computed(() =>
  payouts.value.reduce((s, p) => s + Number(p.amount), 0)
);
const balance = computed(() => totalSold.value - totalPaidOut.value);

async function deleteConsignor() {
  const count = items.value.length;
  const warn = count > 0 ? ` This will also delete ${count} item${count === 1 ? '' : 's'}.` : '';
  if (!confirm(`Delete ${consignor.value.name}?${warn}`)) return;
  await api.delete(`/consignors/${props.id}`);
  router.push('/consignors');
}

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

async function addPayout() {
  payoutError.value = '';
  payoutSaving.value = true;
  try {
    const { data } = await api.post(`/consignors/${props.id}/payouts`, {
      amount: payoutAmount.value,
      note: payoutNote.value,
    });
    payouts.value.unshift(data);
    payoutAmount.value = '';
    payoutNote.value = '';
  } catch (e) {
    payoutError.value = e.response?.data?.error || 'Failed to record payment';
  } finally {
    payoutSaving.value = false;
  }
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
      <button class="btn-danger" @click="deleteConsignor">
        <i class="bi bi-trash"></i> Delete Consignor
      </button>
    </div>

    <!-- Financial summary -->
    <div class="consignor-summary">
      <div class="summary-stat">
        <span class="summary-label">Total Sold</span>
        <span class="summary-value">{{ money(totalSold) }}</span>
      </div>
      <div class="summary-stat">
        <span class="summary-label">Paid Out</span>
        <span class="summary-value">− {{ money(totalPaidOut) }}</span>
      </div>
      <div class="summary-stat" :class="balance > 0 ? 'summary-stat--owed' : 'summary-stat--settled'">
        <span class="summary-label">Balance</span>
        <span class="summary-value">{{ money(balance) }}</span>
      </div>
    </div>

    <!-- Items -->
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
          <input type="number" step="0.01" placeholder="Sold $"
            :value="newItem.sold_price ?? ''"
            @input="newItem.sold_price = $event.target.value === '' ? null : Number($event.target.value)" />
          <label><input type="checkbox" v-model="newItem.picked_up" /> Picked up</label>
          <FeeInput v-model="newItem.fee" />
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
            <th>Fee</th>
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
            <td>{{ money(item.fee) }}</td>
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

    <!-- Cash Pickups -->
    <div class="section-header">
      <h2>Cash Pickups</h2>
    </div>

    <div class="add-item-panel">
      <form @submit.prevent="addPayout">
        <div class="add-item-fields">
          <input v-model="payoutAmount" type="number" step="0.01" placeholder="Amount $" required style="max-width:140px" />
          <input v-model="payoutNote" placeholder="Note (optional)" style="flex:2" />
          <button type="submit" :disabled="payoutSaving">
            <i class="bi bi-cash-coin"></i> {{ payoutSaving ? 'Saving…' : 'Record Pickup' }}
          </button>
        </div>
        <p v-if="payoutError" class="error"><i class="bi bi-exclamation-circle"></i> {{ payoutError }}</p>
      </form>
    </div>

    <p v-if="!payouts.length" style="color:#888">No cash pickups recorded yet.</p>
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in payouts" :key="p.id">
            <td>{{ new Date(p.created_at).toLocaleString() }}</td>
            <td>{{ money(p.amount) }}</td>
            <td>{{ p.note || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
  <p v-else style="color:#888">Loading…</p>
</template>
