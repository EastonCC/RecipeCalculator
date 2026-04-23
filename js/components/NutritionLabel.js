import { defineComponent } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js'

export default defineComponent({
  name: 'NutritionLabel',
  props: {
    nutrients:  { type: Object, default: null },   // nutrientsPerServing
    servingLabel: { type: String, default: 'Per serving' },
    breakdown:  { type: Array,  default: () => [] }, // [{ name, kCal, pct }]
  },
  template: `
    <div v-if="nutrients">
      <div class="nutrition-label">
        <div class="nl-title">Nutrition Facts</div>
        <div class="nl-serving">{{ servingLabel }}</div>
        <div class="nl-divider thick"></div>
        <div class="nl-calories">
          <span>Calories</span>
          <span>{{ nutrients.kCal }}</span>
        </div>
        <div class="nl-divider thick"></div>
        <div class="nl-row"><span>Total Fat</span><span>{{ nutrients.fat?.total ?? '—' }}g</span></div>
        <template v-if="nutrients.fat">
          <div class="nl-row indent"><span>Saturated Fat</span><span>{{ nutrients.fat.saturated }}g</span></div>
          <div class="nl-row indent"><span>Trans Fat</span><span>{{ nutrients.fat.trans }}g</span></div>
        </template>
        <div class="nl-row"><span>Cholesterol</span><span>{{ nutrients.cholesterol }}mg</span></div>
        <div class="nl-row"><span>Sodium</span><span>{{ nutrients.sodium }}mg</span></div>
        <div class="nl-row"><span>Total Carbohydrates</span><span>{{ nutrients.carbohydrates }}g</span></div>
        <div class="nl-row indent"><span>Dietary Fiber</span><span>{{ nutrients.fiber }}g</span></div>
        <template v-if="nutrients.sugar">
          <div class="nl-row indent"><span>Total Sugars</span><span>{{ nutrients.sugar.total }}g</span></div>
          <div class="nl-row indent2"><span>Incl. {{ nutrients.sugar.added }}g Added Sugars</span></div>
        </template>
        <div class="nl-row bold"><span>Protein</span><span>{{ nutrients.protein }}g</span></div>
        <div class="nl-divider thick"></div>
        <p class="nl-note" v-if="nutrients.incomplete">
          ⚠ Some ingredients have no nutrient data — values may be understated.
        </p>
      </div>

      <div class="calorie-receipt" v-if="breakdown.length > 0 && nutrients.kCal > 0">
        <div class="cr-title">Calories by ingredient</div>
        <div class="cr-row" v-for="item in breakdown" :key="item.name">
          <span class="cr-name" :title="item.name">{{ item.name }}</span>
          <div class="cr-bar-wrap">
            <div class="cr-bar" :style="{ width: item.pct + '%' }"></div>
          </div>
          <span class="cr-val">{{ item.kCal }} kcal</span>
          <span class="cr-pct">{{ item.pct }}%</span>
        </div>
        <div class="cr-total">
          <span>Total</span>
          <span>{{ nutrients.kCal }} kcal</span>
        </div>
      </div>
    </div>

    <div class="stat-card" v-else>
      <p class="no-data">No nutrient data available.<br>Add nutrient info to ingredients to see this.</p>
    </div>
  `,
})
