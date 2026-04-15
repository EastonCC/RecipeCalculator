import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class RecipeManager {
	private static final Gson gson = new GsonBuilder()
			.setDateFormat("MMM d, yyyy, hh:mm a")
			.setPrettyPrinting()
			.create();
	private static final String STORAGE_FILE = "RecipeStorage.json";

	private ArrayList<Recipe> recipes;

	public RecipeManager() {
		this.recipes = new ArrayList<>();
	}

	public RecipeManager(ArrayList<Recipe> recipes) {
		this.recipes = recipes;
	}

	public void addRecipe(Recipe recipe) {
		recipes.add(recipe);
	}

	public void removeRecipe(Recipe recipe) {
		recipes.remove(recipe);
	}

	public void removeRecipe(String name) {
		for (Recipe recipe : recipes) {
			if (recipe.getRecipeName().equals(name)) {
				recipes.remove(recipe);
				break;
			}
		}
	}

	public ArrayList<Recipe> getRecipes() {
		return recipes;
	}

	public Recipe[] getRecipesFromStorage() throws IOException {
		try (FileReader reader = new FileReader(STORAGE_FILE)) {
			return gson.fromJson(reader, Recipe[].class);
		}
	}

	public void updateRecipeStorage(Recipe[] newRecipes) throws IOException {
		File f = new File(STORAGE_FILE);
		Recipe[] existing = f.exists() ? getRecipesFromStorage() : new Recipe[0];

		LinkedHashMap<String, Recipe> map = new LinkedHashMap<>();
		for (Recipe r : existing) map.put(r.getRecipeName(), r);
		for (Recipe r : newRecipes) map.put(r.getRecipeName(), r);

		try (FileWriter writer = new FileWriter(f)) {
			gson.toJson(map.values().toArray(new Recipe[0]), writer);
		}
	}
}
