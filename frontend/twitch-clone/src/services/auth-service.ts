import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';

export interface IRegisterUserData{
    username: string;
    email: string;
    password: string;
    terms: boolean;
}

export type ILoginCredentials = Omit<IRegisterUserData, 'username' | 'terms'>;


export interface IResUsernameCheck{
    exists: boolean;
}

export interface IResisLoggedIn{
    loggedIn: boolean;
}

const TOKEN_STORAGE_KEY = 'streamhub_access_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
    httpClient = inject(HttpClient);
    private baseUrl = environment.apiUrl;
    private accessToken: string | null = localStorage.getItem(TOKEN_STORAGE_KEY);

    setAccessToken(token: string) {
        this.accessToken = token;
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }

    getAccessToken(): string | null {
        return this.accessToken;
    }

    clearAccessToken() {
        this.accessToken = null;
        localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    register(userData: IRegisterUserData) {
        return this.httpClient.post(`${this.baseUrl}/auth/register`, userData);
    }

    login(credentials: ILoginCredentials) {
        return this.httpClient.post(`${this.baseUrl}/auth/login`, credentials);
    }

    checkUsernameExists(username: string){
        return this.httpClient.get<IResUsernameCheck>(`${this.baseUrl}/auth/check-username/${username}`);
    }
    refreshToken() {
        return this.httpClient.post(`${this.baseUrl}/auth/refresh`, {});
    }
    isLoggedIn(){
      return this.httpClient.get<IResisLoggedIn>(`${this.baseUrl}/auth/is-logged-in`);
    }

    logout() {
        return this.httpClient.post(`${this.baseUrl}/auth/logout`, {});
    }

}
