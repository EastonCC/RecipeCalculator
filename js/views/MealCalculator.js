import { defineComponent, ref, computed } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js'
import { calcRecipeStats, UNITS } from '../calculations.js'

export default defineComponent({
  name: 'MealCalculator',
  props: { store: Object },
  emits: ['navigate'],
  setup(props, { emit }) {
    const rows   = ref([{ ingredientName: '', amount: '', unit: 'GRAM', search: '' }])
    const openIdx = ref(null)

    function availableIngredients(idx) {
      const taken  = new Set(rows.value.filter((_, i) => i !== idx).map(r => r.ingredientName).filter(Boolean))
      const search = rows.value[idx].search.toLowerCase()
      return props.store.ingredients
        .filter(ing => !taken.has(ing.name))
        .filter(ing => !search || ing.name.toLowerCase().includes(search))
    }

    function openDropdown(idx)  { openIdx.value = idx }
    function closeDropdown(idx) { setTimeout(() => { if (openIdx.value === idx) openIdx.value = null }, 150) }
    function pickIngredient(idx, name) {
      rows.value[idx].ingredientName = name
      rows.value[idx].search = ''
      openIdx.value = null
    }
    function addRow()       { rows.value.push({ ingredientName: '', amount: '', unit: 'GRAM', search: '' }) }
    function removeRow(idx) { rows.value.splice(idx, 1) }

    function ingredientUnitSize(name) {
      return props.store.ingredients.find(i => i.name === name)?.unitSize ?? null
    }

    const stats = computed(() => {
      const valid = rows.value.filter(r => r.ingredientName && Number(r.amount) > 0)
      if (!valid.length) return null
      return calcRecipeStats(
        {
          servings: 1,
          ingredients: valid.map(r => ({
            ingredientName: r.ingredientName,
            servingSize: { amount: Number(r.amount), unit: r.unit },
          })),
        },
        props.store.ingredients
      )
    })

    const hasRows = computed(() =>
      rows.value.some(r => r.ingredientName && Number(r.amount) > 0)
    )

    function saveAsRecipe() {
      emit('navigate', 'recipe-form', {
        prefill: {
          ingredients: rows.value
            .filter(r => r.ingredientName && Number(r.amount) > 0)
            .map(r => ({
              ingredientName: r.ingredientName,
              servingSize: { amount: Number(r.amount), unit: r.unit },
            })),
        },
      })
    }

    return {
      UNITS, rows, openIdx,
      availableIngredients, openDropdown, closeDropdown, pickIngredient,
      addRow, removeRow, ingredientUnitSize,
      stats, hasRows, saveAsRecipe,
    }
  },
  template: `
    <div class="view">
      <div class="view-header">
        <h1>Meal Calculator</h1>
        <button class="btn btn-primary" :disabled="!hasRows" @click="saveAsRecipe">
          Save as Recipe →
        </button>
      </div>
      <p class="muted" style="margin-bottom:1.5rem">
        Add the ingredients from your meal to instantly see the nutritional info and cost.
        When you're done you can save it as a recipe.
      </p>

      <div class="detail-layout">
        <!-- Ingredient rows -->
        <div class="detail-main">
          <div class="detail-section">
            <h2>Ingredients</h2>

            <div v-if="store.ingredients.length === 0" class="empty-state" style="margin-bottom:1rem">
              No ingredients yet.
              <a href="#" @click.prevent="$emit('navigate', 'ingredient-form', {})">Add an ingredient</a> first.
            </div>

            <div class="ingredient-row" v-for="(row, idx) in rows" :key="idx">
              <div class="form-group">
                <label v-if="idx === 0">Ingredient</label>
                <div class="ing-search-wrap">
                  <input
                    class="ing-search-input"
                    :value="openIdx === idx ? row.search : row.ingredientName"
                    @input="row.search = $event.target.value"
                    @focus="openDropdown(idx)"
                    @blur="closeDropdown(idx)"
                    placeholder="Search ingredients..."
                    autocomplete="off"
                  />
                  <div class="ing-dropdown" v-if="openIdx === idx">
                    <div
                      v-for="ing in availableIngredients(idx)"
                      :key="ing.name"
                      class="ing-dropdown-item"
                      :class="{ 'ing-dropdown-selected': ing.name === row.ingredientName }"
                      @mousedown.prevent="pickIngredient(idx, ing.name)"
                    >{{ ing.name }}</div>
                    <div v-if="availableIngredients(idx).length === 0" class="ing-dropdown-empty">No ingredients found</div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label v-if="idx === 0">Amount</label>
                <div class="input-inline">
                  <input v-model="row.amount" type="number" step="0.01" min="0.01" placeholder="100" />
                  <select v-model="row.unit">
                    <option v-for="u in UNITS" :key="u.key" :value="u.key">{{ u.label }}</option>
                  </select>
                </div>
                <span class="field-hint warn" v-if="row.unit === 'UNIT' && row.ingredientName && !ingredientUnitSize(row.ingredientName)">
                  No unit size on this ingredient — edit it to define one.
                </span>
              </div>

              <button
                type="button"
                class="btn btn-sm btn-danger remove-row-btn"
                :style="idx === 0 ? 'margin-top: 1.6rem' : ''"
                @click="removeRow(idx)"
                :disabled="rows.length === 1"
              >✕</button>
            </div>

            <button type="button" class="btn btn-secondary" style="margin-top:.5rem" @click="addRow">
              + Add Ingredient
            </button>
          </div>
        </div>

        <!-- Live nutrition sidebar -->
        <div class="detail-sidebar">
          <template v-if="stats">
            <div class="stat-card">
              <div class="stat-header">Cost</div>
              <div class="stat-row"><span>Total meal</span><strong>{{ '$' + stats.totalPrice.toFixed(2) }}</strong></div>
              <template v-if="stats.costPerCalorie">
                <div class="stat-divider"></div>
                <div class="stat-row"><span>Per 100 cal</span><strong>{{ '$' + stats.costPerCalorie.toFixed(2) }}</strong></div>
              </template>
              <template v-if="stats.costPerProtein">
                <div class="stat-row"><span>Per g protein</span><strong>{{ '$' + stats.costPerProtein.toFixed(4) }}</strong></div>
              </template>
              <p class="muted small" style="margin-top:.5rem" v-if="stats.missingIngredients.length">
                ⚠ Missing: {{ stats.missingIngredients.join(', ') }}
              </p>
            </div>

            <div class="nutrition-label" v-if="stats.nutrientsPerServing">
              <div class="nl-title">Nutrition Facts</div>
              <div class="nl-serving">Whole meal</div>
              <div class="nl-divider thick"></div>
              <div class="nl-calories">
                <span>Calories</span>
                <span>{{ stats.nutrientsPerServing.kCal }}</span>
              </div>
              <div class="nl-divider thick"></div>
              <div class="nl-row"><span>Total Fat</span><span>{{ stats.nutrientsPerServing.fat?.total ?? '—' }}g</span></div>
              <template v-if="stats.nutrientsPerServing.fat">
                <div class="nl-row indent"><span>Saturated Fat</span><span>{{ stats.nutrientsPerServing.fat.saturated }}g</span></div>
                <div class="nl-row indent"><span>Trans Fat</span><span>{{ stats.nutrientsPerServing.fat.trans }}g</span></div>
              </template>
              <div class="nl-row"><span>Cholesterol</span><span>{{ stats.nutrientsPerServing.cholesterol }}mg</span></div>
              <div class="nl-row"><span>Sodium</span><span>{{ stats.nutrientsPerServing.sodium }}mg</span></div>
              <div class="nl-row"><span>Total Carbohydrates</span><span>{{ stats.nutrientsPerServing.carbohydrates }}g</span></div>
              <div class="nl-row indent"><span>Dietary Fiber</span><span>{{ stats.nutrientsPerServing.fiber }}g</span></div>
              <template v-if="stats.nutrientsPerServing.sugar">
                <div class="nl-row indent"><span>Total Sugars</span><span>{{ stats.nutrientsPerServing.sugar.total }}g</span></div>
                <div class="nl-row indent2"><span>Incl. {{ stats.nutrientsPerServing.sugar.added }}g Added Sugars</span></div>
              </template>
              <div class="nl-row bold"><span>Protein</span><span>{{ stats.nutrientsPerServing.protein }}g</span></div>
              <div class="nl-divider thick"></div>
              <p class="nl-note" v-if="stats.nutrientsPerServing.incomplete">
                ⚠ Some ingredients have no nutrient data — values may be understated.
              </p>
            </div>
            <div class="stat-card" v-else>
              <p class="no-data">No nutrient data available.<br>Add nutrient info to ingredients to see this.</p>
            </div>
          </template>

          <div class="stat-card" v-else>
            <p class="no-data">Add ingredients to see nutrition info here.</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
