import { Actions, ofType, Effect } from '@ngrx/effects';
import * as AuthActions from './store/auth.actions';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { of, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface AuthResponseData {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

@Injectable()
export class AuthEffects {
    @Effect()
    authSignup = this.actions$.pipe(
        ofType(AuthActions.SIGNUP_START),
        
    );

    @Effect()
    authLogin = this.actions$.pipe(
        ofType(AuthActions.LOGIN_START),
        switchMap((authData: AuthActions.LoginStart) => {
            return this.http.post<AuthResponseData>(
                'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,
                {
                    email: authData.payload.email,
                    password: authData.payload.password,
                    returnSecureToken: true
                }
            )
            .pipe(
              map(resData => {  
                const expirationDate = new Date(new Date().getTime() + +resData.expiresIn * 1000);    
                return new AuthActions.AthenticateSuccess({
                    email: resData.email,
                    userId: resData.localId,
                    token: resData.idToken,
                    expirationDate: expirationDate
                });
              }),
              catchError(errorRes => {
                let errorMessage = "An unknown error occured!";
                if(!errorRes.error || !errorRes.error.error) {
                    return of(new AuthActions.AthenticateFail(errorMessage));
                }
                errorMessage = errorRes.error.error.message;
                return of(new AuthActions.AthenticateFail(errorMessage));
              })
            );
        })
    );

    @Effect({dispatch: false})
    authSuccess = this.actions$.pipe(
        ofType(AuthActions.AUTHENTICATE_SUCCESS), 
        tap(() => {
            this.router.navigate(['/']);
        })
    );

    constructor(private actions$: Actions,
                private http: HttpClient,
                private router: Router) {}
}