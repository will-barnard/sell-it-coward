<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';
import FeeInput from '../components/FeeInput.vue';

const props = defineProps({ id: String });
const router = useRouter();

const isEdit = computed(() => !!props.id);

const consignor = ref({
  name: '',
  street_address: '',
  city: '',
  state: '',
  zip: '',
  mobile_phone: '',
  email: '',
});

const items = ref([emptyItem()]);

function emptyItem() {
  return { description: '', list_price: null, low_price: null, sold_price: null, picked_up: false, fee: 5 };
}
function addItemRow() { items.value.push(emptyItem()); }
function removeItemRow(i) { items.value.splice(i, 1); }

const error = ref('');
const saving = ref(false);

onMounted(async () => {
  if (isEdit.value) {
    const { data } = await api.get(`/consignors/${props.id}`);
    consignor.value = {
      name: data.name || '',
      street_address: data.street_address || '',
      city: data.city || '',
      state: data.state || '',
      zip: data.zip || '',
      mobile_phone: data.mobile_phone || '',
      email: data.email || '',
    };
  }
});

async function submit() {
  error.value = '';
  saving.value = true;
  try {
    let cid = props.id;
    if (isEdit.value) {
      await api.put(`/consignors/${cid}`, consignor.value);
    } else {
      const { data } = await api.post('/consignors', consignor.value);
      cid = data.id;
      for (const item of items.value) {
        if (item.description.trim()) {
          await api.post('/items', { ...item, consignor_id: cid });
        }
      }
    }
    router.push(`/consignors/${cid}`);
  } catch (e) {
    error.value = e.response?.data?.error || 'Save failed';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <button class="back-link" type="button"
    @click="router.push(isEdit ? `/consignors/${props.id}` : '/consignors')">
    <i class="bi bi-arrow-left"></i> {{ isEdit ? 'Back to consignor' : 'Consignors' }}
  </button>
  <form @submit.prevent="submit">
    <h1>{{ isEdit ? 'Edit Consignor' : 'Add Consignor' }}</h1>

    <fieldset>
      <legend>Details</legend>
      <input v-model="consignor.name" placeholder="Name" required />
      <input v-model="consignor.street_address" placeholder="Street Address" />
      <div class="field-row">
        <input v-model="consignor.city" placeholder="City" class="field-grow" />
        <input v-model="consignor.state" placeholder="State" style="max-width:110px" />
        <input v-model="consignor.zip" placeholder="Zip" style="max-width:110px" />
      </div>
      <input v-model="consignor.mobile_phone" placeholder="Mobile Phone" />
      <input v-model="consignor.email" type="email" placeholder="Email" />
    </fieldset>

    <template v-if="!isEdit">
      <div class="section-header">
        <h2>Items</h2>
        <button type="button" @click="addItemRow">
          <i class="bi bi-plus-lg"></i> Add Row
        </button>
      </div>
      <div class="table-wrap">
        <table class="item-entry-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>List $</th>
              <th>Low $</th>
              <th>Sold $</th>
              <th style="text-align:center">Picked Up</th>
              <th>Fee</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in items" :key="i">
              <td><input v-model="item.description" placeholder="Description" /></td>
              <td><input v-model.number="item.list_price" type="number" step="0.01" placeholder="0.00" /></td>
              <td><input v-model.number="item.low_price" type="number" step="0.01" placeholder="0.00" /></td>
              <td><input type="number" step="0.01" placeholder="0.00"
                :value="item.sold_price ?? ''"
                @input="item.sold_price = $event.target.value === '' ? null : Number($event.target.value)" /></td>
              <td style="text-align:center"><input type="checkbox" v-model="item.picked_up" /></td>
              <td><FeeInput v-model="item.fee" /></td>
              <td>
                <button type="button" class="btn-sm btn-danger" v-if="items.length > 1"
                  @click="removeItemRow(i)" title="Remove row">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="field-hint">Rows with no description are skipped on save.</p>
    </template>

    <div class="form-actions">
      <button type="submit" :disabled="saving">
        <i class="bi bi-floppy"></i> {{ saving ? 'Saving…' : 'Save' }}
      </button>
      <button type="button"
        @click="router.push(isEdit ? `/consignors/${props.id}` : '/consignors')">
        Cancel
      </button>
    </div>
    <p v-if="error" class="error"><i class="bi bi-exclamation-circle"></i> {{ error }}</p>
  </form>
</template>
