import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

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




@Injectable({
  providedIn: 'root',
})
export class AuthService {
    httpClient = inject(HttpClient);

    register(userData: IRegisterUserData) {
        return this.httpClient.post('/api/auth/register', userData);
    }

    login(credentials: ILoginCredentials) {
        return this.httpClient.post('/api/auth/login', credentials);
    }

    checkUsernameExists(username: string){
        return this.httpClient.get<IResUsernameCheck>(`/api/auth/check-username/${username}`);
    }
    refreshToken() {
        return this.httpClient.post('/api/auth/refresh', {});
    }
}
