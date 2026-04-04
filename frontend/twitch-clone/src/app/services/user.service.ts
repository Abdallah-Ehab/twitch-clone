import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CurrentUser {
    id: string;
    username: string;
    email?: string;
}

const USER_STORAGE_KEY = 'streamhub_current_user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl;

    currentUser = signal<CurrentUser | null>(this.loadUserFromStorage());
    isLoggedIn = computed(() => this.currentUser() !== null);

    private loadUserFromStorage(): CurrentUser | null {
        try {
            const stored = localStorage.getItem(USER_STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    }

    fetchCurrentUser(): Observable<CurrentUser | null> {
        return this.http.get<CurrentUser>(`${this.baseUrl}/auth/me`).pipe(
            tap(user => this.setCurrentUser(user)),
            catchError((err) => {
                if (err.status === 401 || err.status === 403) {
                    this.clearCurrentUser();
                }
                return of(null);
            })
        );
    }

    setCurrentUser(user: CurrentUser | null) {
        this.currentUser.set(user);
        if (user) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(USER_STORAGE_KEY);
        }
    }

    clearCurrentUser() {
        this.currentUser.set(null);
        localStorage.removeItem(USER_STORAGE_KEY);
    }
}
