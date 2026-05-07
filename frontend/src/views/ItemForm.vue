<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';
import FeeInput from '../components/FeeInput.vue';

const props = defineProps({ id: String });
const router = useRouter();

const item = ref({
  consignor_id: null,
  description: '',
  list_price: null,
  low_price: null,
  sold_price: null,
  picked_up: false,
  fee: 5,
});
const error = ref('');
const saving = ref(false);

onMounted(async () => {
  const { data: it } = await api.get(`/items/${props.id}`);
  item.value = {
    consignor_id: it.consignor_id,
    description: it.description,
    list_price: it.list_price != null ? Number(it.list_price) : null,
    low_price: it.low_price != null ? Number(it.low_price) : null,
    sold_price: it.sold_price != null ? Number(it.sold_price) : null,
    picked_up: it.picked_up,
    fee: it.fee != null ? Number(it.fee) : 5,
  };
});

async function submit() {
  error.value = '';
  saving.value = true;
  try {
    await api.put(`/items/${props.id}`, item.value);
    router.push(`/consignors/${item.value.consignor_id}`);
  } catch (e) {
    error.value = e.response?.data?.error || 'Save failed';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <button class="back-link" type="button" v-if="item.consignor_id"
    @click="router.push(`/consignors/${item.consignor_id}`)">
    <i class="bi bi-arrow-left"></i> Back to consignor
  </button>
  <form @submit.prevent="submit">
    <h1>Edit Item</h1>
    <fieldset>
      <legend>Item</legend>
      <input v-model="item.description" placeholder="Description" required />
      <input v-model.number="item.list_price" type="number" step="0.01" placeholder="List Price" />
      <input v-model.number="item.low_price" type="number" step="0.01" placeholder="Low Price" />
      <input v-model.number="item.sold_price" type="number" step="0.01" placeholder="Sold Price" />
      <label><input type="checkbox" v-model="item.picked_up" /> Picked up</label>
      <div style="margin:0.5rem 0 0.25rem">
        <label style="display:block;font-size:0.85rem;margin-bottom:0.3rem">Fee</label>
        <FeeInput v-model="item.fee" />
      </div>
    </fieldset>
    <div class="form-actions">
      <button type="submit" :disabled="saving">
        <i class="bi bi-floppy"></i> {{ saving ? 'Saving…' : 'Save' }}
      </button>
      <button type="button"
        @click="router.push(item.consignor_id ? `/consignors/${item.consignor_id}` : '/')">
        Cancel
      </button>
    </div>
    <p v-if="error" class="error"><i class="bi bi-exclamation-circle"></i> {{ error }}</p>
  </form>
</template>
