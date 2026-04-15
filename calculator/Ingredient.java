import java.net.URI;
import java.text.SimpleDateFormat;
import java.util.Date;

public class Ingredient implements java.io.Serializable {
	private static final long serialVersionUID = 2961295599189301455L;
	private double unitPrice;
	private URI ingredientLink;
	private String ingredientName;
	private UnitWeight unitWeight;
	private Date priceLastUpdated;
	private NutrientInfo nutrients;

	public Ingredient(double unitPrice, URI ingredientLink, String ingredientName, UnitWeight unitWeight,
			NutrientInfo nutrients) {
		this.unitPrice = unitPrice;
		this.ingredientLink = ingredientLink;
		this.ingredientName = ingredientName;
		this.unitWeight = unitWeight;
		this.nutrients = nutrients;
		this.priceLastUpdated = new Date();

	}

	public Ingredient(double unitPrice, URI ingredientLink, String ingredientName, UnitWeight unitWeight) {
		this(unitPrice, ingredientLink, ingredientName, unitWeight, null);
	}

	public Ingredient(double unitPrice, String ingredientName, UnitWeight unitWeight, NutrientInfo nutrients) {
		this(unitPrice, null, ingredientName, unitWeight, nutrients);
	}

	public Ingredient(double unitPrice, String ingredientName, UnitWeight unitWeight) {
		this(unitPrice, null, ingredientName, unitWeight, null);
	}

	public double getUnitPrice() {
		return unitPrice;
	}

	public URI getIngredientLink() {
		return ingredientLink;
	}

	public String getIngredientName() {
		return ingredientName;
	}

	public UnitWeight getUnitWeight() {
		return unitWeight;
	}

	public Date getPriceLastUpdated() {
		return priceLastUpdated;
	}

	public NutrientInfo getNutrients() {
		return nutrients;
	}

	public void setUnitPrice(double unitPrice) {
		this.unitPrice = unitPrice;
		this.priceLastUpdated = new Date();
	}

	public void setIngredientLink(URI ingredientLink) {
		this.ingredientLink = ingredientLink;
	}

	public void setIngredientName(String ingredientName) {
		this.ingredientName = ingredientName;
	}

	public void setUnitWeight(UnitWeight unitWeight) {
		this.unitWeight = unitWeight;
	}


	public void setNutrients(NutrientInfo nutrients) {
		this.nutrients = nutrients;
	}

	@Override
	public String toString() {
		String lastUpdated = new SimpleDateFormat("MMM d, yyyy, hh:mm a").format(getPriceLastUpdated());
		String ingredientString = String.format( "%s:\n Name = " + getIngredientName()
				+ ", Price = $%.2f per %d %s",getClass().getName(), getUnitPrice(), getUnitWeight().getUnitWeightAmount(), getUnitWeight().getUnitWeightUnit()
				+ " (last updated: " + lastUpdated + ")" + "\n" + getNutrients().toString());
		return ingredientString;
	}
	
}
