import { defineComponent, computed } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js'
import { calcRecipeStats, unitLabel } from '../calculations.js'

export default defineComponent({
  name: 'RecipeDetail',
  props: { store: Object, recipe: Object },
  emits: ['navigate'],
  setup(props, { emit }) {
    const stats = computed(() => calcRecipeStats(props.recipe, props.store.ingredients))

    function resolveIngredient(name) {
      return props.store.ingredients.find(i => i.name === name) || null
    }

    return { stats, resolveIngredient, unitLabel }
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

          <!-- Ingredients -->
          <div class="detail-section">
            <h2>Ingredients</h2>
            <table class="data-table">
              <thead>
                <tr><th>Ingredient</th><th>Amount</th><th>Price contrib.</th></tr>
              </thead>
              <tbody>
                <tr v-for="ri in recipe.ingredients" :key="ri.ingredientName">
                  <td>{{ ri.ingredientName }}</td>
                  <td>{{ ri.servingSize.amount }} {{ unitLabel(ri.servingSize.unit) }}</td>
                  <td>
                    <span v-if="resolveIngredient(ri.ingredientName)" class="muted">—</span>
                    <span v-else class="chip chip-warn">Missing</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <p class="muted small" v-if="stats.missingIngredients.length">
              ⚠ Some ingredients not found in your list: {{ stats.missingIngredients.join(', ') }}
            </p>
          </div>

          <!-- Directions -->
          <div class="detail-section" v-if="recipe.directions">
            <h2>Directions</h2>
            <p class="directions-text">{{ recipe.directions }}</p>
          </div>

        </div>

        <div class="detail-sidebar">

          <!-- Price -->
          <div class="stat-card">
            <div class="stat-header">Cost</div>
            <div class="stat-row"><span>Total recipe</span><strong>{{ '$' + stats.totalPrice.toFixed(2) }}</strong></div>
            <div class="stat-row"><span>Per serving</span><strong>{{ '$' + stats.pricePerServing.toFixed(2) }}</strong></div>
            <div class="stat-row muted small"><span>Servings</span><span>{{ recipe.servings }}</span></div>
            <template v-if="stats.costPerCalorie">
              <div class="stat-divider"></div>
              <div class="stat-row"><span>Per calorie</span><strong>{{ '$' + stats.costPerCalorie.toFixed(4) }}</strong></div>
            </template>
            <template v-if="stats.costPerProtein">
              <div class="stat-row"><span>Per g protein</span><strong>{{ '$' + stats.costPerProtein.toFixed(4) }}</strong></div>
            </template>
          </div>

          <!-- Nutrition Facts -->
          <div class="nutrition-label" v-if="stats.nutrientsPerServing">
            <div class="nl-title">Nutrition Facts</div>
            <div class="nl-serving">Per serving</div>
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

        </div>
      </div>
    </div>
  `,
})
