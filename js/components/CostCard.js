import { defineComponent } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js'

export default defineComponent({
  name: 'CostCard',
  props: {
    stats:      { type: Object, required: true },
    totalLabel: { type: String, default: 'Total' },
    servings:   { type: Number, default: null },  // pass to show per-serving row
  },
  template: `
    <div class="stat-card">
      <div class="stat-header">Cost</div>
      <div class="stat-row">
        <span>{{ totalLabel }}</span>
        <strong>{{ '$' + stats.totalPrice.toFixed(2) }}</strong>
      </div>
      <template v-if="servings != null">
        <div class="stat-row">
          <span>Per serving</span>
          <strong>{{ '$' + stats.pricePerServing.toFixed(2) }}</strong>
        </div>
        <div class="stat-row muted small">
          <span>Servings</span>
          <span>{{ servings }}</span>
        </div>
      </template>
      <template v-if="stats.costPerCalorie || stats.costPerProtein">
        <div class="stat-divider"></div>
        <div class="stat-row" v-if="stats.costPerCalorie">
          <span>Per 100 cal</span>
          <strong>{{ '$' + stats.costPerCalorie.toFixed(2) }}</strong>
        </div>
        <div class="stat-row" v-if="stats.costPerProtein">
          <span>Per g protein</span>
          <strong>{{ '$' + stats.costPerProtein.toFixed(4) }}</strong>
        </div>
      </template>
      <p class="muted small" style="margin-top:.5rem" v-if="stats.missingIngredients?.length">
        ⚠ Missing: {{ stats.missingIngredients.join(', ') }}
      </p>
    </div>
  `,
})
