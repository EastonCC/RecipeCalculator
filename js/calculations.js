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
  { key: 'FLOZ',    label: 'Fl oz',  plural: 'Fl oz',  toBase: 29.5735,  dimension: 'VOLUME' },
  { key: 'PINT',    label: 'Pint',   toBase: 473.176,  dimension: 'VOLUME' },
  { key: 'QUART',   label: 'Quart',  toBase: 946.353,  dimension: 'VOLUME' },
  { key: 'GALLON',  label: 'Gallon', toBase: 3785.41,  dimension: 'VOLUME' },
  { key: 'UNIT',       label: 'Unit(s)',    toBase: null,     dimension: 'COUNT'  },
]

// Units valid for purchase/unitSize (everything except UNIT itself)
export const MEASURABLE_UNITS = UNITS.filter(u => u.key !== 'UNIT')

const UNIT_MAP = Object.fromEntries(UNITS.map(u => [u.key, u]))

export function unitLabel(key) {
  // handle legacy 'FL OZ' key saved before key was normalised to 'FLOZ'
  const unit = UNIT_MAP[key] ?? UNIT_MAP[key?.replace(/\s+/g, '')]
  return unit?.label ?? key
}

// "per Pound", "per 2 Pounds", "per Tablespoon", etc.
export function formatUnitAmount(amount, key) {
  const unit = UNIT_MAP[key] ?? UNIT_MAP[key?.replace(/\s+/g, '')]
  if (!unit) return `${amount} ${key}`
  const label = amount === 1
    ? unit.label
    : (unit.plural ?? unit.label + 's')
  return amount === 1 ? label : `${amount} ${label}`
}

export function convertUnit(amount, fromKey, toKey, unitSize = null) {
  if (fromKey === 'UNIT') {
    if (!unitSize) return null
    // Expand count → physical amount, then convert normally
    return convertUnit(amount * unitSize.amount, unitSize.unit, toKey)
  }
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
  const calorieBreakdown = []

  for (const ri of recipe.ingredients) {
    const ing = allIngredients.find(i => i.name === ri.ingredientName)
    if (!ing) { missingIngredients.push(ri.ingredientName); continue }

    const recipeAmt  = Number(ri.servingSize.amount)
    const purchaseAmt = Number(ing.unitWeight.amount)
    const converted  = convertUnit(recipeAmt, ri.servingSize.unit, ing.unitWeight.unit, ing.unitSize || null)
    if (converted === null || purchaseAmt === 0) continue

    const fraction = converted / purchaseAmt
    totalPrice += fraction * Number(ing.unitPrice)

    if (ing.nutrients) {
      hasNutrients = true
      // If a serving size is defined, nutrients are per that serving — scale accordingly.
      // Otherwise fall back to old behaviour: nutrients are per purchaseAmt purchase units.
      let nf = fraction  // nutrient fraction
      if (ing.nutrients.servingSize) {
        const servingInPurchaseUnit = convertUnit(
          ing.nutrients.servingSize.amount,
          ing.nutrients.servingSize.unit,
          ing.unitWeight.unit
        )
        if (servingInPurchaseUnit !== null && servingInPurchaseUnit > 0)
          nf = converted / servingInPurchaseUnit
      }

      const ingKCal = (ing.nutrients.kCal || 0) * nf
      n.kCal          += ingKCal
      n.carbohydrates += (ing.nutrients.carbohydrates || 0) * nf
      n.protein       += (ing.nutrients.protein       || 0) * nf
      n.sodium        += (ing.nutrients.sodium        || 0) * nf
      n.cholesterol   += (ing.nutrients.cholesterol   || 0) * nf
      n.fiber         += (ing.nutrients.fiber         || 0) * nf

      if (ing.nutrients.fat) {
        if (!n.fat) n.fat = { saturated: 0, unsaturated: 0, trans: 0 }
        n.fat.saturated   += (ing.nutrients.fat.saturated   || 0) * nf
        n.fat.unsaturated += (ing.nutrients.fat.unsaturated || 0) * nf
        n.fat.trans       += (ing.nutrients.fat.trans       || 0) * nf
      }
      if (ing.nutrients.sugar) {
        if (!n.sugar) n.sugar = { total: 0, added: 0 }
        n.sugar.total += (ing.nutrients.sugar.total || 0) * nf
        n.sugar.added += (ing.nutrients.sugar.added || 0) * nf
      }

      calorieBreakdown.push({ name: ri.ingredientName, kCal: ingKCal })
    } else {
      incompleteNutrients = true
      calorieBreakdown.push({ name: ri.ingredientName, kCal: 0 })
    }
  }

  const servings = Math.max(1, Number(recipe.servings) || 1)
  const pricePerServing = totalPrice / servings
  const r = v => Math.round(v * 10) / 10

  const perServing = hasNutrients ? {
    kCal:          Math.round(n.kCal  / servings),
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

  const totalKCal = n.kCal
  const breakdown = calorieBreakdown.map(item => ({
    name: item.name,
    kCal: Math.round(item.kCal / Math.max(1, Number(recipe.servings) || 1)),
    pct:  totalKCal > 0 ? Math.round((item.kCal / totalKCal) * 100) : 0,
  }))

  return {
    totalPrice,
    pricePerServing,
    nutrientsPerServing: perServing,
    costPerCalorie: perServing?.kCal > 0 ? (pricePerServing / perServing.kCal) * 100 : null,
    costPerProtein: perServing?.protein > 0 ? pricePerServing / perServing.protein : null,
    missingIngredients,
    calorieBreakdown: breakdown,
  }
}
