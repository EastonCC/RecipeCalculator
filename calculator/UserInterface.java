import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.Scanner;

public class UserInterface {

	public static void printQuery(String question, String... options) {
		System.out.println(question);
		int i = 1;
		for (String option : options) {
			System.out.printf("  %d. %s\n", i, option);
			i++;
		}
	}

	public static void main(String[] args) throws IOException, ClassNotFoundException {
		RecipeManager recipeManager = new RecipeManager();
		IngredientManager ingredientManager = new IngredientManager();
		Scanner userInput = new Scanner(System.in);

		while (true) {
			printQuery("\nWhat would you like to do?",
					"Find a recipe",
					"View all recipes",
					"View all ingredients",
					"Add a new recipe",
					"Add a new ingredient",
					"Update existing ingredient (Price)",
					"Quit");

			int choice = userInput.nextInt();
			userInput.nextLine();

			switch (choice) {
				case 1: {
					File f = new File("RecipeStorage.json");
					if (!f.exists()) {
						System.out.println("No recipes saved yet.");
						break;
					}
					Recipe[] recipes = recipeManager.getRecipesFromStorage();
					printQuery("How would you like to find a recipe?",
							"Search by name",
							"Best value: cost per calorie (cheapest calories)",
							"Best value: cost per protein (cheapest protein)");
					int findChoice = userInput.nextInt();
					userInput.nextLine();

					switch (findChoice) {
						case 1: {
							System.out.println("Enter recipe name to search for:");
							String search = userInput.nextLine().toLowerCase();
							boolean found = false;
							for (Recipe r : recipes) {
								if (r.getRecipeName().toLowerCase().contains(search)) {
									System.out.println("\n" + r);
									found = true;
								}
							}
							if (!found) System.out.println("No matching recipes found.");
							break;
						}
						case 2: {
							Arrays.sort(recipes, (a, b) -> Double.compare(a.getCostPerCalorie(), b.getCostPerCalorie()));
							System.out.println("\nRecipes ranked by cost per calorie (best first):");
							for (Recipe r : recipes) {
								System.out.printf("  %s — $%.4f per calorie (%d cal/serving, $%.2f/serving)\n",
										r.getRecipeName(),
										r.getCostPerCalorie(),
										r.getNutrientsPerServing().getkCal(),
										r.getPricePerServing());
							}
							break;
						}
						case 3: {
							Arrays.sort(recipes, (a, b) -> Double.compare(a.getCostPerProtein(), b.getCostPerProtein()));
							System.out.println("\nRecipes ranked by cost per gram of protein (best first):");
							for (Recipe r : recipes) {
								if (r.getCostPerProtein() == Double.MAX_VALUE) {
									System.out.printf("  %s — no protein data\n", r.getRecipeName());
								} else {
									System.out.printf("  %s — $%.4f per g protein (%dg protein/serving, $%.2f/serving)\n",
											r.getRecipeName(),
											r.getCostPerProtein(),
											r.getNutrientsPerServing().getProtein(),
											r.getPricePerServing());
								}
							}
							break;
						}
						default:
							System.out.println("Invalid option.");
					}
					break;
				}
				case 2: {
					File f = new File("RecipeStorage.json");
					if (!f.exists()) {
						System.out.println("No recipes saved yet.");
						break;
					}
					Recipe[] recipes = recipeManager.getRecipesFromStorage();
					System.out.println("\n------------------Recipes------------------");
					int i = 1;
					for (Recipe r : recipes) {
						System.out.println("------------Recipe " + i + "------------");
						System.out.println(r);
						System.out.println("----------------------------------------\n");
						i++;
					}
					break;
				}
				case 3: {
					File f = new File("IngredientStorage.json");
					if (!f.exists()) {
						System.out.println("No ingredients saved yet.");
						break;
					}
					ingredientManager.printAllIngredients();
					break;
				}
				case 4: {
					File f = new File("IngredientStorage.json");
					if (!f.exists()) {
						System.out.println("No ingredients saved yet. Add ingredients first.");
						break;
					}
					Ingredient[] available = ingredientManager.getIngredientsFromStorage();

					System.out.println("Enter recipe name:");
					String recipeName = userInput.nextLine();

					System.out.println("How many ingredients does this recipe have?");
					int numIngredients = userInput.nextInt();
					userInput.nextLine();

					RecipeIngredient[] recipeIngredients = new RecipeIngredient[numIngredients];
					for (int i = 0; i < numIngredients; i++) {
						System.out.println("\nAvailable ingredients:");
						for (int j = 0; j < available.length; j++) {
							System.out.printf("  %d. %s\n", j + 1, available[j].getIngredientName());
						}
						System.out.println("Select ingredient number:");
						int ingChoice = userInput.nextInt() - 1;
						userInput.nextLine();

						System.out.println("Enter amount (as a weight, no unit):");
						int amount = userInput.nextInt();
						userInput.nextLine();

						Unit[] units = Unit.values();
						System.out.println("Select unit:");
						for (int j = 0; j < units.length; j++) {
							System.out.printf("  %d. %s\n", j + 1, units[j]);
						}
						int unitChoice = userInput.nextInt() - 1;
						userInput.nextLine();

						recipeIngredients[i] = new RecipeIngredient(available[ingChoice], new ServingSize(amount, units[unitChoice]));
					}

					System.out.println("Enter directions (or press Enter to skip):");
					String directions = userInput.nextLine();

					System.out.println("Enter number of servings:");
					int servings = userInput.nextInt();
					userInput.nextLine();

					Recipe.Builder builder = new Recipe.Builder(recipeIngredients, recipeName).servings(servings);
					if (!directions.isEmpty()) builder.directions(directions);
					Recipe newRecipe = builder.build();

					recipeManager.updateRecipeStorage(new Recipe[]{newRecipe});
					System.out.println("Recipe \"" + recipeName + "\" saved!");
					break;
				}
				case 5: {
					System.out.println("Enter ingredient name:");
					String name = userInput.nextLine();

					System.out.println("Enter unit price ($):");
					double price = userInput.nextDouble();
					userInput.nextLine();

					System.out.println("Enter unit weight amount:");
					int weightAmount = userInput.nextInt();
					userInput.nextLine();

					Unit[] units = Unit.values();
					System.out.println("Select unit:");
					for (int i = 0; i < units.length; i++) {
						System.out.printf("  %d. %s\n", i + 1, units[i]);
					}
					int unitChoice = userInput.nextInt() - 1;
					userInput.nextLine();

					UnitWeight unitWeight = new UnitWeight(weightAmount, units[unitChoice]);

					System.out.println("Add nutrient info? (y/n):");
					NutrientInfo nutrientInfo = null;
					if (userInput.nextLine().equalsIgnoreCase("y")) {
						System.out.println("Calories:");
						int kCal = userInput.nextInt();
						System.out.println("Carbohydrates (g):");
						int carbs = userInput.nextInt();
						System.out.println("Protein (g):");
						int protein = userInput.nextInt();
						System.out.println("Sodium (mg):");
						int sodium = userInput.nextInt();
						System.out.println("Cholesterol (mg):");
						int cholesterol = userInput.nextInt();
						System.out.println("Fiber (g):");
						int fiber = userInput.nextInt();
						userInput.nextLine();
						nutrientInfo = new NutrientInfo.Builder()
								.kCal(kCal).carbohydrates(carbs).protein(protein)
								.sodium(sodium).cholesterol(cholesterol).fiber(fiber)
								.build();
					}

					Ingredient newIngredient = new Ingredient(price, name, unitWeight, nutrientInfo);
					ingredientManager.updateIngredientStorage(new Ingredient[]{newIngredient});
					System.out.println("Ingredient \"" + name + "\" saved!");
					break;
				}
				case 6: {
					File f = new File("IngredientStorage.json");
					if (!f.exists()) {
						System.out.println("No ingredients saved yet.");
						break;
					}
					Ingredient[] ingredients = ingredientManager.getIngredientsFromStorage();
					System.out.println("Select ingredient to update:");
					for (int i = 0; i < ingredients.length; i++) {
						String lastUpdated = new java.text.SimpleDateFormat("MMM d, yyyy, hh:mm a").format(ingredients[i].getPriceLastUpdated());
						System.out.printf("  %d. %s (currently $%.2f per %d %s, last updated: %s)\n",
								i + 1,
								ingredients[i].getIngredientName(),
								ingredients[i].getUnitPrice(),
								ingredients[i].getUnitWeight().getUnitWeightAmount(),
								ingredients[i].getUnitWeight().getUnitWeightUnit(),
								lastUpdated);
					}
					int ingChoice = userInput.nextInt() - 1;
					userInput.nextLine();

					System.out.println("Enter new price ($):");
					double newPrice = userInput.nextDouble();
					userInput.nextLine();

					ingredients[ingChoice].setUnitPrice(newPrice);
					ingredientManager.updateIngredientStorage(new Ingredient[]{ingredients[ingChoice]});
					System.out.println("Price updated!");
					break;
				}
				case 7: {
					System.out.println("Goodbye!");
					userInput.close();
					return;
				}
				default:
					System.out.println("Invalid option, please try again.");
			}
		}
	}

}
