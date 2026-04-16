import { createApp, defineComponent, ref, watch } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js'
import { store }          from './store.js'
import RecipeList         from './views/RecipeList.js'
import RecipeDetail       from './views/RecipeDetail.js'
import RecipeForm         from './views/RecipeForm.js'
import IngredientList     from './views/IngredientList.js'
import IngredientForm     from './views/IngredientForm.js'
import RecipeSearch       from './views/RecipeSearch.js'

const RECIPE_VIEWS     = new Set(['recipes', 'recipe-detail', 'recipe-form'])
const INGREDIENT_VIEWS = new Set(['ingredients', 'ingredient-form'])

const App = defineComponent({
  components: { RecipeList, RecipeDetail, RecipeForm, IngredientList, IngredientForm, RecipeSearch },
  setup() {
    const currentView = ref('recipes')
    const viewParams  = ref({})

    function navigate(view, params = {}) {
      currentView.value = view
      viewParams.value  = params
      window.scrollTo(0, 0)
    }

    return { currentView, viewParams, navigate, store, RECIPE_VIEWS, INGREDIENT_VIEWS }
  },
  template: `
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sidebar-brand">🍽 Recipe Calc</div>
        <nav class="sidebar-nav">
          <button
            class="nav-item"
            :class="{ active: RECIPE_VIEWS.has(currentView) }"
            @click="navigate('recipes')"
          >
            <span class="nav-icon">📋</span> Recipes
          </button>
          <button
            class="nav-item"
            :class="{ active: INGREDIENT_VIEWS.has(currentView) }"
            @click="navigate('ingredients')"
          >
            <span class="nav-icon">🥕</span> Ingredients
          </button>
          <button
            class="nav-item"
            :class="{ active: currentView === 'search' }"
            @click="navigate('search')"
          >
            <span class="nav-icon">🔍</span> Search &amp; Filter
          </button>
        </nav>
        <div class="sidebar-footer">
          <span>{{ store.recipes.length }} recipe{{ store.recipes.length !== 1 ? 's' : '' }}</span>
          <span>{{ store.ingredients.length }} ingredient{{ store.ingredients.length !== 1 ? 's' : '' }}</span>
        </div>
      </aside>

      <main class="main-content">
        <RecipeList     v-if="currentView === 'recipes'"       :store="store" @navigate="navigate" />
        <RecipeDetail   v-else-if="currentView === 'recipe-detail'"   :store="store" :recipe="viewParams.recipe" @navigate="navigate" />
        <RecipeForm     v-else-if="currentView === 'recipe-form'"     :store="store" :recipe="viewParams.recipe" @navigate="navigate" />
        <IngredientList v-else-if="currentView === 'ingredients'"     :store="store" @navigate="navigate" />
        <IngredientForm v-else-if="currentView === 'ingredient-form'" :store="store" :ingredient="viewParams.ingredient" @navigate="navigate" />
        <RecipeSearch   v-else-if="currentView === 'search'"          :store="store" @navigate="navigate" />
      </main>
    </div>
  `,
})

createApp(App).mount('#app')
