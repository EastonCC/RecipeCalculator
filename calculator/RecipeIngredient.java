import java.io.Serializable;

public class RecipeIngredient implements Serializable{
	private static final long serialVersionUID = 8866131111078299906L;
		Ingredient ingredient;
		ServingSize servingSize;
		
		public RecipeIngredient(Ingredient ingredient, ServingSize servingSize) {
			this.ingredient = ingredient;
			this.servingSize = servingSize;
		}

		public Ingredient getIngredient() {
			return ingredient;
		}

		public ServingSize getServingSize() {
			return servingSize;
		}

		public void setIngredient(Ingredient ingredient) {
			this.ingredient = ingredient;
		}

		public void setServingSize(ServingSize servingSize) {
			this.servingSize = servingSize;
		}
		
}