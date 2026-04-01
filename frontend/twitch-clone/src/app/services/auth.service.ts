import { Injectable, signal, computed } from '@angular/core';
import { ApiService, User } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _currentUser = signal<User | null>(this.getStoredUser());
    private _accessToken = signal<string | null>(localStorage.getItem('accessToken'));

    readonly currentUser = this._currentUser.asReadonly();
    readonly accessToken = this._accessToken.asReadonly();
    readonly isLoggedIn = computed(() => !!this._currentUser());

    constructor(private api: ApiService) {}

    private getStoredUser(): User | null {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    }

    setAuth(user: User, token: string) {
        this._currentUser.set(user);
        this._accessToken.set(token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', token);
    }

    logout() {
        this.api.logout().subscribe({
            next: () => this.clearAuth(),
            error: () => this.clearAuth()
        });
    }

    private clearAuth() {
        this._currentUser.set(null);
        this._accessToken.set(null);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
    }
}
