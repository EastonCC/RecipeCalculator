
public class Recipe implements java.io.Serializable {
	private static final long serialVersionUID = -5563995235506349770L;
	private RecipeIngredient[] recipeIngredients;
	private String directions;
	private String recipeName;
	private ServingSize servingSize;
	private int servings;
	
    private Recipe(Builder b) {
        this.recipeIngredients = b.recipeIngredients;
        this.recipeName = b.recipeName;
        this.directions = b.directions;
        this.servingSize = b.servingSize;
        this.servings = b.servings;
    }

    public static class Builder {
        // required
        private final RecipeIngredient[] recipeIngredients;
        private final String recipeName;

        // optional
        private String directions = null;
        private ServingSize servingSize = null;
        private int servings = 1;

        public Builder(RecipeIngredient[] recipeIngredients, String recipeName) {
            this.recipeIngredients = recipeIngredients;
            this.recipeName = recipeName;
        }

        public Builder directions(String directions) {
            this.directions = directions;
            return this;
        }

        public Builder servingSize(ServingSize servingSize) {
            this.servingSize = servingSize;
            return this;
        }

        public Builder servings(int servings) {
            if (servings < 1) throw new IllegalArgumentException("servings must be >= 1");
            this.servings = servings;
            return this;
        }

        public Recipe build() {
            return new Recipe(this);
        }
    }
	
	public Ingredient[] getIngredients() {
		Ingredient[] ingredients = new Ingredient[recipeIngredients.length];
		for (int i = 0; i < ingredients.length; i++) {
			ingredients[i] = recipeIngredients[i].getIngredient();
		}
		return ingredients;
	}

	public String getDirections() {
		return directions;
	}

	public String getRecipeName() {
		return recipeName;
	}

	public ServingSize getServingSize() {
		return servingSize;
	}
	
	public int getServings() {
		return servings;
	}

	public void setIngredients(RecipeIngredient[] recipeIngredients) {
		this.recipeIngredients = recipeIngredients;
	}

	public void setDirections(String directions) {
		this.directions = directions;
	}

	public void setRecipeName(String recipeName) {
		this.recipeName = recipeName;
	}

	public void setServingSize(ServingSize servingSize) {
		this.servingSize = servingSize;
	}
	
	public NutrientInfo getTotalMacros() {
		NutrientCalculator nutrientCalculator = new NutrientCalculator();
		return nutrientCalculator.addAllIngredientsNutrientInfo(getIngredients());
	}
	
	public double getTotalPrice() {
		double totalPrice = 0;
		for (RecipeIngredient recipeIngredient : recipeIngredients) {
			double ingredientPrice = recipeIngredient.getIngredient().getUnitPrice();
			double ingredientPriceUnitWeight = recipeIngredient.getIngredient().getUnitWeight().getUnitWeightAmount();
			Unit ingredientPriceUnit = recipeIngredient.getIngredient().getUnitWeight().getUnitWeightUnit();
			
			int unitInRecipe = recipeIngredient.getServingSize().getServingSizeAmount();
			Unit unitTypeInRecipe = recipeIngredient.getServingSize().getServingSizeUnit();
			
	        double recipeAmountInPurchaseUnit = unitTypeInRecipe.convertTo(unitInRecipe, ingredientPriceUnit);

	        double numberOfPurchaseUnits = recipeAmountInPurchaseUnit / ingredientPriceUnitWeight;

	        totalPrice += numberOfPurchaseUnits * ingredientPrice;			
			
		}
		return totalPrice;
	}
	
	public double getPricePerServing() {
		return getTotalPrice() / getServings();
	}

	public double getCostPerCalorie() {
		int calories = getNutrientsPerServing().getkCal();
		return calories == 0 ? Double.MAX_VALUE : getPricePerServing() / calories;
	}

	public double getCostPerProtein() {
		int protein = getNutrientsPerServing().getProtein();
		return protein == 0 ? Double.MAX_VALUE : getPricePerServing() / protein;
	}
	
	public NutrientInfo getNutrientsPerServing() {
		NutrientCalculator nutrientCalculator = new NutrientCalculator();
		return nutrientCalculator.divideNutrientInfo(getTotalMacros(), servings);
	}
	
	@Override
	public String toString() {
		String recipeString =  String.format( "%s:\n Name = " + getRecipeName(), getClass().getName());
		
		if (getServingSize() != null) {
			recipeString += String.format(", Price = $%.2f per %d %s serving", getPricePerServing(), getServingSize().getServingSizeAmount(), getServingSize().getServingSizeUnit());
		} else {
			recipeString += String.format(", Price = $%.2f per serving, Makes %d servings", getPricePerServing(), getServings());
		}
		
		if (getDirections() != null) {
			recipeString += "\n\nDirections:\n " + getDirections();
		}
		recipeString += "\n" + getNutrientsPerServing().toString() + "\n(Per Serving)";
		return recipeString;
	}
	
	
}
