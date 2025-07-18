import { useState, useEffect, useCallback, useRef } from "react";
import {
  AudioService,
  AudioEvent,
  isClient,
} from "@/lib/services/audio-service";
import { Track } from "@/lib/definitions/Track";
import { TrackViewService } from "@/lib/services/track-view-service";

/**
 * Hook để sử dụng AudioService trong các component React
 */
export function useAudioPlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [trackList, setTrackListState] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(80);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // View tracking state
  const [viewStartTime, setViewStartTime] = useState<number>(0);
  const [hasRecordedView, setHasRecordedView] = useState<boolean>(false);
  const [sessionId] = useState<string>(() => `session-${Date.now()}-${Math.random().toString(36)}`);
  const viewCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
        case "play":
          setIsPlaying(true);
          // Nếu event có chứa thông tin bài hát, cập nhật currentTrack
          if (event.detail?.track) {
            setCurrentTrack(event.detail.track);
          }
          break;
        case "pause":
          setIsPlaying(false);
          break;
        case "ended":
          setIsPlaying(false);
          setCurrentTime(0);
          // Tự động chuyển đến bài tiếp theo khi kết thúc
          if (trackList.length > 1) {
            const nextIndex = (currentIndex + 1) % trackList.length;
            const nextTrack = trackList[nextIndex];
            if (nextTrack) {
              setTimeout(() => {
                setCurrentIndex(nextIndex);
                setCurrentTrack(nextTrack);
                setIsPlaying(true);
                audioService.playTrack(nextTrack);
              }, 500);
            }
          }
          break;
        case "timeupdate":
          if (event.detail) {
            setCurrentTime(event.detail.currentTime);
            setDuration(event.detail.duration);
          }
          break;
        case "volumechange":
          if (event.detail) {
            setVolume(event.detail.volume * 100);
          }
          break;
        case "error":
          setError("Error playing track");
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
  const playTrack = useCallback(
    (track: Track) => {
      const audioService = getAudioService();
      if (!audioService) return;

      // Tìm index của track trong playlist
      const trackIndex = trackList.findIndex((t) => t.id === track.id);
      if (trackIndex !== -1) {
        setCurrentIndex(trackIndex);
      }

      // Cập nhật state ngay lập tức - điều này đảm bảo UI được cập nhật ngay
      setCurrentTrack(track);
      setIsPlaying(true);
      setError(null);
      setHasRecordedView(false);
      setViewStartTime(Date.now());

      // Gọi service để phát bài hát
      audioService.playTrack(track);
    },
    [getAudioService, trackList, sessionId],
  );

  // Chuyển đổi giữa phát/tạm dừng
  const togglePlayPause = useCallback(() => {
    const audioService = getAudioService();
    if (!audioService) return;

    audioService.togglePlayPause();
  }, [getAudioService]);

  // Thiết lập âm lượng
  const changeVolume = useCallback(
    (newVolume: number) => {
      const audioService = getAudioService();
      if (!audioService) return;

      audioService.setVolume(newVolume);
      setVolume(newVolume);
    },
    [getAudioService],
  );

  // Thiết lập danh sách track
  const setTrackList = useCallback((tracks: Track[]) => {
    setTrackListState(tracks);
    setCurrentIndex(0);
  }, []);

  // Chuyển đến bài hát tiếp theo
  const playNext = useCallback(() => {
    if (trackList.length === 0) return;

    const nextIndex = (currentIndex + 1) % trackList.length;
    const nextTrack = trackList[nextIndex];

    if (nextTrack) {
      setCurrentIndex(nextIndex);
      playTrack(nextTrack);
    }
  }, [trackList, currentIndex, playTrack]);

  // Chuyển đến bài hát trước đó
  const playPrevious = useCallback(() => {
    if (trackList.length === 0) return;

    const prevIndex =
      currentIndex === 0 ? trackList.length - 1 : currentIndex - 1;
    const prevTrack = trackList[prevIndex];

    if (prevTrack) {
      setCurrentIndex(prevIndex);
      playTrack(prevTrack);
    }
  }, [trackList, currentIndex, playTrack]);

  // Di chuyển đến vị trí cụ thể
  const seekTo = useCallback(
    (time: number) => {
      const audioService = getAudioService();
      if (!audioService) return;

      audioService.seek(time);
    },
    [getAudioService],
  );

  // Định dạng thời gian dưới dạng mm:ss
  const formatTime = useCallback((timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds)) return "0:00";

    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Function to record track view
  const recordTrackView = useCallback(async (trackId: number, playDuration: number) => {
    if (hasRecordedView) return;

    try {
      const response = await fetch(`/api/tracks/${trackId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          viewDuration: playDuration,
          sessionId: sessionId,
        }),
      });

      if (response.ok) {
        setHasRecordedView(true);
        console.log(`View recorded for track ${trackId} after ${playDuration} seconds`);
      }
    } catch (error) {
      console.error('Error recording view:', error);
    }
  }, [hasRecordedView, sessionId]);


  useEffect(() => {
    const audioService = getAudioService();
    if (!audioService) return;

    audioService.addEventListener("timeupdate", () => {
      setCurrentTime(audioService.getCurrentTime());
    });
  }, [getAudioService]);

  useEffect(() => {
    const audioService = getAudioService();
    if (!audioService) return;

    // Check if we should record a view (after 30 seconds of listening)
    if (!hasRecordedView && currentTrack && currentTime >= 30) {
      const playDuration = Math.floor((Date.now() - viewStartTime) / 1000);
      recordTrackView(currentTrack.id, playDuration);
    }
  }, [currentTime, hasRecordedView, currentTrack, viewStartTime, recordTrackView, getAudioService]);

  // Trả về các trạng thái và phương thức điều khiển
  return {
    currentTrack,
    trackList,
    currentIndex,
    isPlaying,
    volume,
    currentTime,
    duration,
    error,
    playTrack,
    setTrackList,
    playNext,
    playPrevious,
    togglePlayPause,
    changeVolume,
    seekTo,
    formatTime,
  };
}