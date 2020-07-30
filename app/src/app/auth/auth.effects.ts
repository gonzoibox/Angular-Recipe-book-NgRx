import { Actions, ofType, Effect } from '@ngrx/effects';
import * as AuthActions from './store/auth.actions';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { of } from 'rxjs';
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

const handleAuthentication = (
    expiresIn: number,
    email: string,
    userId: string,
    token: string
) => {
    const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);    
    return new AuthActions.AthenticateSuccess({
        email: email,
        userId: userId,
        token: token,
        expirationDate: expirationDate
    });
};

const handleError = (errorRes: any) => {
    let errorMessage = "An unknown error occured!";
        if(!errorRes.error || !errorRes.error.error) {
            return of(new AuthActions.AthenticateFail(errorMessage));
        }
        errorMessage = errorRes.error.error.message;
        return of(new AuthActions.AthenticateFail(errorMessage));
};

@Injectable()
export class AuthEffects {
    @Effect()
    authSignup = this.actions$.pipe(
        ofType(AuthActions.SIGNUP_START),
        switchMap((signupAction: AuthActions.SignupStart) => {
            return this.http.post<AuthResponseData>(
                'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey,
                {
                    email: signupAction.payload.email,
                    password: signupAction.payload.password,
                    returnSecureToken: true
                }
            )
            .pipe(
                map(resData => {  
                    return handleAuthentication(
                        +resData.expiresIn,
                        resData.email,
                        resData.localId,
                        resData.idToken
                    );
                }),
                catchError(errorRes => {
                 return (handleError(errorRes));
                })
              );
        })
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
                return handleAuthentication(
                    +resData.expiresIn,
                    resData.email,
                    resData.localId,
                    resData.idToken
                );
              }),
              catchError(errorRes => {
                return (handleError(errorRes));
              })
            );
        })
    );

    @Effect({dispatch: false})
    authREdirect = this.actions$.pipe(
        ofType(AuthActions.AUTHENTICATE_SUCCESS), 
        tap(() => {
            this.router.navigate(['/']);
        })
    );

    @Effect({dispatch: false})
    authLogout = this.actions$.pipe(
        ofType(AuthActions.LOGOUT), 
        tap(() => {
            this.router.navigate(['/auth']);
        })
    );

    constructor(private actions$: Actions,
                private http: HttpClient,
                private router: Router) {}
}