import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { User } from './user.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

export interface AuthResponseData {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

@Injectable({providedIn: 'root'})
export class AuthService {
    private tokenExpirationTimer: any;

    constructor(private http: HttpClient,
                private router: Router,
                private store: Store<fromApp.AppState>
    ) {}

    autoLogin() {
        const userData: {
            email: string,
            id: string,
            _token: string,
            _tokenExpirationDate: string
        } = JSON.parse(localStorage.getItem('userData'));
        if (!!userData) {
            const loadedUser = new User(
                userData.email,
                userData.id,
                userData._token,
                new Date(userData._tokenExpirationDate)
            );

            if (loadedUser.token) {
                this.store.dispatch(new AuthActions.AthenticateSuccess({
                    email: loadedUser.email,
                    userId: loadedUser.id,
                    token: loadedUser.token,
                    expirationDate: new Date(userData._tokenExpirationDate)
                }));
                const expirationDuration = 
                new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
                this.autoLogout(expirationDuration);
            }
        } else return;
    }

    logout() {
        localStorage.removeItem('userData');
        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
        this.tokenExpirationTimer = null;
    }

    autoLogout(expirationDuration: number) {
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationDuration);
    }

    private handleAuthentication(
        email: string, 
        userId: string, 
        token: string, 
        expiresIn: number
    ) {
        const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);
        const user = new User(
            email, 
            userId, 
            token, 
            expirationDate
        );
        this.store.dispatch(new AuthActions.AthenticateSuccess({
            email, 
            userId, 
            token, 
            expirationDate
        }));
        this.autoLogout(expiresIn * 1000);
        localStorage.setItem('userData', JSON.stringify(user));
    }

    private handleError(errorRes: HttpErrorResponse) {
        let errorMessage = "An unknown error occured!";
        if(!errorRes.error || !errorRes.error.error) {
            return throwError(errorMessage);
        }
        errorMessage = errorRes.error.error.message;
        return throwError(errorMessage);
    }
}
