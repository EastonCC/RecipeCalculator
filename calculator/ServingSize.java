import java.io.Serializable;

public class ServingSize implements Serializable {
	private static final long serialVersionUID = 2648717690706854629L;
	private int servingSizeAmount;
	private Unit servingSizeUnit;
	
	public ServingSize(int servingSizeAmount, Unit servingSizeUnit) {
		this.servingSizeAmount = servingSizeAmount;
		this.servingSizeUnit = servingSizeUnit;
	}

	public int getServingSizeAmount() {
		return servingSizeAmount;
	}

	public Unit getServingSizeUnit() {
		return servingSizeUnit;
	}

	
	
}
