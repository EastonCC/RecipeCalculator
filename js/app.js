import { createApp, defineComponent, ref } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js'
import { store }          from './store.js'
import RecipeList         from './views/RecipeList.js'
import RecipeDetail       from './views/RecipeDetail.js'
import RecipeForm         from './views/RecipeForm.js'
import IngredientList     from './views/IngredientList.js'
import IngredientForm     from './views/IngredientForm.js'
import RecipeSearch       from './views/RecipeSearch.js'
import MealCalculator     from './views/MealCalculator.js'

const RECIPE_VIEWS     = new Set(['recipes', 'recipe-detail', 'recipe-form'])
const INGREDIENT_VIEWS = new Set(['ingredients', 'ingredient-form'])

const App = defineComponent({
  components: { RecipeList, RecipeDetail, RecipeForm, IngredientList, IngredientForm, RecipeSearch, MealCalculator },
  setup() {
    const currentView  = ref('recipes')
    const viewParams   = ref({})
    const importStatus = ref('')

    function navigate(view, params = {}) {
      currentView.value = view
      viewParams.value  = params
      window.scrollTo(0, 0)
    }

    function exportData() {
      const data = { ingredients: store.ingredients, recipes: store.recipes }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = 'recipecalculator-export.json'
      a.click()
      URL.revokeObjectURL(url)
    }

    function triggerImport() {
      document.getElementById('import-file-input').click()
    }

    function handleImport(event) {
      const file = event.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const data = JSON.parse(e.target.result)
          let ingCount = 0, recipeCount = 0
          if (Array.isArray(data.ingredients)) {
            data.ingredients.forEach(ing => { store.saveIngredient(ing); ingCount++ })
          }
          if (Array.isArray(data.recipes)) {
            data.recipes.forEach(recipe => { store.saveRecipe(recipe); recipeCount++ })
          }
          importStatus.value = `Imported ${ingCount} ingredient${ingCount !== 1 ? 's' : ''} and ${recipeCount} recipe${recipeCount !== 1 ? 's' : ''}.`
          setTimeout(() => { importStatus.value = '' }, 4000)
        } catch {
          importStatus.value = 'Import failed: invalid file.'
          setTimeout(() => { importStatus.value = '' }, 4000)
        }
        event.target.value = ''
      }
      reader.readAsText(file)
    }

    return { currentView, viewParams, navigate, store, RECIPE_VIEWS, INGREDIENT_VIEWS, importStatus, exportData, triggerImport, handleImport }
  },
  template: `
    <div class="app-layout">
      <aside class="sidebar">
        <div class="sidebar-brand">Recipe Calculator</div>
        <nav class="sidebar-nav">
          <button
            class="nav-item"
            :class="{ active: RECIPE_VIEWS.has(currentView) }"
            @click="navigate('recipes')"
          >Recipes</button>
          <button
            class="nav-item"
            :class="{ active: INGREDIENT_VIEWS.has(currentView) }"
            @click="navigate('ingredients')"
          >Ingredients</button>
          <button
            class="nav-item"
            :class="{ active: currentView === 'search' }"
            @click="navigate('search')"
          >Search &amp; Filter</button>
          <button
            class="nav-item"
            :class="{ active: currentView === 'meal' }"
            @click="navigate('meal')"
          >Meal Calculator</button>
        </nav>

        <div class="sidebar-section-title">Data</div>
        <div class="sidebar-data">
          <button class="sidebar-action-btn" @click="exportData">Export JSON</button>
          <button class="sidebar-action-btn" @click="triggerImport">Import JSON</button>
          <input
            id="import-file-input"
            type="file"
            accept=".json,application/json"
            style="display:none"
            @change="handleImport"
          />
          <p v-if="importStatus" class="import-status">{{ importStatus }}</p>
        </div>

        <div class="sidebar-footer">
          <span>{{ store.recipes.length }} recipe{{ store.recipes.length !== 1 ? 's' : '' }}</span>
          <span>{{ store.ingredients.length }} ingredient{{ store.ingredients.length !== 1 ? 's' : '' }}</span>
        </div>
      </aside>

      <main class="main-content">
        <RecipeList     v-if="currentView === 'recipes'"              :store="store" @navigate="navigate" />
        <RecipeDetail   v-else-if="currentView === 'recipe-detail'"   :store="store" :recipe="viewParams.recipe" @navigate="navigate" />
        <RecipeForm     v-else-if="currentView === 'recipe-form'"     :store="store" :recipe="viewParams.recipe" :prefill="viewParams.prefill" @navigate="navigate" />
        <IngredientList v-else-if="currentView === 'ingredients'"     :store="store" @navigate="navigate" />
        <IngredientForm v-else-if="currentView === 'ingredient-form'" :store="store" :ingredient="viewParams.ingredient" @navigate="navigate" />
        <RecipeSearch   v-else-if="currentView === 'search'"          :store="store" @navigate="navigate" />
        <MealCalculator v-else-if="currentView === 'meal'"           :store="store" @navigate="navigate" />
      </main>
    </div>
  `,
})

createApp(App).mount('#app')
