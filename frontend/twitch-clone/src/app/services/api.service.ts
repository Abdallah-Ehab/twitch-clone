import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
    id: string;
    username: string;
    email?: string;
    avatarUrl?: string;
    isLive?: boolean;
    viewerCount?: number;
}

export interface Channel {
    id: string;
    username: string;
    avatarUrl: string;
    thumbnailUrl: string;
    bannerUrl: string;
    bio: string;
    isLive: boolean;
    viewerCount: number;
    streamUrl?: string;
    hlsUrl?: string;
    streamKey?: string;
    qualities?: string[];
    tags?: string[];
}

export interface AuthResponse {
    message: string;
    user: User;
    accessToken: string;
}

export interface ApiError {
    error: string;
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl;

    getChannels(): Observable<Channel[]> {
        return this.http.get<Channel[]>(`${this.baseUrl}/channels`);
    }

    getChannelByUsername(username: string): Observable<Channel> {
        return this.http.get<Channel>(`${this.baseUrl}/channels/${username}`);
    }

    getMyChannel(): Observable<Channel> {
        return this.http.get<Channel>(`${this.baseUrl}/channels/me`);
    }

    register(data: { username: string; email: string; password: string }): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/auth/register`, data);
    }

    login(email: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, { email, password });
    }

    logout(): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/auth/logout`, {});
    }

    followChannel(channelId: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/follows/${channelId}`, {});
    }

    unfollowChannel(channelId: string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/follows/${channelId}`);
    }
}
