import { defineComponent, ref, reactive, computed } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js'
import { calcRecipeStats, UNITS, MEASURABLE_UNITS } from '../calculations.js'
import NutritionLabel from '../components/NutritionLabel.js'
import CostCard       from '../components/CostCard.js'

const emptyQuickAdd = () => ({
  name: '', price: '', priceAmount: '100', priceUnit: 'GRAM',
  kCal: '', servingAmount: '', servingUnit: 'GRAM',
})

export default defineComponent({
  name: 'MealCalculator',
  components: { NutritionLabel, CostCard },
  props: { store: Object },
  emits: ['navigate'],
  setup(props, { emit }) {
    // ── Meal rows ──────────────────────────────────────────────
    const rows    = ref([{ ingredientName: '', amount: '', unit: 'GRAM', search: '' }])
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

    function unitOptionLabel(unitKey, ingredientName) {
      if (unitKey === 'UNIT') {
        const name = ingredientUnitSize(ingredientName)?.name
        return name ? name + '(s)' : 'Unit(s)'
      }
      return UNITS.find(u => u.key === unitKey)?.label ?? unitKey
    }

    // ── Live stats ─────────────────────────────────────────────
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

    const hasRows = computed(() => rows.value.some(r => r.ingredientName && Number(r.amount) > 0))

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

    // ── Quick-add modal ────────────────────────────────────────
    const showQuickAdd  = ref(false)
    const quickAdd      = reactive(emptyQuickAdd())
    const quickErrors   = ref({})

    function openQuickAdd() {
      Object.assign(quickAdd, emptyQuickAdd())
      quickErrors.value = {}
      showQuickAdd.value = true
    }

    function validateQuick() {
      const e = {}
      if (!quickAdd.name.trim())                                    e.name  = 'Required'
      else if (props.store.ingredients.find(i => i.name === quickAdd.name.trim()))
                                                                    e.name  = 'An ingredient with this name already exists'
      if (quickAdd.price === '' || Number(quickAdd.price) < 0)     e.price = 'Required'
      if (!quickAdd.priceAmount || Number(quickAdd.priceAmount) <= 0) e.priceAmount = 'Must be > 0'
      quickErrors.value = e
      return Object.keys(e).length === 0
    }

    function buildIngredient() {
      const hasCalories = quickAdd.kCal !== '' && Number(quickAdd.kCal) >= 0
      const servingAmt  = Number(quickAdd.servingAmount) > 0
        ? Number(quickAdd.servingAmount)
        : Number(quickAdd.priceAmount)
      const servingUnit = Number(quickAdd.servingAmount) > 0
        ? quickAdd.servingUnit
        : quickAdd.priceUnit
      return {
        name:             quickAdd.name.trim(),
        unitPrice:        Number(quickAdd.price),
        unitWeight:       { amount: Number(quickAdd.priceAmount), unit: quickAdd.priceUnit },
        priceLastUpdated: new Date().toISOString(),
        unitSize:         null,
        nutrients: hasCalories ? {
          servingSize: { amount: servingAmt, unit: servingUnit },
          kCal:          Number(quickAdd.kCal) || 0,
          carbohydrates: 0, protein: 0, sodium: 0, cholesterol: 0, fiber: 0,
          fat: null, sugar: null,
        } : null,
      }
    }

    function submitQuickAdd() {
      if (!validateQuick()) return
      const ing = buildIngredient()
      props.store.saveIngredient(ing)
      // auto-add a row for the new ingredient
      const emptyRow = rows.value.find(r => !r.ingredientName)
      if (emptyRow) {
        emptyRow.ingredientName = ing.name
      } else {
        rows.value.push({ ingredientName: ing.name, amount: '', unit: ing.unitWeight.unit, search: '' })
      }
      showQuickAdd.value = false
    }

    function openFullForm() {
      // Pass whatever is filled in as prefill; return here after saving
      const hasCalories = quickAdd.kCal !== '' && Number(quickAdd.kCal) >= 0
      emit('navigate', 'ingredient-form', {
        returnTo: 'meal',
        prefill: {
          name:       quickAdd.name.trim(),
          unitPrice:  quickAdd.price !== '' ? Number(quickAdd.price) : undefined,
          unitWeight: Number(quickAdd.priceAmount) > 0
            ? { amount: Number(quickAdd.priceAmount), unit: quickAdd.priceUnit }
            : undefined,
          nutrients: hasCalories ? {
            servingSize: Number(quickAdd.servingAmount) > 0
              ? { amount: Number(quickAdd.servingAmount), unit: quickAdd.servingUnit }
              : null,
            kCal: Number(quickAdd.kCal) || 0,
          } : null,
        },
      })
      showQuickAdd.value = false
    }

    return {
      UNITS, MEASURABLE_UNITS, rows, openIdx,
      availableIngredients, openDropdown, closeDropdown, pickIngredient,
      addRow, removeRow, ingredientUnitSize, unitOptionLabel,
      stats, hasRows, saveAsRecipe,
      showQuickAdd, quickAdd, quickErrors,
      openQuickAdd, submitQuickAdd, openFullForm,
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
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
              <h2 style="margin-bottom:0">Ingredients</h2>
              <button type="button" class="btn btn-secondary btn-sm" @click="openQuickAdd">+ New Ingredient</button>
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
                    <option v-for="u in UNITS" :key="u.key" :value="u.key">{{ unitOptionLabel(u.key, row.ingredientName) }}</option>
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
              + Add Row
            </button>
          </div>
        </div>

        <!-- Live nutrition sidebar -->
        <div class="detail-sidebar">
          <template v-if="stats">
            <CostCard :stats="stats" totalLabel="Total meal" />
            <NutritionLabel
              :nutrients="stats.nutrientsPerServing"
              servingLabel="Whole meal"
              :breakdown="stats.calorieBreakdown"
            />
          </template>
          <div class="stat-card" v-else>
            <p class="no-data">Add ingredients to see nutrition info here.</p>
          </div>
        </div>
      </div>

      <!-- Quick-add ingredient modal -->
      <div class="modal-backdrop" v-if="showQuickAdd" @click.self="showQuickAdd = false">
        <div class="modal">
          <div class="modal-header">
            <h2>New Ingredient</h2>
            <button class="modal-close" @click="showQuickAdd = false">✕</button>
          </div>
          <div class="modal-body">

            <div class="form-group" :class="{ 'has-error': quickErrors.name }">
              <label>Name *</label>
              <input v-model="quickAdd.name" type="text" placeholder="e.g. Chicken Breast" autocomplete="off" />
              <span class="error-msg" v-if="quickErrors.name">{{ quickErrors.name }}</span>
            </div>

            <div class="form-row two-col">
              <div class="form-group" :class="{ 'has-error': quickErrors.price }">
                <label>Price ($) *</label>
                <input v-model="quickAdd.price" type="number" step="0.01" min="0" placeholder="3.99" />
                <span class="error-msg" v-if="quickErrors.price">{{ quickErrors.price }}</span>
              </div>
              <div class="form-group" :class="{ 'has-error': quickErrors.priceAmount }">
                <label>Per *</label>
                <div class="input-inline">
                  <input v-model="quickAdd.priceAmount" type="number" step="0.01" min="0.01" placeholder="100" />
                  <select v-model="quickAdd.priceUnit">
                    <option v-for="u in MEASURABLE_UNITS" :key="u.key" :value="u.key">{{ u.label }}</option>
                  </select>
                </div>
                <span class="error-msg" v-if="quickErrors.priceAmount">{{ quickErrors.priceAmount }}</span>
              </div>
            </div>

            <div class="form-group">
              <label>Calories (kcal) <span class="optional">— optional</span></label>
              <input v-model="quickAdd.kCal" type="number" min="0" step="1" placeholder="0" />
              <span class="field-hint">Calories per serving below (defaults to same as price unit if blank)</span>
            </div>

            <div class="form-row two-col" v-if="quickAdd.kCal !== ''">
              <div class="form-group">
                <label>Serving size <span class="optional">— optional</span></label>
                <div class="input-inline">
                  <input v-model="quickAdd.servingAmount" type="number" step="0.01" min="0.01" :placeholder="quickAdd.priceAmount || '100'" />
                  <select v-model="quickAdd.servingUnit">
                    <option v-for="u in MEASURABLE_UNITS" :key="u.key" :value="u.key">{{ u.label }}</option>
                  </select>
                </div>
                <span class="field-hint">Leave blank to use the price unit amount</span>
              </div>
            </div>

          </div>
          <div class="modal-footer">
            <div class="modal-footer-left">
              <button type="button" class="btn btn-ghost btn-sm" @click="openFullForm">Full form →</button>
            </div>
            <div class="modal-footer-right">
              <button type="button" class="btn btn-secondary" @click="showQuickAdd = false">Cancel</button>
              <button type="button" class="btn btn-primary" @click="submitQuickAdd">Add Ingredient</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
