import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/nav/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FormsModule,
    HeaderComponent,
  ],
  template: `
    <div class="min-h-screen bg-background">
      <app-header />
      
      <main class="container mx-auto px-4 py-6">
        <!-- Dashboard Header -->
        <div class="mb-8">
          <h1 class="text-2xl font-bold text-foreground">Creator Dashboard</h1>
          <p class="text-muted-foreground">Manage your stream and channel settings</p>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-card border border-border rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-muted-foreground">Followers</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p class="text-2xl font-bold text-foreground">1.2M</p>
            <p class="text-xs text-green-500 mt-1">+2.5% this week</p>
          </div>

          <div class="bg-card border border-border rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-muted-foreground">Avg. Viewers</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <p class="text-2xl font-bold text-foreground">12.5K</p>
            <p class="text-xs text-green-500 mt-1">+15% from last week</p>
          </div>

          <div class="bg-card border border-border rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-muted-foreground">Peak Viewers</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p class="text-2xl font-bold text-foreground">45.2K</p>
            <p class="text-xs text-muted-foreground mt-1">All time high</p>
          </div>

          <div class="bg-card border border-border rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-muted-foreground">Total Hours</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-2xl font-bold text-foreground">2,340</p>
            <p class="text-xs text-muted-foreground mt-1">This year</p>
          </div>
        </div>

        <!-- Stream Manager -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Stream Preview & Controls -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Preview -->
            <div class="bg-card border border-border rounded-lg p-4">
              <h3 class="font-semibold mb-4">Stream Preview</h3>
              <div class="aspect-video bg-black rounded-lg flex items-center justify-center">
                <div class="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-muted-foreground mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p class="text-muted-foreground text-sm">Camera Preview</p>
                </div>
              </div>
            </div>

            <!-- Stream Settings -->
            <div class="bg-card border border-border rounded-lg p-4">
              <h3 class="font-semibold mb-4">Stream Settings</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-foreground mb-1.5">Stream Title</label>
                  <input 
                    type="text" 
                    placeholder="Enter stream title"
                    value="Epic Gaming Stream - Come Hang Out!"
                    class="w-full h-10 px-4 bg-secondary border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-foreground mb-1.5">Category</label>
                  <select class="w-full h-10 px-4 bg-secondary border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>Fortnite</option>
                    <option>Valorant</option>
                    <option>Minecraft</option>
                    <option>GTA V</option>
                    <option>Just Chatting</option>
                    <option>Variety</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-foreground mb-1.5">Tags</label>
                  <div class="flex flex-wrap gap-2 mb-2">
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-sm">
                      English
                      <button class="hover:text-destructive">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-sm">
                      FPS
                      <button class="hover:text-destructive">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Add tags..."
                    class="w-full h-10 px-4 bg-secondary border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <p class="text-xs text-muted-foreground mt-1">Add up to 5 tags</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Sidebar -->
          <div class="space-y-6">
            <!-- Go Live Button -->
            <div class="bg-card border border-border rounded-lg p-4">
              <div class="text-center mb-4">
                <span class="inline-block w-3 h-3 rounded-full bg-gray-400 mb-2"></span>
                <p class="text-sm text-muted-foreground">Offline</p>
              </div>
              <button class="w-full h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Go Live
              </button>
            </div>

            <!-- Stream Key -->
            <div class="bg-card border border-border rounded-lg p-4">
              <h3 class="font-semibold mb-4">Stream Key</h3>
              <div class="relative mb-3">
                <input 
                  type="password" 
                  value="live_1234567890abcdef"
                  readonly
                  class="w-full h-10 px-4 pr-12 bg-secondary border border-input rounded-md text-sm"
                />
                <button class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <button class="w-full text-sm text-primary hover:underline">Reset Stream Key</button>
              <p class="text-xs text-muted-foreground mt-2">Use this key in OBS or Streamlabs</p>
            </div>

            <!-- Recent Streams -->
            <div class="bg-card border border-border rounded-lg p-4">
              <h3 class="font-semibold mb-4">Recent Streams</h3>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <div class="w-16 h-10 rounded bg-secondary flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">Valorant Ranked</p>
                    <p class="text-xs text-muted-foreground">3h 24m • 18.5K avg</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-16 h-10 rounded bg-secondary flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">Chill Stream</p>
                    <p class="text-xs text-muted-foreground">5h 12m • 12.3K avg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `
})
export class DashboardComponent {}
