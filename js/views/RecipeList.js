import { defineComponent, computed } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js'
import { calcRecipeStats } from '../calculations.js'

export default defineComponent({
  name: 'RecipeList',
  props: { store: Object },
  emits: ['navigate'],
  setup(props, { emit }) {
    const recipesWithStats = computed(() =>
      props.store.recipes.map(recipe => ({
        recipe,
        stats: calcRecipeStats(recipe, props.store.ingredients),
      }))
    )
    function deleteRecipe(name) {
      if (confirm(`Delete "${name}"? This cannot be undone.`))
        props.store.deleteRecipe(name)
    }
    return { recipesWithStats, deleteRecipe }
  },
  template: `
    <div class="view">
      <div class="view-header">
        <h1>Recipes</h1>
        <button class="btn btn-primary" @click="$emit('navigate', 'recipe-form', {})">+ Add Recipe</button>
      </div>
      <div v-if="recipesWithStats.length === 0" class="empty-state">
        <p>No recipes yet.</p>
        <p>Add some ingredients first, then create a recipe.</p>
      </div>
      <div class="card-grid" v-else>
        <div
          class="card card-clickable"
          v-for="{ recipe, stats } in recipesWithStats"
          :key="recipe.name"
          @click="$emit('navigate', 'recipe-detail', { recipe })"
        >
          <div class="card-header">
            <h3 class="card-title">{{ recipe.name }}</h3>
            <div class="card-actions" @click.stop>
              <button class="btn btn-sm btn-secondary" @click="$emit('navigate', 'recipe-form', { recipe })">Edit</button>
            </div>
          </div>
          <div class="card-body">
            <p class="price-line">
              {{ '$' + stats.pricePerServing.toFixed(2) }}/serving
              <span class="muted">· {{ recipe.servings }} serving{{ recipe.servings !== 1 ? 's' : '' }}</span>
            </p>
            <div v-if="stats.nutrientsPerServing" class="chip-row">
              <span class="chip">{{ stats.nutrientsPerServing.kCal }} kcal</span>
              <span class="chip">{{ stats.nutrientsPerServing.protein }}g protein</span>
              <span class="chip">{{ stats.nutrientsPerServing.carbohydrates }}g carbs</span>
              <span class="chip chip-warn" v-if="stats.nutrientsPerServing.incomplete">⚠ Partial nutrients</span>
            </div>
            <p v-else class="no-data">No nutrient data</p>
            <p class="muted small" v-if="stats.missingIngredients.length">
              ⚠ Missing: {{ stats.missingIngredients.join(', ') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
