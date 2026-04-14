import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
    category?: string;
}

export interface PaginatedChannels {
    channels: Channel[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
}

export interface ChannelFilters {
    page?: number;
    limit?: number;
    liveOnly?: boolean;
    search?: string;
    category?: string;
    sortBy?: 'viewers' | 'recent' | 'alphabetical';
}

@Injectable({
    providedIn: 'root'
})
export class ChannelService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl;

    getChannels(filters: ChannelFilters = {}): Observable<PaginatedChannels> {
        let params = new HttpParams();
        if (filters.page) params = params.set('page', filters.page.toString());
        if (filters.limit) params = params.set('limit', filters.limit.toString());
        if (filters.liveOnly !== undefined) params = params.set('liveOnly', filters.liveOnly.toString());
        if (filters.search) params = params.set('search', filters.search);
        if (filters.category) params = params.set('category', filters.category);
        if (filters.sortBy) params = params.set('sortBy', filters.sortBy);

        return this.http.get<PaginatedChannels>(`${this.baseUrl}/channels`, { params });
    }

    getAllChannels(): Observable<PaginatedChannels> {
        return this.getChannels({ page: 1, limit: 100 });
    }

    getCategories(): Observable<string[]> {
        return this.http.get<string[]>(`${this.baseUrl}/channels/categories`);
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

    searchChannels(query: string): Observable<Channel[]> {
        return this.http.get<Channel[]>(`${this.baseUrl}/channels?search=${encodeURIComponent(query)}&limit=5&liveOnly=false`);
    }
}
