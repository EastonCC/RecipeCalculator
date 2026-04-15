
public class NutrientCalculator {
	

	public NutrientInfo addNutrient(NutrientInfo nutrientInfo1, NutrientInfo nutrientInfo2) {
		int kCal = nutrientInfo1.getkCal() + nutrientInfo2.getkCal();
		int carbohydrates = nutrientInfo1.getCarbohydrates() + nutrientInfo2.getCarbohydrates();
		int protein = nutrientInfo1.getProtein() + nutrientInfo2.getProtein();
		int sodium = nutrientInfo1.getSodium() + nutrientInfo2.getSodium();
		int cholesterol = nutrientInfo1.getCholesterol() + nutrientInfo2.getCholesterol();
		int fiber = nutrientInfo1.getFiber() + nutrientInfo2.getFiber();
		FatContent newFatContent = nutrientInfo1.getFat();
		SugarContent newSugarContent = nutrientInfo1.getSugar();
		
		FatContent fat1 = nutrientInfo1.getFat();
		SugarContent sugar1 = nutrientInfo1.getSugar();
		
		FatContent fat2 = nutrientInfo2.getFat();
		SugarContent sugar2 = nutrientInfo2.getSugar();
		
		if (fat1 != null && fat2 != null) {
			int transFat = fat1.getTrans() + fat2.getTrans();
			int satFat = fat1.getSaturated() + fat2.getSaturated();
			int unsatFat = fat1.getUnsaturated() + fat2.getUnsaturated();
			newFatContent = new FatContent.Builder().trans(transFat).saturated(satFat).unsaturated(unsatFat).build();
		} else if (fat1 != null) {
			newFatContent = fat1;
		} else if (fat2 != null) {
			newFatContent = fat2;
		}

		if (sugar1 != null && sugar2 != null) {
			int addedSugar = sugar1.getAddedSugar() + sugar2.getAddedSugar();
			int totalSugar = sugar1.getTotalSugar() + sugar2.getTotalSugar();
			newSugarContent = new SugarContent(totalSugar, addedSugar);
		} else if (sugar1 != null) {
			newSugarContent = sugar1;
		} else if (sugar2 != null) {
			newSugarContent = sugar2;
		}
		
		return new NutrientInfo.Builder().kCal(kCal).carbohydrates(carbohydrates).protein(protein).sodium(sodium).cholesterol(cholesterol).fiber(fiber).fat(newFatContent).sugar(newSugarContent).build();
		
	}

	public NutrientInfo divideNutrientInfo(NutrientInfo nutrientInfo, int factor) {
		int kCal = nutrientInfo.getkCal() / factor;
		int carbohydrates = nutrientInfo.getCarbohydrates() / factor;
		int protein = nutrientInfo.getProtein() / factor;
		int sodium = nutrientInfo.getSodium() / factor;
		int cholesterol = nutrientInfo.getCholesterol() / factor;
		int fiber = nutrientInfo.getFiber() / factor;
		FatContent fatContent = nutrientInfo.getFat();
		SugarContent sugarContent = nutrientInfo.getSugar();
		
		
		if (fatContent != null) {
			int transFat = fatContent.getTrans() / factor;
			int satFat = fatContent.getSaturated() / factor;
			int unsatFat = fatContent.getUnsaturated() / factor;
			fatContent = new FatContent.Builder().trans(transFat).saturated(satFat).unsaturated(unsatFat).build();
		}
		
		if (sugarContent != null) {		
			int addedSugar = sugarContent.getAddedSugar() / factor;
			int totalSugar = sugarContent.getTotalSugar() / factor;
			sugarContent = new SugarContent(totalSugar, addedSugar);
		}
		
		return new NutrientInfo.Builder().kCal(kCal).carbohydrates(carbohydrates).protein(protein).sodium(sodium).cholesterol(cholesterol).fiber(fiber).fat(fatContent).sugar(sugarContent).build();
		
	}
	
	public NutrientInfo addAllIngredientsNutrientInfo(Ingredient[] ingredients) {
		NutrientInfo totalNutrients = ingredients[0].getNutrients();
		for (int i = 1; i < ingredients.length; i++) {
			totalNutrients = addNutrient(totalNutrients, ingredients[i].getNutrients());
		}
		return totalNutrients;
	}
}
