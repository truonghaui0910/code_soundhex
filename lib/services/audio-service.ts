import { Track } from "@/lib/definitions/Track";

// Interface cho sự kiện audio
export interface AudioEvent {
  type: 'play' | 'pause' | 'ended' | 'timeupdate' | 'volumechange' | 'error';
  detail?: any;
}

// Kiểu callback cho sự kiện audio
export type AudioEventCallback = (event: AudioEvent) => void;

/**
 * Service xử lý phát nhạc
 */
export class AudioService {
  private static instance: AudioService;
  private audio: HTMLAudioElement | null = null;
  private currentTrack: Track | null = null;
  private eventListeners: AudioEventCallback[] = [];
  private volume: number = 80;
  
  // Constructor private để thực hiện pattern singleton
  private constructor() {
    // Khởi tạo chỉ ở phía client
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.setupAudioEvents();
    }
  }
  
  /**
   * Lấy instance singleton
   */
  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }
  
  /**
   * Thiết lập các event listeners cho đối tượng audio
   */
  private setupAudioEvents(): void {
    if (!this.audio) return;
    
    this.audio.addEventListener('play', () => this.notifyListeners({ type: 'play' }));
    this.audio.addEventListener('pause', () => this.notifyListeners({ type: 'pause' }));
    this.audio.addEventListener('ended', () => this.notifyListeners({ type: 'ended' }));
    this.audio.addEventListener('timeupdate', () => {
      this.notifyListeners({ 
        type: 'timeupdate', 
        detail: { 
          currentTime: this.audio?.currentTime || 0,
          duration: this.audio?.duration || 0
        } 
      });
    });
    this.audio.addEventListener('volumechange', () => {
      this.notifyListeners({ 
        type: 'volumechange', 
        detail: { volume: this.audio?.volume || 0 } 
      });
    });
    this.audio.addEventListener('error', (e) => {
      this.notifyListeners({ 
        type: 'error', 
        detail: { error: e } 
      });
    });
  }
  
  /**
   * Thông báo cho tất cả listeners về một event
   */
  private notifyListeners(event: AudioEvent): void {
    this.eventListeners.forEach(callback => callback(event));
  }
  
  /**
   * Thêm event listener
   */
  public addEventListener(callback: AudioEventCallback): void {
    this.eventListeners.push(callback);
  }
  
  /**
   * Xóa event listener
   */
  public removeEventListener(callback: AudioEventCallback): void {
    this.eventListeners = this.eventListeners.filter(cb => cb !== callback);
  }
  
  /**
   * Tải và phát một bài hát
   */
  public playTrack(track: Track): void {
    if (!this.audio) return;
    
    this.currentTrack = track;
    this.audio.src = track.file_url;
    this.audio.volume = this.volume / 100;
    this.audio.play().catch(err => {
      console.error("Error playing track:", err);
      this.notifyListeners({ type: 'error', detail: { error: err } });
    });
  }
  
  /**
   * Tạm dừng phát nhạc
   */
  public pause(): void {
    if (!this.audio) return;
    this.audio.pause();
  }
  
  /**
   * Tiếp tục phát nhạc
   */
  public play(): void {
    if (!this.audio) return;
    this.audio.play().catch(err => {
      console.error("Error resuming playback:", err);
      this.notifyListeners({ type: 'error', detail: { error: err } });
    });
  }
  
  /**
   * Chuyển đổi giữa phát/tạm dừng
   */
  public togglePlayPause(): void {
    if (!this.audio) return;
    
    if (this.audio.paused) {
      this.play();
    } else {
      this.pause();
    }
  }
  
  /**
   * Thiết lập âm lượng (0-100)
   */
  public setVolume(volume: number): void {
    if (!this.audio) return;
    
    this.volume = Math.max(0, Math.min(100, volume));
    this.audio.volume = this.volume / 100;
  }
  
  /**
   * Di chuyển đến vị trí cụ thể trong bài hát
   */
  public seek(time: number): void {
    if (!this.audio) return;
    
    this.audio.currentTime = Math.max(0, Math.min(time, this.audio.duration || 0));
  }
  
  /**
   * Lấy thông tin bài hát hiện tại
   */
  public getCurrentTrack(): Track | null {
    return this.currentTrack;
  }
  
  /**
   * Lấy trạng thái phát hiện tại
   */
  public getPlaybackState(): {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
  } {
    if (!this.audio) {
      return {
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: this.volume
      };
    }
    
    return {
      isPlaying: !this.audio.paused,
      currentTime: this.audio.currentTime,
      duration: this.audio.duration || 0,
      volume: this.volume
    };
  }
  
  /**
   * Giải phóng tài nguyên
   */
  public dispose(): void {
    if (!this.audio) return;
    
    this.audio.pause();
    this.audio.src = '';
    this.eventListeners = [];
  }
}

// Hàm tiện ích để kiểm tra xem có đang ở môi trường client hay không
export function isClient() {
  return typeof window !== 'undefined';
}