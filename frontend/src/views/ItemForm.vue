<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api';

const route = useRoute();
const router = useRouter();
const editId = route.params.id;

const consignors = ref([]);
const newConsignor = ref(false);
const item = ref({
  consignor_id: '',
  description: '',
  list_price: null,
  low_price: null,
  sold_price: null,
  picked_up: false,
});
const consignor = ref({
  name: '',
  street_address: '',
  city: '',
  state: '',
  zip: '',
  mobile_phone: '',
  email: '',
});
const error = ref('');
const saving = ref(false);

onMounted(async () => {
  const { data } = await api.get('/consignors');
  consignors.value = data;
  if (editId) {
    const { data: it } = await api.get(`/items/${editId}`);
    item.value = {
      consignor_id: it.consignor_id,
      description: it.description,
      list_price: it.list_price != null ? Number(it.list_price) : null,
      low_price: it.low_price != null ? Number(it.low_price) : null,
      sold_price: it.sold_price != null ? Number(it.sold_price) : null,
      picked_up: it.picked_up,
    };
  }
});

async function submit() {
  error.value = '';
  saving.value = true;
  try {
    if (!editId && newConsignor.value) {
      const { data } = await api.post('/consignors', consignor.value);
      item.value.consignor_id = data.id;
    }
    if (!item.value.consignor_id) {
      error.value = 'Pick or create a consignor.';
      return;
    }
    if (editId) {
      await api.put(`/items/${editId}`, item.value);
    } else {
      await api.post('/items', item.value);
    }
    router.push('/');
  } catch (e) {
    error.value = e.response?.data?.error || 'Save failed';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="submit">
    <h1>{{ editId ? 'Edit Item' : 'Add Item' }}</h1>

    <fieldset v-if="!editId">
      <legend>Consignor</legend>
      <label>
        <input type="checkbox" v-model="newConsignor" />
        New consignor
      </label>
      <template v-if="newConsignor">
        <input v-model="consignor.name" placeholder="Name" />
        <input v-model="consignor.street_address" placeholder="Street Address" />
        <input v-model="consignor.city" placeholder="City" />
        <input v-model="consignor.state" placeholder="State" />
        <input v-model="consignor.zip" placeholder="Zip" />
        <input v-model="consignor.mobile_phone" placeholder="Mobile Phone" />
        <input v-model="consignor.email" type="email" placeholder="Email" />
      </template>
      <select v-else v-model="item.consignor_id">
        <option value="" disabled>Select consignor…</option>
        <option v-for="c in consignors" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </fieldset>

    <fieldset>
      <legend>Item</legend>
      <input v-model="item.description" placeholder="Description" />
      <input v-model.number="item.list_price" type="number" step="0.01" placeholder="List Price" />
      <input v-model.number="item.low_price" type="number" step="0.01" placeholder="Low Price" />
      <input v-model.number="item.sold_price" type="number" step="0.01" placeholder="Sold Price" />
      <label><input type="checkbox" v-model="item.picked_up" /> Picked up</label>
    </fieldset>

    <button type="submit" :disabled="saving">{{ saving ? 'Saving…' : 'Save' }}</button>
    <button type="button" @click="router.push('/')">Cancel</button>
    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>
