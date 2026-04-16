export const UNITS = [
  { key: 'GRAM',       label: 'Gram',       toBase: 1.0,      dimension: 'MASS'   },
  { key: 'KILOGRAM',   label: 'Kilogram',   toBase: 1000.0,   dimension: 'MASS'   },
  { key: 'POUND',      label: 'Pound',      toBase: 453.592,  dimension: 'MASS'   },
  { key: 'OUNCE',      label: 'Ounce',      toBase: 28.3495,  dimension: 'MASS'   },
  { key: 'MILLILITER', label: 'Milliliter', toBase: 1.0,      dimension: 'VOLUME' },
  { key: 'LITER',      label: 'Liter',      toBase: 1000.0,   dimension: 'VOLUME' },
  { key: 'TABLESPOON', label: 'Tablespoon', toBase: 14.787,   dimension: 'VOLUME' },
  { key: 'TEASPOON',   label: 'Teaspoon',   toBase: 4.929,    dimension: 'VOLUME' },
  { key: 'CUP',        label: 'Cup',        toBase: 236.588,  dimension: 'VOLUME' },
]

const UNIT_MAP = Object.fromEntries(UNITS.map(u => [u.key, u]))

export function unitLabel(key) {
  return UNIT_MAP[key]?.label ?? key
}

export function convertUnit(amount, fromKey, toKey) {
  const from = UNIT_MAP[fromKey]
  const to   = UNIT_MAP[toKey]
  if (!from || !to || from.dimension !== to.dimension) return null
  return (amount * from.toBase) / to.toBase
}

// recipe: { ingredients: [{ ingredientName, servingSize: { amount, unit } }], servings }
// allIngredients: Ingredient[] from store
export function calcRecipeStats(recipe, allIngredients) {
  let totalPrice = 0
  let n = { kCal: 0, carbohydrates: 0, protein: 0, sodium: 0, cholesterol: 0, fiber: 0, fat: null, sugar: null }
  let hasNutrients = false
  let incompleteNutrients = false
  let missingIngredients = []

  for (const ri of recipe.ingredients) {
    const ing = allIngredients.find(i => i.name === ri.ingredientName)
    if (!ing) { missingIngredients.push(ri.ingredientName); continue }

    const recipeAmt  = Number(ri.servingSize.amount)
    const purchaseAmt = Number(ing.unitWeight.amount)
    const converted  = convertUnit(recipeAmt, ri.servingSize.unit, ing.unitWeight.unit)
    if (converted === null || purchaseAmt === 0) continue

    const fraction = converted / purchaseAmt
    totalPrice += fraction * Number(ing.unitPrice)

    if (ing.nutrients) {
      hasNutrients = true
      n.kCal          += (ing.nutrients.kCal          || 0) * fraction
      n.carbohydrates += (ing.nutrients.carbohydrates || 0) * fraction
      n.protein       += (ing.nutrients.protein       || 0) * fraction
      n.sodium        += (ing.nutrients.sodium        || 0) * fraction
      n.cholesterol   += (ing.nutrients.cholesterol   || 0) * fraction
      n.fiber         += (ing.nutrients.fiber         || 0) * fraction

      if (ing.nutrients.fat) {
        if (!n.fat) n.fat = { saturated: 0, unsaturated: 0, trans: 0 }
        n.fat.saturated   += (ing.nutrients.fat.saturated   || 0) * fraction
        n.fat.unsaturated += (ing.nutrients.fat.unsaturated || 0) * fraction
        n.fat.trans       += (ing.nutrients.fat.trans       || 0) * fraction
      }
      if (ing.nutrients.sugar) {
        if (!n.sugar) n.sugar = { total: 0, added: 0 }
        n.sugar.total += (ing.nutrients.sugar.total || 0) * fraction
        n.sugar.added += (ing.nutrients.sugar.added || 0) * fraction
      }
    } else {
      incompleteNutrients = true
    }
  }

  const servings = Math.max(1, Number(recipe.servings) || 1)
  const pricePerServing = totalPrice / servings
  const r = v => Math.round(v * 10) / 10

  const perServing = hasNutrients ? {
    kCal:          r(n.kCal          / servings),
    carbohydrates: r(n.carbohydrates / servings),
    protein:       r(n.protein       / servings),
    sodium:        r(n.sodium        / servings),
    cholesterol:   r(n.cholesterol   / servings),
    fiber:         r(n.fiber         / servings),
    fat: n.fat ? {
      saturated:   r(n.fat.saturated   / servings),
      unsaturated: r(n.fat.unsaturated / servings),
      trans:       r(n.fat.trans       / servings),
      total:       r((n.fat.saturated + n.fat.unsaturated + n.fat.trans) / servings),
    } : null,
    sugar: n.sugar ? {
      total: r(n.sugar.total / servings),
      added: r(n.sugar.added / servings),
    } : null,
    incomplete: incompleteNutrients,
  } : null

  return {
    totalPrice,
    pricePerServing,
    nutrientsPerServing: perServing,
    costPerCalorie: perServing?.kCal > 0 ? pricePerServing / perServing.kCal : null,
    costPerProtein: perServing?.protein > 0 ? pricePerServing / perServing.protein : null,
    missingIngredients,
  }
}
