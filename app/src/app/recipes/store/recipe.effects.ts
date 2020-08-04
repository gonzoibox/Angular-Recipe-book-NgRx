import { Actions, Effect, ofType } from '@ngrx/effects';
import * as RecipeActions from './recipe.actions';
import { switchMap, map, withLatestFrom } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Recipe } from '../recipe.model';
import { Injectable } from '@angular/core';
import * as fromApp from '../../store/app.reducer';
import { Store } from '@ngrx/store';

@Injectable()
export class RecipeEffects {
    @Effect()
    fetchRecipes = this.actions$.pipe(
        ofType(RecipeActions.FETCH_RECIPES),
        switchMap(() => {
            return this.http.get<Recipe[]>(
                'https://angular-recipe-book-464a2.firebaseio.com/recipes.json'
            )
        }),
        map(recipes => {
            return recipes.map(recipe => {
                return {
                    ...recipe, 
                    ingredients: recipe.ingredients ? recipe.ingredients : []
                };
            });
        }),
        map(recipes => {
            return new RecipeActions.SetRecipes(recipes);
        })
    );

    @Effect({dispatch: false})
    storeRecipes = this.actions$.pipe(ofType(RecipeActions.STORE_RECIPES),
        withLatestFrom(this.store.select('recipes')),
        switchMap(([actionData, recipesState]) => {
            return this.http.put(
                'https://angular-recipe-book-464a2.firebaseio.com/recipes.json',
                recipesState.recipes)
        })
    );

    constructor(
        private actions$: Actions,
        private http: HttpClient,
        private store: Store<fromApp.AppState>
    ) {}
}