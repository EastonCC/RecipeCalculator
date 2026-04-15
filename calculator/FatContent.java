import java.io.Serializable;

public class FatContent implements Serializable {
	private static final long serialVersionUID = -8692021961658143030L;
	private final int unsaturated;
	private final int saturated;
	private final int trans;

	public FatContent(Builder builder) {
		this.unsaturated = builder.unsaturated;
		this.saturated = builder.saturated;
		this.trans = builder.trans;
	}

	public static class Builder {
		private int unsaturated;
		private int saturated;
		private int trans;

		public Builder unsaturated(int unsaturated) {
			this.unsaturated = unsaturated;
			return this;
		}

		public Builder saturated(int saturated) {
			this.saturated = saturated;
			return this;
		}

		public Builder trans(int trans) {
			this.trans = trans;
			return this;
		}

		public FatContent build() {
			return new FatContent(this);
		}

	}

	public int getUnsaturated() {
		return unsaturated;
	}

	public int getSaturated() {
		return saturated;
	}

	public int getTrans() {
		return trans;
	}
	
	public int getTotalFat() {
		return getUnsaturated() + getSaturated() + getTrans();
	}

}
