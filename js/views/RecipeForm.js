import { defineComponent, ref } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js'
import { UNITS } from '../calculations.js'

export default defineComponent({
  name: 'RecipeForm',
  props: {
    store:  Object,
    recipe: { type: Object, default: null },
  },
  emits: ['navigate'],
  setup(props, { emit }) {
    const isEdit = !!props.recipe
    const src    = props.recipe || {}

    const name       = ref(src.name       ?? '')
    const servings   = ref(src.servings   ?? 1)
    const directions = ref(src.directions ?? '')

    const rows = ref(
      src.ingredients?.map(ri => ({
        ingredientName: ri.ingredientName,
        amount:         ri.servingSize.amount,
        unit:           ri.servingSize.unit,
        search:         '',
      })) ?? [{ ingredientName: '', amount: '', unit: 'GRAM', search: '' }]
    )

    const errors = ref({})

    function addRow() {
      rows.value.push({ ingredientName: '', amount: '', unit: 'GRAM', search: '' })
    }
    function removeRow(idx) {
      rows.value.splice(idx, 1)
    }

    function ingredientUnitSize(name) {
      return props.store.ingredients.find(i => i.name === name)?.unitSize ?? null
    }

    const openIdx = ref(null)

    function availableIngredients(idx) {
      const taken = new Set(rows.value.filter((_, i) => i !== idx).map(r => r.ingredientName).filter(Boolean))
      const search = rows.value[idx].search.toLowerCase()
      return props.store.ingredients
        .filter(ing => !taken.has(ing.name))
        .filter(ing => !search || ing.name.toLowerCase().includes(search))
    }

    function openDropdown(idx) {
      openIdx.value = idx
    }

    function closeDropdown(idx) {
      setTimeout(() => { if (openIdx.value === idx) openIdx.value = null }, 150)
    }

    function pickIngredient(idx, name) {
      rows.value[idx].ingredientName = name
      rows.value[idx].search = ''
      openIdx.value = null
    }

    function validate() {
      const e = {}
      if (!name.value.trim())      e.name     = 'Required'
      if (servings.value < 1)      e.servings = 'Must be at least 1'
      if (rows.value.length === 0) e.rows     = 'Add at least one ingredient'
      rows.value.forEach((row, i) => {
        if (!row.ingredientName)            e[`row_ing_${i}`] = 'Select an ingredient'
        if (!row.amount || row.amount <= 0) e[`row_amt_${i}`] = 'Enter an amount'
        if (row.unit === 'UNIT' && row.ingredientName && !ingredientUnitSize(row.ingredientName))
          e[`row_amt_${i}`] = 'No unit size defined — edit the ingredient first'
      })
      errors.value = e
      return Object.keys(e).length === 0
    }

    function submit() {
      if (!validate()) return
      props.store.saveRecipe({
        name:        name.value.trim(),
        servings:    Number(servings.value),
        directions:  directions.value.trim() || null,
        ingredients: rows.value.map(row => ({
          ingredientName: row.ingredientName,
          servingSize:    { amount: Number(row.amount), unit: row.unit },
        })),
      })
      emit('navigate', 'recipes')
    }

    const confirmingDelete = ref(false)

    function deleteRecipe() {
      props.store.deleteRecipe(src.name)
      emit('navigate', 'recipes')
    }

    return {
      isEdit, UNITS, errors, submit, ingredientUnitSize,
      name, servings, directions, rows,
      addRow, removeRow,
      openIdx, availableIngredients, openDropdown, closeDropdown, pickIngredient,
      confirmingDelete, deleteRecipe,
    }
  },
  template: `
    <div class="view">
      <div class="view-header">
        <h1>{{ isEdit ? 'Edit' : 'Add' }} Recipe</h1>
      </div>
      <form class="form-card" @submit.prevent="submit">

        <div class="form-section">
          <h2 class="form-section-title">Basic Info</h2>
          <div class="form-row two-col">
            <div class="form-group" :class="{ 'has-error': errors.name }">
              <label>Recipe Name *</label>
              <input v-model="name" type="text" placeholder="e.g. Chicken Stir Fry" :disabled="isEdit" />
              <span class="field-hint" v-if="isEdit">Name cannot be changed after creation.</span>
              <span class="error-msg" v-if="errors.name">{{ errors.name }}</span>
            </div>
            <div class="form-group" :class="{ 'has-error': errors.servings }">
              <label>Servings *</label>
              <input v-model="servings" type="number" min="1" step="1" placeholder="2" />
              <span class="error-msg" v-if="errors.servings">{{ errors.servings }}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Directions <span class="optional">— optional</span></label>
            <textarea v-model="directions" rows="4" placeholder="Describe how to prepare this recipe..."></textarea>
          </div>
        </div>

        <div class="form-section">
          <h2 class="form-section-title">Ingredients</h2>
          <p class="field-hint" style="margin-bottom:1rem">
            Specify how much of each ingredient goes into the recipe.
            Nutrients and cost are scaled automatically.
          </p>

          <div v-if="store.ingredients.length === 0" class="empty-state" style="margin-bottom:1rem">
            No ingredients found. <a href="#" @click.prevent="$emit('navigate', 'ingredient-form', {})">Add an ingredient</a> first.
          </div>

          <div v-if="errors.rows" class="error-msg" style="margin-bottom:.5rem">{{ errors.rows }}</div>

          <div class="ingredient-row" v-for="(row, idx) in rows" :key="idx">
            <div class="form-group" :class="{ 'has-error': errors['row_ing_' + idx] }">
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
              <span class="error-msg" v-if="errors['row_ing_' + idx]">{{ errors['row_ing_' + idx] }}</span>
            </div>
            <div class="form-group" :class="{ 'has-error': errors['row_amt_' + idx] }">
              <label v-if="idx === 0">Amount</label>
              <div class="input-inline">
                <input v-model="row.amount" type="number" step="0.01" min="0.01" placeholder="100" />
                <select v-model="row.unit">
                  <option v-for="u in UNITS" :key="u.key" :value="u.key">{{ u.label }}</option>
                </select>
              </div>
              <span class="error-msg" v-if="errors['row_amt_' + idx]">{{ errors['row_amt_' + idx] }}</span>
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

        <div class="form-actions">
          <div class="form-actions-left" v-if="isEdit">
            <template v-if="!confirmingDelete">
              <button type="button" class="btn btn-danger-outline" @click="confirmingDelete = true">Delete Recipe</button>
            </template>
            <template v-else>
              <div class="delete-confirm">
                <span class="delete-confirm-msg">Permanently delete "{{ name }}"?</span>
                <button type="button" class="btn btn-secondary btn-sm" @click="confirmingDelete = false">No, keep it</button>
                <button type="button" class="btn btn-danger btn-sm"    @click="deleteRecipe">Yes, delete</button>
              </div>
            </template>
          </div>
          <div class="form-actions-right">
            <button type="button" class="btn btn-secondary" @click="$emit('navigate', 'recipes')">Cancel</button>
            <button type="submit" class="btn btn-primary">{{ isEdit ? 'Save Changes' : 'Add Recipe' }}</button>
          </div>
        </div>
      </form>
    </div>
  `,
})
