import { Recipe } from './recipe.model';
import { Injectable } from '@angular/core';
import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from '../shopping-list/shopping-list.service';
import { Subject } from 'rxjs';

@Injectable()
export class RecipeService {
    recipesChanged = new Subject<Recipe[]>();

    constructor(private shoppingListService: ShoppingListService) {};

    // private recipes: Recipe[] = [
    //     new Recipe(
    //         'Schnitzel',
    //         'A super tasty Schnitzel',
    //         'https://cdn.pixabay.com/photo/2016/06/15/19/09/food-1459693_1280.jpg',
    //         [new Ingredient('Meat', 1), new Ingredient('French Fries', 10)]),
    //     new Recipe(
    //         'Burger',
    //         'An awesome Burger King',
    //         'https://cdn.pixabay.com/photo/2015/04/20/13/25/burger-731298_1280.jpg',
    //         [new Ingredient('Meat', 1), new Ingredient('Buns', 1)])
    //   ];

    private recipes: Recipe[] = [];
    
    setRecipes(recipes: Recipe[]) {
        this.recipes = recipes;
        this.recipesChangedEvent();
    }
    
    getRecipes() {
        return this.recipes.slice();
    }

    getRecipe(id: number) {
        return this.recipes[id];
    }

    addIngredientsToShoppingList(ingredients: Ingredient[]) {
        this.shoppingListService.addIngredients(ingredients);
    }

    recipesChangedEvent() {
        this.recipesChanged.next(this.recipes.slice());
    }

    addRecipe(recipe: Recipe) {
        this.recipes.push(recipe);
        this.recipesChangedEvent();
    }

    updateRecipe(index: number, newRecipe: Recipe) {
        this.recipes[index] = newRecipe;
        this.recipesChangedEvent();
    }

    deleteRecipe(index: number) {
        this.recipes.splice(index, 1);
        this.recipesChangedEvent();
    }
}