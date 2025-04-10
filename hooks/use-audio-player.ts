import { useState, useEffect, useCallback } from 'react';
import { AudioService, AudioEvent, isClient } from '@/lib/services/audio-service';
import { Track } from '@/lib/definitions/Track';

/**
 * Hook để sử dụng AudioService trong các component React
 */
export function useAudioPlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(80);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Đảm bảo chỉ sử dụng AudioService ở phía client
  const getAudioService = useCallback(() => {
    if (!isClient()) {
      return null;
    }
    return AudioService.getInstance();
  }, []);

  // Khởi tạo trạng thái từ AudioService
  useEffect(() => {
    const audioService = getAudioService();
    if (!audioService) return;

    // Lấy thông tin bài hát hiện tại từ service (nếu có)
    const trackFromService = audioService.getCurrentTrack();
    if (trackFromService) {
      setCurrentTrack(trackFromService);
    }

    // Đồng bộ trạng thái từ service
    const state = audioService.getPlaybackState();
    setIsPlaying(state.isPlaying);
    setVolume(state.volume);
    setCurrentTime(state.currentTime);
    setDuration(state.duration);

    // Xử lý các sự kiện audio
    const handleAudioEvent = (event: AudioEvent) => {
      switch (event.type) {
        case 'play':
          setIsPlaying(true);
          // Nếu event có chứa thông tin bài hát, cập nhật currentTrack
          if (event.detail?.track) {
            setCurrentTrack(event.detail.track);
          }
          break;
        case 'pause':
          setIsPlaying(false);
          break;
        case 'ended':
          setIsPlaying(false);
          setCurrentTime(0);
          break;
        case 'timeupdate':
          if (event.detail) {
            setCurrentTime(event.detail.currentTime);
            setDuration(event.detail.duration);
          }
          break;
        case 'volumechange':
          if (event.detail) {
            setVolume(event.detail.volume * 100);
          }
          break;
        case 'error':
          setError('Error playing track');
          setIsPlaying(false);
          break;
      }
    };

    // Đăng ký lắng nghe sự kiện
    audioService.addEventListener(handleAudioEvent);

    // Hủy đăng ký khi component unmount
    return () => {
      audioService.removeEventListener(handleAudioEvent);
    };
  }, [getAudioService]);

  // Phát một bài hát
  const playTrack = useCallback((track: Track) => {
    const audioService = getAudioService();
    if (!audioService) return;

    // Cập nhật state ngay lập tức - điều này đảm bảo UI được cập nhật ngay
    setCurrentTrack(track);
    setIsPlaying(true);
    setError(null);
    
    // Gọi service để phát bài hát
    audioService.playTrack(track);
  }, [getAudioService]);

  // Chuyển đổi giữa phát/tạm dừng
  const togglePlayPause = useCallback(() => {
    const audioService = getAudioService();
    if (!audioService) return;

    audioService.togglePlayPause();
  }, [getAudioService]);

  // Thiết lập âm lượng
  const changeVolume = useCallback((newVolume: number) => {
    const audioService = getAudioService();
    if (!audioService) return;

    audioService.setVolume(newVolume);
    setVolume(newVolume);
  }, [getAudioService]);

  // Di chuyển đến vị trí cụ thể
  const seekTo = useCallback((time: number) => {
    const audioService = getAudioService();
    if (!audioService) return;

    audioService.seek(time);
  }, [getAudioService]);

  // Định dạng thời gian dưới dạng mm:ss
  const formatTime = useCallback((timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds)) return '0:00';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Trả về các trạng thái và phương thức điều khiển
  return {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    error,
    playTrack,
    togglePlayPause,
    changeVolume,
    seekTo,
    formatTime
  };
}