import java.io.Serializable;

public class UnitWeight implements Serializable{
	private static final long serialVersionUID = 3287573318289319299L;
	private int unitWeightAmount;
	private Unit unitWeightUnit;
	
	public UnitWeight(int unitWeightAmount, Unit unitWeightUnit) {
		this.unitWeightAmount = unitWeightAmount;
		this.unitWeightUnit = unitWeightUnit;
	}

	public int getUnitWeightAmount() {
		return unitWeightAmount;
	}

	public Unit getUnitWeightUnit() {
		return unitWeightUnit;
	}

	
	
}
