public enum Unit {
    GRAM(1.0, Dimension.MASS),
    KILOGRAM(1000.0, Dimension.MASS),
    POUND(453.592, Dimension.MASS),
    OUNCE(28.3495, Dimension.MASS),
    MILLILITER(1.0, Dimension.VOLUME),
    LITER(1000.0, Dimension.VOLUME),
    TABLESPOON(14.787, Dimension.VOLUME),
    TEASPOON(4.929, Dimension.VOLUME),
    CUP(236.588, Dimension.VOLUME);

    private final double toBase; 
    private final Dimension dimension;

    Unit(double toBase, Dimension dimension) {
        this.toBase = toBase;
        this.dimension = dimension;
    }

    public double convertTo(double amount, Unit target) {
        if (this.dimension != target.dimension) {
            throw new IllegalArgumentException(
                "Cannot convert " + this + " to " + target + " without ingredient density"
            );
        }
        return amount * this.toBase / target.toBase;
    }

    public Dimension getDimension() { return dimension; }
}