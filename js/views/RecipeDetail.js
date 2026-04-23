import { defineComponent, computed, ref, nextTick } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js'
import { calcRecipeStats, unitLabel, convertUnit, formatUnitAmount, MEASURABLE_UNITS } from '../calculations.js'
import NutritionLabel from '../components/NutritionLabel.js'
import CostCard       from '../components/CostCard.js'

export default defineComponent({
  name: 'RecipeDetail',
  components: { NutritionLabel, CostCard },
  props: { store: Object, recipe: Object },
  emits: ['navigate'],
  setup(props) {
    const stats = computed(() => calcRecipeStats(props.recipe, props.store.ingredients))

    function resolveIngredient(name) {
      return props.store.ingredients.find(i => i.name === name) || null
    }

    const editingName     = ref(null)
    const editPrice       = ref('')
    const editWeightAmt   = ref('')
    const editWeightUnit  = ref('POUND')

    async function startEdit(ing) {
      editingName.value    = ing.name
      editPrice.value      = ing.unitPrice.toString()
      editWeightAmt.value  = ing.unitWeight.amount.toString()
      editWeightUnit.value = ing.unitWeight.unit
      await nextTick()
      document.getElementById('price-input-' + ing.name)?.focus()
    }

    function commitEdit(ing) {
      if (editingName.value !== ing.name) return
      const price  = parseFloat(editPrice.value)
      const wAmt   = parseFloat(editWeightAmt.value)
      if (!isNaN(price) && price >= 0 && !isNaN(wAmt) && wAmt > 0) {
        const priceChanged = price !== ing.unitPrice || wAmt !== ing.unitWeight.amount || editWeightUnit.value !== ing.unitWeight.unit
        props.store.saveIngredient({
          ...ing,
          unitPrice:        price,
          unitWeight:       { amount: wAmt, unit: editWeightUnit.value },
          priceLastUpdated: priceChanged ? new Date().toISOString() : ing.priceLastUpdated,
        })
      }
      editingName.value = null
    }

    function onEditFocusOut(event, ing) {
      if (event.currentTarget.contains(event.relatedTarget)) return
      commitEdit(ing)
    }

    function cancelEdit() {
      editingName.value = null
    }

    function pluralize(count, name) {
      if (!name) return count === 1 ? 'Unit' : 'Units'
      if (count === 1) return name
      return name.endsWith('s') ? name : name + 's'
    }

    function displayAmount(ri, ing) {
      const { amount, unit } = ri.servingSize
      const name = ing?.unitSize?.name ?? null
      if (unit === 'UNIT') return `${amount} ${pluralize(amount, name)}`
      if (ing?.unitSize) {
        const inUnitSizeUnits = convertUnit(amount, unit, ing.unitSize.unit)
        if (inUnitSizeUnits !== null) {
          const count = Math.round(inUnitSizeUnits / ing.unitSize.amount)
          if (count > 0) return `${count} ${pluralize(count, name)}`
        }
      }
      return `${amount} ${unitLabel(unit)}`
    }

    return { stats, resolveIngredient, unitLabel, formatUnitAmount, displayAmount, MEASURABLE_UNITS,
             editingName, editPrice, editWeightAmt, editWeightUnit,
             startEdit, commitEdit, onEditFocusOut, cancelEdit }
  },
  template: `
    <div class="view">
      <div class="view-header">
        <div class="header-left">
          <button class="btn btn-ghost" @click="$emit('navigate', 'recipes')">← Back</button>
          <h1>{{ recipe.name }}</h1>
        </div>
        <button class="btn btn-secondary" @click="$emit('navigate', 'recipe-form', { recipe })">Edit Recipe</button>
      </div>

      <div class="detail-layout">
        <div class="detail-main">

          <div class="detail-section">
            <h2>Ingredients</h2>
            <table class="data-table">
              <thead>
                <tr><th>Ingredient</th><th>Amount</th><th>Unit Price</th></tr>
              </thead>
              <tbody>
                <tr v-for="ri in recipe.ingredients" :key="ri.ingredientName">
                  <td>{{ ri.ingredientName }}</td>
                  <td>{{ displayAmount(ri, resolveIngredient(ri.ingredientName)) }}</td>
                  <td>
                    <template v-if="resolveIngredient(ri.ingredientName)">
                      <div v-if="editingName === ri.ingredientName" class="price-edit-active"
                           @focusout="onEditFocusOut($event, resolveIngredient(ri.ingredientName))"
                           @keyup.enter="commitEdit(resolveIngredient(ri.ingredientName))"
                           @keyup.escape="cancelEdit">
                        <span class="price-currency">$</span>
                        <input
                          :id="'price-input-' + ri.ingredientName"
                          v-model="editPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          class="price-inline-input"
                        />
                        <span class="price-currency muted">/</span>
                        <input
                          v-model="editWeightAmt"
                          type="number"
                          step="0.01"
                          min="0.01"
                          class="price-inline-input"
                        />
                        <select v-model="editWeightUnit" class="price-inline-select">
                          <option v-for="u in MEASURABLE_UNITS" :key="u.key" :value="u.key">{{ u.label }}</option>
                        </select>
                      </div>
                      <button v-else class="price-display" @click="startEdit(resolveIngredient(ri.ingredientName))">
                        {{ '$' + resolveIngredient(ri.ingredientName).unitPrice.toFixed(2) }}
                        <span class="price-unit muted">/ {{ formatUnitAmount(resolveIngredient(ri.ingredientName).unitWeight.amount, resolveIngredient(ri.ingredientName).unitWeight.unit) }}</span>
                        <span class="edit-hint">✏</span>
                      </button>
                    </template>
                    <span v-else class="chip chip-warn">Missing</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <p class="muted small" style="margin-top:.5rem" v-if="stats.missingIngredients.length">
              ⚠ Some ingredients not found in your list: {{ stats.missingIngredients.join(', ') }}
            </p>
          </div>

          <div class="detail-section" v-if="recipe.directions">
            <h2>Directions</h2>
            <p class="directions-text">{{ recipe.directions }}</p>
          </div>

        </div>

        <div class="detail-sidebar">
          <CostCard :stats="stats" totalLabel="Total recipe" :servings="recipe.servings" />
          <NutritionLabel
            :nutrients="stats.nutrientsPerServing"
            servingLabel="Per serving"
            :breakdown="stats.calorieBreakdown"
          />
        </div>
      </div>
    </div>
  `,
})
