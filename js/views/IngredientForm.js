import { defineComponent, ref } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js'
import { UNITS } from '../calculations.js'

export default defineComponent({
  name: 'IngredientForm',
  props: {
    store:      Object,
    ingredient: { type: Object, default: null },
  },
  emits: ['navigate'],
  setup(props, { emit }) {
    const isEdit = !!props.ingredient
    const src    = props.ingredient || {}

    const name          = ref(src.name          ?? '')
    const unitPrice     = ref(src.unitPrice      ?? '')
    const weightAmount  = ref(src.unitWeight?.amount ?? '')
    const weightUnit    = ref(src.unitWeight?.unit   ?? 'POUND')

    const showNutrients  = ref(!!src.nutrients)
    const kCal           = ref(src.nutrients?.kCal          ?? '')
    const carbohydrates  = ref(src.nutrients?.carbohydrates ?? '')
    const protein        = ref(src.nutrients?.protein       ?? '')
    const sodium         = ref(src.nutrients?.sodium        ?? '')
    const cholesterol    = ref(src.nutrients?.cholesterol   ?? '')
    const fiber          = ref(src.nutrients?.fiber         ?? '')

    const showFat        = ref(!!src.nutrients?.fat)
    const fatSat         = ref(src.nutrients?.fat?.saturated   ?? '')
    const fatUnsat       = ref(src.nutrients?.fat?.unsaturated ?? '')
    const fatTrans       = ref(src.nutrients?.fat?.trans       ?? '')

    const showSugar      = ref(!!src.nutrients?.sugar)
    const sugarTotal     = ref(src.nutrients?.sugar?.total ?? '')
    const sugarAdded     = ref(src.nutrients?.sugar?.added ?? '')

    const errors = ref({})

    function validate() {
      const e = {}
      if (!name.value.trim())                                           e.name         = 'Required'
      if (unitPrice.value === '' || Number(unitPrice.value) < 0)       e.unitPrice    = 'Required'
      if (!weightAmount.value || Number(weightAmount.value) <= 0)      e.weightAmount = 'Must be > 0'
      errors.value = e
      return Object.keys(e).length === 0
    }

    function submit() {
      if (!validate()) return
      const priceChanged = isEdit && Number(unitPrice.value) !== src.unitPrice
      props.store.saveIngredient({
        name:             name.value.trim(),
        unitPrice:        Number(unitPrice.value),
        unitWeight:       { amount: Number(weightAmount.value), unit: weightUnit.value },
        priceLastUpdated: (!isEdit || priceChanged) ? new Date().toISOString() : src.priceLastUpdated,
        nutrients: showNutrients.value ? {
          kCal:          Number(kCal.value)         || 0,
          carbohydrates: Number(carbohydrates.value) || 0,
          protein:       Number(protein.value)       || 0,
          sodium:        Number(sodium.value)        || 0,
          cholesterol:   Number(cholesterol.value)   || 0,
          fiber:         Number(fiber.value)         || 0,
          fat: showFat.value ? {
            saturated:   Number(fatSat.value)   || 0,
            unsaturated: Number(fatUnsat.value) || 0,
            trans:       Number(fatTrans.value) || 0,
          } : null,
          sugar: showSugar.value ? {
            total: Number(sugarTotal.value) || 0,
            added: Number(sugarAdded.value) || 0,
          } : null,
        } : null,
      })
      emit('navigate', 'ingredients')
    }

    return {
      isEdit, UNITS, errors, submit,
      name, unitPrice, weightAmount, weightUnit,
      showNutrients, kCal, carbohydrates, protein, sodium, cholesterol, fiber,
      showFat, fatSat, fatUnsat, fatTrans,
      showSugar, sugarTotal, sugarAdded,
    }
  },
  template: `
    <div class="view">
      <div class="view-header">
        <h1>{{ isEdit ? 'Edit' : 'Add' }} Ingredient</h1>
      </div>
      <form class="form-card" @submit.prevent="submit">

        <div class="form-section">
          <h2 class="form-section-title">Basic Info</h2>
          <div class="form-group" :class="{ 'has-error': errors.name }">
            <label>Name *</label>
            <input v-model="name" type="text" placeholder="e.g. Chicken Breast" :disabled="isEdit" />
            <span class="error-msg" v-if="errors.name">{{ errors.name }}</span>
            <span class="field-hint" v-if="isEdit">Name cannot be changed after creation.</span>
          </div>
          <div class="form-row two-col">
            <div class="form-group" :class="{ 'has-error': errors.unitPrice }">
              <label>Unit Price ($) *</label>
              <input v-model="unitPrice" type="number" step="0.01" min="0" placeholder="3.99" />
              <span class="error-msg" v-if="errors.unitPrice">{{ errors.unitPrice }}</span>
            </div>
            <div class="form-group" :class="{ 'has-error': errors.weightAmount }">
              <label>Price applies to *</label>
              <div class="input-inline">
                <input v-model="weightAmount" type="number" step="0.01" min="0.01" placeholder="1" />
                <select v-model="weightUnit">
                  <option v-for="u in UNITS" :key="u.key" :value="u.key">{{ u.label }}</option>
                </select>
              </div>
              <span class="field-hint">e.g. $3.99 per 1 Pound</span>
              <span class="error-msg" v-if="errors.weightAmount">{{ errors.weightAmount }}</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="collapsible-header" @click="showNutrients = !showNutrients">
            <h2 class="form-section-title">Nutrient Info <span class="optional">— optional</span></h2>
            <span class="chevron">{{ showNutrients ? '▲' : '▼' }}</span>
          </div>
          <div v-if="showNutrients">
            <p class="field-hint" style="margin-bottom:1rem">
              Enter nutrients as they appear on the nutrition label — per the quantity above
              (e.g. per 1 Pound).
            </p>
            <div class="form-row three-col">
              <div class="form-group"><label>Calories (kcal)</label><input v-model="kCal" type="number" min="0" placeholder="0" /></div>
              <div class="form-group"><label>Carbohydrates (g)</label><input v-model="carbohydrates" type="number" min="0" placeholder="0" /></div>
              <div class="form-group"><label>Protein (g)</label><input v-model="protein" type="number" min="0" placeholder="0" /></div>
              <div class="form-group"><label>Sodium (mg)</label><input v-model="sodium" type="number" min="0" placeholder="0" /></div>
              <div class="form-group"><label>Cholesterol (mg)</label><input v-model="cholesterol" type="number" min="0" placeholder="0" /></div>
              <div class="form-group"><label>Fiber (g)</label><input v-model="fiber" type="number" min="0" placeholder="0" /></div>
            </div>

            <div class="collapsible-header sub" @click="showFat = !showFat">
              <span>Fat breakdown <span class="optional">— optional</span></span>
              <span class="chevron">{{ showFat ? '▲' : '▼' }}</span>
            </div>
            <div v-if="showFat" class="form-row three-col" style="margin-top:.75rem">
              <div class="form-group"><label>Saturated Fat (g)</label><input v-model="fatSat" type="number" min="0" placeholder="0" /></div>
              <div class="form-group"><label>Unsaturated Fat (g)</label><input v-model="fatUnsat" type="number" min="0" placeholder="0" /></div>
              <div class="form-group"><label>Trans Fat (g)</label><input v-model="fatTrans" type="number" min="0" placeholder="0" /></div>
            </div>

            <div class="collapsible-header sub" @click="showSugar = !showSugar">
              <span>Sugar breakdown <span class="optional">— optional</span></span>
              <span class="chevron">{{ showSugar ? '▲' : '▼' }}</span>
            </div>
            <div v-if="showSugar" class="form-row two-col" style="margin-top:.75rem">
              <div class="form-group"><label>Total Sugar (g)</label><input v-model="sugarTotal" type="number" min="0" placeholder="0" /></div>
              <div class="form-group"><label>Added Sugar (g)</label><input v-model="sugarAdded" type="number" min="0" placeholder="0" /></div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="$emit('navigate', 'ingredients')">Cancel</button>
          <button type="submit" class="btn btn-primary">{{ isEdit ? 'Save Changes' : 'Add Ingredient' }}</button>
        </div>
      </form>
    </div>
  `,
})
