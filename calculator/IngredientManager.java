import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class IngredientManager {
	private static final Gson gson = new GsonBuilder()
			.setDateFormat("MMM d, yyyy, hh:mm a")
			.setPrettyPrinting()
			.create();
	private static final String STORAGE_FILE = "IngredientStorage.json";

	private ArrayList<Ingredient> ingredients;

	public IngredientManager() {
		this.ingredients = new ArrayList<>();
	}

	public IngredientManager(ArrayList<Ingredient> ingredients) {
		this.ingredients = ingredients;
	}

	public void addIngredient(Ingredient ingredient) {
		ingredients.add(ingredient);
	}

	public void removeIngredient(Ingredient ingredient) {
		ingredients.remove(ingredient);
	}

	public void removeIngredient(String name) {
		for (Ingredient ingredient : ingredients) {
			if (ingredient.getIngredientName().equals(name)) {
				ingredients.remove(ingredient);
				break;
			}
		}
	}

	public ArrayList<Ingredient> getIngredients() {
		return ingredients;
	}

	public void updateIngredientStorage(Ingredient[] newIngredients) throws IOException {
		File f = new File(STORAGE_FILE);
		Ingredient[] existing = f.exists() ? getIngredientsFromStorage() : new Ingredient[0];

		LinkedHashMap<String, Ingredient> map = new LinkedHashMap<>();
		for (Ingredient i : existing) map.put(i.getIngredientName(), i);
		for (Ingredient i : newIngredients) map.put(i.getIngredientName(), i);

		try (FileWriter writer = new FileWriter(f)) {
			gson.toJson(map.values().toArray(new Ingredient[0]), writer);
		}
	}

	public Ingredient[] getIngredientsFromStorage() throws IOException {
		try (FileReader reader = new FileReader(STORAGE_FILE)) {
			return gson.fromJson(reader, Ingredient[].class);
		}
	}

	public void printAllIngredients() throws IOException {
		System.out.println("------------------Ingredients------------------\n");
		int i = 1;
		for (Ingredient ingredient : getIngredientsFromStorage()) {
			System.out.println("------------Ingredient " + i + "------------");
			System.out.println(ingredient);
			System.out.println("------------------------------------\n");
			i++;
		}
		System.out.println("-----------------------------------------------\n");
	}
}
