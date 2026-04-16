import { defineComponent, ref, computed } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js'
import { calcRecipeStats } from '../calculations.js'

const SORT_OPTIONS = [
  { value: 'name',           label: 'Name (A–Z)'              },
  { value: 'price_asc',      label: 'Price/serving (low → high)' },
  { value: 'price_desc',     label: 'Price/serving (high → low)' },
  { value: 'cal_asc',        label: 'Calories (low → high)'   },
  { value: 'cal_desc',       label: 'Calories (high → low)'   },
  { value: 'cost_per_cal',   label: 'Best value: $/100 cal'   },
  { value: 'cost_per_prot',  label: 'Best value: $/g protein' },
  { value: 'protein_desc',   label: 'Protein (high → low)'    },
  { value: 'carbs_asc',      label: 'Carbs (low → high)'      },
  { value: 'sodium_asc',     label: 'Sodium (low → high)'     },
]

export default defineComponent({
  name: 'RecipeSearch',
  props: { store: Object },
  emits: ['navigate'],
  setup(props) {
    const f = ref({
      name:          '',
      maxPrice:      '',
      minCal:        '',
      maxCal:        '',
      minProtein:    '',
      maxCarbs:      '',
      maxSodium:     '',
      maxFat:        '',
      minFiber:      '',
      maxCholesterol:'',
      sortBy:        'name',
    })

    function clearFilters() {
      Object.keys(f.value).forEach(k => { f.value[k] = k === 'sortBy' ? 'name' : '' })
    }

    function applyPreset(preset) {
      clearFilters()
      if (preset === 'keto')        { f.value.maxCarbs = 20; f.value.sortBy = 'price_asc' }
      if (preset === 'highcal')     { f.value.minCal   = 600; f.value.sortBy = 'cost_per_cal' }
      if (preset === 'hiprotein')   { f.value.minProtein = 30; f.value.sortBy = 'cost_per_prot' }
      if (preset === 'budget')      { f.value.maxPrice = 3; f.value.sortBy = 'price_asc' }
      if (preset === 'lowcal')      { f.value.maxCal   = 400; f.value.sortBy = 'cal_asc' }
      if (preset === 'lowsodium')   { f.value.maxSodium = 600; f.value.sortBy = 'sodium_asc' }
    }

    const num = v => v === '' ? null : Number(v)

    const results = computed(() => {
      const allStats = props.store.recipes.map(recipe => ({
        recipe,
        stats: calcRecipeStats(recipe, props.store.ingredients),
      }))

      const filtered = allStats.filter(({ recipe, stats }) => {
        const n = stats.nutrientsPerServing

        if (f.value.name && !recipe.name.toLowerCase().includes(f.value.name.toLowerCase())) return false

        const maxP = num(f.value.maxPrice)
        if (maxP !== null && stats.pricePerServing > maxP) return false

        if (n) {
          const minCal = num(f.value.minCal);   if (minCal !== null && n.kCal < minCal) return false
          const maxCal = num(f.value.maxCal);   if (maxCal !== null && n.kCal > maxCal) return false
          const minPro = num(f.value.minProtein); if (minPro !== null && n.protein < minPro) return false
          const maxCar = num(f.value.maxCarbs);  if (maxCar !== null && n.carbohydrates > maxCar) return false
          const maxSod = num(f.value.maxSodium); if (maxSod !== null && n.sodium > maxSod) return false
          const minFib = num(f.value.minFiber);  if (minFib !== null && n.fiber < minFib) return false
          const maxCho = num(f.value.maxCholesterol); if (maxCho !== null && n.cholesterol > maxCho) return false
          if (f.value.maxFat !== '') {
            const maxFat = num(f.value.maxFat)
            const fatTotal = n.fat?.total ?? null
            if (fatTotal !== null && fatTotal > maxFat) return false
          }
        } else {
          // If any nutrient filter is set, exclude recipes with no data
          const nutrientFiltersSet = [
            f.value.minCal, f.value.maxCal, f.value.minProtein,
            f.value.maxCarbs, f.value.maxSodium, f.value.maxFat,
            f.value.minFiber, f.value.maxCholesterol,
          ].some(v => v !== '')
          if (nutrientFiltersSet) return false
        }

        return true
      })

      const s = f.value.sortBy
      filtered.sort((a, b) => {
        const an = a.stats.nutrientsPerServing
        const bn = b.stats.nutrientsPerServing
        if (s === 'name')          return a.recipe.name.localeCompare(b.recipe.name)
        if (s === 'price_asc')     return a.stats.pricePerServing - b.stats.pricePerServing
        if (s === 'price_desc')    return b.stats.pricePerServing - a.stats.pricePerServing
        if (s === 'cal_asc')       return (an?.kCal ?? Infinity)  - (bn?.kCal ?? Infinity)
        if (s === 'cal_desc')      return (bn?.kCal ?? -Infinity) - (an?.kCal ?? -Infinity)
        if (s === 'cost_per_cal')  return (a.stats.costPerCalorie ?? Infinity) - (b.stats.costPerCalorie ?? Infinity)
        if (s === 'cost_per_prot') return (a.stats.costPerProtein ?? Infinity) - (b.stats.costPerProtein ?? Infinity)
        if (s === 'protein_desc')  return (bn?.protein ?? -Infinity) - (an?.protein ?? -Infinity)
        if (s === 'carbs_asc')     return (an?.carbohydrates ?? Infinity) - (bn?.carbohydrates ?? Infinity)
        if (s === 'sodium_asc')    return (an?.sodium ?? Infinity) - (bn?.sodium ?? Infinity)
        return 0
      })

      return filtered
    })

    return { f, results, SORT_OPTIONS, clearFilters, applyPreset }
  },
  template: `
    <div class="view">
      <div class="view-header">
        <h1>Search &amp; Filter Recipes</h1>
      </div>

      <div class="search-layout">
        <div class="filter-panel">
          <div class="filter-panel-header">
            <span>Filters</span>
            <button class="btn btn-ghost btn-sm" @click="clearFilters">Clear all</button>
          </div>

          <div class="filter-section">
            <label class="filter-label">Presets</label>
            <div class="preset-grid">
              <button class="preset-btn" @click="applyPreset('keto')">🥑 Keto</button>
              <button class="preset-btn" @click="applyPreset('highcal')">💪 High Calorie</button>
              <button class="preset-btn" @click="applyPreset('hiprotein')">🍗 High Protein</button>
              <button class="preset-btn" @click="applyPreset('budget')">💰 Budget (&lt;$3)</button>
              <button class="preset-btn" @click="applyPreset('lowcal')">🥗 Low Calorie</button>
              <button class="preset-btn" @click="applyPreset('lowsodium')">❤️ Low Sodium</button>
            </div>
          </div>

          <div class="filter-section">
            <label class="filter-label">Name</label>
            <input v-model="f.name" type="text" placeholder="Search by name..." class="filter-input" />
          </div>

          <div class="filter-section">
            <label class="filter-label">Sort By</label>
            <select v-model="f.sortBy" class="filter-input">
              <option v-for="opt in SORT_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>

          <div class="filter-section">
            <label class="filter-label">Price / Serving ($)</label>
            <div class="range-row">
              <input v-model="f.maxPrice" type="number" min="0" step="0.01" placeholder="max" class="filter-input" />
            </div>
          </div>

          <div class="filter-section">
            <label class="filter-label">Calories / Serving</label>
            <div class="range-row">
              <input v-model="f.minCal" type="number" min="0" placeholder="min" class="filter-input half" />
              <span class="range-sep">–</span>
              <input v-model="f.maxCal" type="number" min="0" placeholder="max" class="filter-input half" />
            </div>
          </div>

          <div class="filter-section">
            <label class="filter-label">Protein (g) — min</label>
            <input v-model="f.minProtein" type="number" min="0" placeholder="min" class="filter-input" />
          </div>

          <div class="filter-section">
            <label class="filter-label">Carbs (g) — max</label>
            <input v-model="f.maxCarbs" type="number" min="0" placeholder="max" class="filter-input" />
            <span class="filter-hint">Set ≤ 20g for keto</span>
          </div>

          <div class="filter-section">
            <label class="filter-label">Sodium (mg) — max</label>
            <input v-model="f.maxSodium" type="number" min="0" placeholder="max" class="filter-input" />
          </div>

          <div class="filter-section">
            <label class="filter-label">Total Fat (g) — max</label>
            <input v-model="f.maxFat" type="number" min="0" placeholder="max" class="filter-input" />
          </div>

          <div class="filter-section">
            <label class="filter-label">Fiber (g) — min</label>
            <input v-model="f.minFiber" type="number" min="0" placeholder="min" class="filter-input" />
          </div>

          <div class="filter-section">
            <label class="filter-label">Cholesterol (mg) — max</label>
            <input v-model="f.maxCholesterol" type="number" min="0" placeholder="max" class="filter-input" />
          </div>
        </div>

        <div class="search-results">
          <p class="results-count">{{ results.length }} recipe{{ results.length !== 1 ? 's' : '' }} found</p>
          <div v-if="results.length === 0" class="empty-state">
            No recipes match your filters.
          </div>
          <div
            class="result-card"
            v-for="{ recipe, stats } in results"
            :key="recipe.name"
            @click="$emit('navigate', 'recipe-detail', { recipe })"
          >
            <div class="result-header">
              <h3>{{ recipe.name }}</h3>
              <span class="price-badge">{{ '$' + stats.pricePerServing.toFixed(2) }}/serving</span>
            </div>
            <div class="result-stats" v-if="stats.nutrientsPerServing">
              <div class="stat-item">
                <span class="stat-value">{{ stats.nutrientsPerServing.kCal }}</span>
                <span class="stat-label">kcal</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ stats.nutrientsPerServing.protein }}g</span>
                <span class="stat-label">protein</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ stats.nutrientsPerServing.carbohydrates }}g</span>
                <span class="stat-label">carbs</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ stats.nutrientsPerServing.sodium }}mg</span>
                <span class="stat-label">sodium</span>
              </div>
              <div class="stat-item" v-if="stats.nutrientsPerServing.fat">
                <span class="stat-value">{{ stats.nutrientsPerServing.fat.total }}g</span>
                <span class="stat-label">fat</span>
              </div>
              <div class="stat-item" v-if="stats.costPerCalorie">
                <span class="stat-value">{{ '$' + stats.costPerCalorie.toFixed(2) }}</span>
                <span class="stat-label">per 100 cal</span>
              </div>
              <div class="stat-item" v-if="stats.costPerProtein">
                <span class="stat-value">{{ '$' + stats.costPerProtein.toFixed(4) }}</span>
                <span class="stat-label">per g prot</span>
              </div>
            </div>
            <p class="no-data" v-else>No nutrient data</p>
            <p class="muted small" v-if="recipe.directions">{{ recipe.directions.slice(0, 80) }}{{ recipe.directions.length > 80 ? '…' : '' }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
