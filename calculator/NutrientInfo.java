import java.io.Serializable;

public class NutrientInfo implements Serializable {
	private static final long serialVersionUID = -7592977354381799022L;
	private final int kCal;
	private final int carbohydrates; // g
	private final int protein; // g
	private final FatContent fat; // g (trans, sat, unsat)
	private final SugarContent sugar; // g (added, natural)
	private final int sodium; // mg
	private final int cholesterol; // mg
	private final int fiber; // g

	public NutrientInfo(Builder builder) {
		this.kCal = builder.kCal;
		this.carbohydrates = builder.carbohydrates;
		this.protein = builder.protein;
		this.fat = builder.fat;
		this.sugar = builder.sugar;
		this.sodium = builder.sodium;
		this.cholesterol = builder.cholesterol;
		this.fiber = builder.fiber;
	}

	public static class Builder {
		private int kCal;
		private int carbohydrates; // g
		private int protein; // g
		private FatContent fat; // g (trans, sat, unsat)
		private SugarContent sugar; // g (added, natural)
		private int sodium; // mg
		private int cholesterol; // mg
		private int fiber; // g

		public Builder kCal(int kCal) {
			this.kCal = kCal;
			return this;
		}

		public Builder carbohydrates(int carbohydrates) {
			this.carbohydrates = carbohydrates;
			return this;
		}

		public Builder protein(int protein) {
			this.protein = protein;
			return this;
		}

		public Builder fat(FatContent fat) {
			this.fat = fat;
			return this;
		}

		public Builder sugar(SugarContent sugar) {
			this.sugar = sugar;
			return this;
		}

		public Builder sodium(int sodium) {
			this.sodium = sodium;
			return this;
		}

		public Builder cholesterol(int cholesterol) {
			this.cholesterol = cholesterol;
			return this;
		}

		public Builder fiber(int fiber) {
			this.fiber = fiber;
			return this;
		}

		public NutrientInfo build() {
			return new NutrientInfo(this);
		}

	}

	public int getkCal() {
		return kCal;
	}

	public int getCarbohydrates() {
		return carbohydrates;
	}

	public int getProtein() {
		return protein;
	}

	public FatContent getFat() {
		return fat;
	}

	public SugarContent getSugar() {
		return sugar;
	}

	public int getSodium() {
		return sodium;
	}

	public int getCholesterol() {
		return cholesterol;
	}

	public int getFiber() {
		return fiber;
	}

	@Override
	public String toString() {
		String nutrientInfoString = "\nNutrients:\n" + " Calories = " + getkCal() + "\n";
				
		if (getFat() != null) {
			nutrientInfoString += " Total Fat = " + getFat().getTotalFat() + "g\n"
					+ " - Saturated Fat = " + getFat().getSaturated() + "g\n"
					+ " - Unsaturated Fat = " + getFat().getUnsaturated() + "g\n"
					+ " - Trans Fat = " + getFat().getTrans() + "g\n";
		}
		
		nutrientInfoString += " Cholesterol = " + getCholesterol() + "mg\n"
				+ " Sodium = " + getSodium() + "mg\n"
				+ " Total Carbohydrates = " + getCarbohydrates() + "g\n"
				+ " - Fiber = " + getFiber() + "g\n";
		
		if (getSugar() != null) {
			nutrientInfoString += String.format(" - Total Sugars = " + getSugar().getTotalSugar() + "g\n" + "  - Includes %dg Added Sugars \n", getSugar().getAddedSugar());
		}

		nutrientInfoString += " Protein = " + getProtein() + "g";

		
		return nutrientInfoString;
	}
	
}
