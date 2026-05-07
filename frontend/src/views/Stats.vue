<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api';
import { useAuth } from '../store';

const auth = useAuth();
const router = useRouter();
const stats = ref(null);

onMounted(async () => {
  if (!auth.isLoggedIn) { router.push('/login'); return; }
  const { data } = await api.get('/stats');
  stats.value = data;
});

function money(v) {
  return `$${Number(v).toFixed(2)}`;
}
</script>

<template>
  <h1><i class="bi bi-bar-chart-line"></i> Stats</h1>
  <p v-if="!stats" style="color:#888">Loading…</p>
  <div v-else class="stat-grid">

    <div class="stat-card">
      <div class="stat-label">Items Consigned</div>
      <div class="stat-value">{{ stats.total_items }}</div>
      <div class="stat-sub">{{ money(stats.total_consigned_value) }} total list value</div>
    </div>

    <div class="stat-card stat-card--highlight">
      <div class="stat-label">Items Sold</div>
      <div class="stat-value">{{ stats.total_sold }}</div>
      <div class="stat-sub">{{ money(stats.total_sold_value) }} total sold value</div>
    </div>

    <div class="stat-card stat-card--fees">
      <div class="stat-label">Fees Collected</div>
      <div class="stat-value">{{ money(stats.total_fees_collected) }}</div>
      <div class="stat-sub">from {{ stats.total_sold }} sold item{{ stats.total_sold === 1 ? '' : 's' }}</div>
    </div>

    <div class="stat-card">
      <div class="stat-label">Remaining</div>
      <div class="stat-value">{{ stats.total_items - stats.total_sold }}</div>
      <div class="stat-sub">items still available</div>
    </div>

  </div>
</template>
