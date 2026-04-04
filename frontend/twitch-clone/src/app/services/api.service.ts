import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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

    updateChannel(channelId: string, data: { bio?: string; avatarUrl?: string; bannerUrl?: string }): Observable<Channel> {
        return this.http.put<Channel>(`${this.baseUrl}/channels/${channelId}`, data);
    }

    followChannel(channelId: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.baseUrl}/follows/${channelId}`, {});
    }

    unfollowChannel(channelId: string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/follows/${channelId}`);
    }
}
