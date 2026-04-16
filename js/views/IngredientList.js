import { defineComponent } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js'
import { unitLabel } from '../calculations.js'

export default defineComponent({
  name: 'IngredientList',
  props: { store: Object },
  emits: ['navigate'],
  setup(props, { emit }) {
    function formatDate(iso) {
      return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }
    function deleteIngredient(name) {
      if (confirm(`Delete "${name}"? This cannot be undone.`))
        props.store.deleteIngredient(name)
    }
    return { formatDate, deleteIngredient, unitLabel }
  },
  template: `
    <div class="view">
      <div class="view-header">
        <h1>Ingredients</h1>
        <button class="btn btn-primary" @click="$emit('navigate', 'ingredient-form', {})">+ Add Ingredient</button>
      </div>
      <div v-if="store.ingredients.length === 0" class="empty-state">
        <p>No ingredients yet.</p>
        <p>Add an ingredient to get started — recipes are built from ingredients.</p>
      </div>
      <div class="card-grid" v-else>
        <div class="card card-clickable" v-for="ing in store.ingredients" :key="ing.name" @click="$emit('navigate', 'ingredient-form', { ingredient: ing })">
          <div class="card-header">
            <h3 class="card-title">{{ ing.name }}</h3>
            <div class="card-actions" @click.stop>
              <button class="btn btn-sm btn-secondary" @click="$emit('navigate', 'ingredient-form', { ingredient: ing })">Edit</button>
            </div>
          </div>
          <div class="card-body">
            <p class="price-line">
              {{ '$' + ing.unitPrice.toFixed(2) }} per {{ ing.unitWeight.amount }} {{ ing.unitWeight.unit.toLowerCase() }}
            </p>
            <p class="last-updated">Price updated: {{ formatDate(ing.priceLastUpdated) }}</p>
            <p class="last-updated" v-if="ing.unitSize">1 {{ ing.unitSize.name ?? 'unit' }} = {{ ing.unitSize.amount }} {{ unitLabel(ing.unitSize.unit) }}</p>
            <div v-if="ing.nutrients" class="chip-row">
              <span class="chip">{{ ing.nutrients.kCal }} kcal</span>
              <span class="chip">{{ ing.nutrients.protein }}g protein</span>
              <span class="chip">{{ ing.nutrients.carbohydrates }}g carbs</span>
              <span class="chip" v-if="ing.nutrients.fat">{{ ing.nutrients.fat.saturated + ing.nutrients.fat.unsaturated + ing.nutrients.fat.trans }}g fat</span>
              <span class="chip">{{ ing.nutrients.sodium }}mg sodium</span>
            </div>
            <p v-else class="no-data">No nutrient data</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
