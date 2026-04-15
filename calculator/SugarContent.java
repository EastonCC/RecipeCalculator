import java.io.Serializable;

public class SugarContent implements Serializable {
	private static final long serialVersionUID = 2609535970445310659L;
	private int totalSugar;
	private int addedSugar;
	
	public SugarContent(int totalSugar, int addedSugar) {
		this.totalSugar = totalSugar;
		this.addedSugar = addedSugar;
	}
	
	public SugarContent(int totalSugar) {
		this(totalSugar, 0);
	}

	public int getTotalSugar() {
		return totalSugar;
	}

	public int getAddedSugar() {
		return addedSugar;
	}	
	
}
