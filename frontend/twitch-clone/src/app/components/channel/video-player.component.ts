import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, signal, computed, HostListener, AfterViewInit } from '@angular/core';
import Hls from 'hls.js';

export interface QualityLevel {
  height: number;
  bitrate: number;
  name: string;
}

@Component({
  selector: 'app-video-player',
  standalone: true,
  template: `
    <div
      #playerContainer
      class="relative w-full h-full bg-black rounded-lg overflow-hidden group"
      [class.aspect-video]="!isFullscreen"
    >
      <!-- Video Element -->
      <video
        #videoElement
        [poster]="posterUrl"
        class="w-full h-full object-contain"
        (loadedmetadata)="onLoadedMetadata()"
        (timeupdate)="onTimeUpdate()"
        (waiting)="isBuffering.set(true)"
        (canplay)="isBuffering.set(false)"
        (ended)="onEnded()"
        (click)="togglePlay()"
        (dblclick)="toggleFullscreen()"
      ></video>

      <!-- Buffering Spinner -->
      @if (isBuffering()) {
        <div class="absolute inset-0 flex items-center justify-center bg-black/50">
          <div class="w-16 h-16 border-4 border-white/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      }

      <!-- Big Play Button (when paused) -->
      @if (!isPlaying() && !isBuffering()) {
        <div class="absolute inset-0 flex items-center justify-center cursor-pointer" (click)="togglePlay()">
          <div class="w-20 h-20 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      }

      <!-- Controls Overlay -->
      <div
        class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-16 pb-4 px-4 transition-opacity duration-300"
        [class.opacity-0]="!showControls() && isPlaying()"
        [class.opacity-100]="showControls() || !isPlaying()"
        (mouseenter)="showControls.set(true)"
        (mouseleave)="onMouseLeave()"
      >
        <!-- Progress Bar -->
        <div
          class="w-full h-1 bg-white/30 rounded-full mb-3 cursor-pointer group/progress"
          (click)="onProgressClick($event)"
          (mousemove)="onProgressHover($event)"
          (mouseleave)="hoverTime.set(null)"
        >
          <div
            class="h-full bg-primary rounded-full relative"
            [style.width.%]="progress()"
          >
            <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full scale-0 group-hover/progress:scale-100 transition-transform"></div>
          </div>
        </div>

        <!-- Hover Time Tooltip -->
        @if (hoverTime() !== null) {
          <div
            class="absolute bottom-8 bg-black/80 text-white text-xs px-2 py-1 rounded transform -translate-x-1/2"
            [style.left.%]="hoverPosition()"
          >
            {{ formatTime(hoverTime()!) }}
          </div>
        }

        <!-- Controls Row -->
        <div class="flex items-center justify-between">
          <!-- Left Controls -->
          <div class="flex items-center gap-2">
            <!-- Play/Pause -->
            <button
              class="p-2 hover:bg-white/20 rounded-md transition-colors"
              (click)="togglePlay()"
            >
              @if (isPlaying()) {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              }
            </button>

            <!-- Volume Controls -->
            <div class="flex items-center gap-1 group/volume">
              <button
                class="p-2 hover:bg-white/20 rounded-md transition-colors"
                (click)="toggleMute()"
              >
                @if (isMuted() || volume() === 0) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/>
                  </svg>
                } @else if (volume() < 0.5) {
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                  </svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                  </svg>
                }
              </button>

              <!-- Volume Slider -->
              <div class="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-200">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  [value]="volume()"
                  (input)="onVolumeChange($event)"
                  class="w-20 h-1 accent-primary cursor-pointer"
                />
              </div>
            </div>

            <!-- Time Display -->
            <div class="text-white text-sm ml-2">
              <span>{{ formatTime(currentTime()) }}</span>
              <span class="text-white/60"> / {{ formatTime(duration()) }}</span>
            </div>
          </div>

          <!-- Right Controls -->
          <div class="flex items-center gap-2">
            <!-- Live Indicator -->
            @if (isLive) {
              <div class="flex items-center gap-1 px-2 py-1 bg-red-600 rounded">
                <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span class="text-white text-xs font-medium">LIVE</span>
              </div>
            }

            <!-- Quality Selector -->
            <div class="relative">
              <button
                class="p-2 hover:bg-white/20 rounded-md transition-colors flex items-center gap-1"
                (click)="toggleQualityMenu()"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="text-white text-xs">{{ currentQuality() }}</span>
              </button>

              <!-- Quality Menu -->
              @if (showQualityMenu()) {
                <div class="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg py-2 min-w-[120px]">
                  @for (quality of qualityLevels(); track quality.name) {
                    <button
                      class="w-full px-4 py-2 text-left text-sm hover:bg-white/20 transition-colors flex items-center justify-between"
                      [class.text-primary]="currentQuality() === quality.name"
                      [class.text-white]="currentQuality() !== quality.name"
                      (click)="setQuality(quality)"
                    >
                      <span>{{ quality.name }}</span>
                      @if (currentQuality() === quality.name) {
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      }
                    </button>
                  }
                </div>
              }
            </div>

            <!-- PiP -->
            <button
              class="p-2 hover:bg-white/20 rounded-md transition-colors"
              (click)="togglePiP()"
              title="Picture in Picture"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
            </button>

            <!-- Fullscreen -->
            <button
              class="p-2 hover:bg-white/20 rounded-md transition-colors"
              (click)="toggleFullscreen()"
            >
              @if (isFullscreen) {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"/>
                </svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                </svg>
              }
            </button>
          </div>
        </div>
      </div>

      <!-- Click to show controls when playing -->
      @if (isPlaying()) {
        <div
          class="absolute inset-0"
          (click)="togglePlay()"
          (mousemove)="showControls.set(true)"
        ></div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 9999px;
      height: 4px;
    }

    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: white;
      cursor: pointer;
    }

    input[type="range"]::-moz-range-thumb {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: white;
      cursor: pointer;
      border: none;
    }
  `
})
export class VideoPlayerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('playerContainer') playerContainer!: ElementRef<HTMLDivElement>;

  @Input() src = '';
  @Input() posterUrl = '';
  @Input() isLive = false;
  @Input() qualities: string[] = ['auto', '1080p', '720p', '480p', '360p'];

  private hls: Hls | null = null;
  private hideControlsTimeout: any;
  private clickTimeout: any;
  private retryTimeout: any;
  private retryCount = 0;
  private maxRetries = 10;

  isPlaying = signal(false);
  isBuffering = signal(false);
  isMuted = signal(false);
  volume = signal(1);
  currentTime = signal(0);
  duration = signal(0);
  progress = signal(0);
  showControls = signal(true);
  showQualityMenu = signal(false);
  currentQuality = signal('auto');
  qualityLevels = signal<QualityLevel[]>([]);
  isFullscreen = false;
  hoverTime = signal<number | null>(null);
  hoverPosition = signal(0);

  ngAfterViewInit() {
    if (this.src) {
      this.initPlayer();
    }
  }

  ngOnDestroy() {
    this.destroyPlayer();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case ' ':
      case 'k':
        event.preventDefault();
        this.togglePlay();
        break;
      case 'm':
        this.toggleMute();
        break;
      case 'f':
        this.toggleFullscreen();
        break;
      case 'arrowleft':
        this.seek(-10);
        break;
      case 'arrowright':
        this.seek(10);
        break;
      case 'arrowup':
        event.preventDefault();
        this.setVolume(Math.min(1, this.volume() + 0.1));
        break;
      case 'arrowdown':
        event.preventDefault();
        this.setVolume(Math.max(0, this.volume() - 0.1));
        break;
    }
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange() {
    this.isFullscreen = !!document.fullscreenElement;
  }

  private initPlayer() {
    const video = this.videoElement.nativeElement;

    if (Hls.isSupported()) {
      this.hls = new Hls({
        enableWorker: true,
        lowLatencyMode: this.isLive,
        backBufferLength: this.isLive ? 0 : 30,
      });

      this.hls.loadSource(this.src);
      this.hls.attachMedia(video);

      this.hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        this.retryCount = 0;
        clearTimeout(this.retryTimeout);

        const levels = data.levels.map((level, index) => ({
          height: level.height,
          bitrate: level.bitrate,
          name: index === 0 ? 'auto' : `${level.height}p`
        }));
        this.qualityLevels.set(levels);
      });

      this.hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        const level = this.hls!.levels[data.level];
        if (level) {
          this.currentQuality.set(data.level === 0 ? 'auto' : `${level.height}p`);
        }
      });

      this.hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS fatal error:', data);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // manifest not ready yet (404) — retry after delay
              if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR && this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`[HLS] Manifest not ready, retry ${this.retryCount}/${this.maxRetries} in 3s...`);
                this.destroyPlayer();
                this.retryTimeout = setTimeout(() => this.initPlayer(), 3000);
              } else {
                this.hls?.startLoad();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              this.hls?.recoverMediaError();
              break;
            default:
              this.destroyPlayer();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = this.src;
    }
  }

  private destroyPlayer() {
    clearTimeout(this.retryTimeout);
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
  }

  togglePlay() {
    const video = this.videoElement.nativeElement;

    clearTimeout(this.clickTimeout);
    this.clickTimeout = setTimeout(() => {
      if (video.paused) {
        video.play();
        this.isPlaying.set(true);
      } else {
        video.pause();
        this.isPlaying.set(false);
      }
      this.resetHideControlsTimer();
    }, 200);
  }

  toggleMute() {
    const video = this.videoElement.nativeElement;
    video.muted = !video.muted;
    this.isMuted.set(video.muted);
  }

  onVolumeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.setVolume(parseFloat(input.value));
  }

  setVolume(value: number) {
    const video = this.videoElement.nativeElement;
    video.volume = value;
    this.volume.set(value);
    if (value === 0) {
      this.isMuted.set(true);
    } else if (this.isMuted()) {
      video.muted = false;
      this.isMuted.set(false);
    }
  }

  onTimeUpdate() {
    const video = this.videoElement.nativeElement;
    this.currentTime.set(video.currentTime);
    if (video.duration > 0) {
      this.progress.set((video.currentTime / video.duration) * 100);
    }
  }

  onLoadedMetadata() {
    const video = this.videoElement.nativeElement;
    this.duration.set(video.duration);
  }

  onProgressClick(event: MouseEvent) {
    if (this.isLive) return;

    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const video = this.videoElement.nativeElement;

    if (video.duration) {
      video.currentTime = percent * video.duration;
    }
  }

  onProgressHover(event: MouseEvent) {
    if (this.isLive) return;

    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;

    this.hoverPosition.set(percent * 100);

    const video = this.videoElement.nativeElement;
    if (video.duration) {
      this.hoverTime.set(percent * video.duration);
    }
  }

  seek(seconds: number) {
    const video = this.videoElement.nativeElement;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  }

  onEnded() {
    this.isPlaying.set(false);
    if (!this.isLive) {
      this.showControls.set(true);
    }
  }

  toggleFullscreen() {
    const container = this.playerContainer.nativeElement;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  async togglePiP() {
    const video = this.videoElement.nativeElement;

    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
      await video.requestPictureInPicture();
    }
  }

  toggleQualityMenu() {
    this.showQualityMenu.update(v => !v);
  }

  setQuality(quality: QualityLevel) {
    if (!this.hls) return;

    if (quality.name === 'auto') {
      this.hls.currentLevel = -1;
    } else {
      const levelIndex = this.hls.levels.findIndex(l => `${l.height}p` === quality.name);
      if (levelIndex !== -1) {
        this.hls.currentLevel = levelIndex;
      }
    }

    this.currentQuality.set(quality.name);
    this.showQualityMenu.set(false);
  }

  formatTime(seconds: number): string {
    if (!isFinite(seconds)) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  onMouseLeave() {
    if (this.isPlaying()) {
      this.resetHideControlsTimer();
    }
  }

  private resetHideControlsTimer() {
    clearTimeout(this.hideControlsTimeout);
    this.showControls.set(true);

    if (this.isPlaying()) {
      this.hideControlsTimeout = setTimeout(() => {
        this.showControls.set(false);
      }, 3000);
    }
  }
}
