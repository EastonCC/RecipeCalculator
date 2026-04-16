import { reactive } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js'

const KEYS = { ingredients: 'rc_ingredients', recipes: 'rc_recipes' }

function load(key) {
  try { return JSON.parse(localStorage.getItem(key)) || [] }
  catch { return [] }
}

export const store = reactive({
  ingredients: load(KEYS.ingredients),
  recipes:     load(KEYS.recipes),

  saveIngredient(ingredient) {
    const idx = this.ingredients.findIndex(i => i.name === ingredient.name)
    if (idx >= 0) this.ingredients[idx] = ingredient
    else this.ingredients.push(ingredient)
    localStorage.setItem(KEYS.ingredients, JSON.stringify(this.ingredients))
  },

  deleteIngredient(name) {
    this.ingredients = this.ingredients.filter(i => i.name !== name)
    localStorage.setItem(KEYS.ingredients, JSON.stringify(this.ingredients))
  },

  saveRecipe(recipe) {
    const idx = this.recipes.findIndex(r => r.name === recipe.name)
    if (idx >= 0) this.recipes[idx] = recipe
    else this.recipes.push(recipe)
    localStorage.setItem(KEYS.recipes, JSON.stringify(this.recipes))
  },

  deleteRecipe(name) {
    this.recipes = this.recipes.filter(r => r.name !== name)
    localStorage.setItem(KEYS.recipes, JSON.stringify(this.recipes))
  },
})
