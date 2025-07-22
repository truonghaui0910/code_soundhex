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
  const [originalTrackList, setOriginalTrackList] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(80);
  const [previousVolume, setPreviousVolume] = useState<number>(80);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isShuffled, setIsShuffled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('audioPlayer_isShuffled') === 'true';
    }
    return false;
  });
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('audioPlayer_repeatMode');
      return (saved as 'none' | 'one' | 'all') || 'none';
    }
    return 'none';
  });
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);

  // View tracking state
  const [viewStartTime, setViewStartTime] = useState<number>(0);
  const [hasRecordedView, setHasRecordedView] = useState<boolean>(false);
  const [sessionId] = useState<string>(() => `session-${Date.now()}-${Math.random().toString(36)}`);
  const viewCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Restore trackList from localStorage on mount - IMPROVE VALIDATION
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTrackList = localStorage.getItem('audioPlayer_trackList');
      const savedOriginalTrackList = localStorage.getItem('audioPlayer_originalTrackList');
      const savedCurrentIndex = localStorage.getItem('audioPlayer_currentIndex');
      
      if (savedTrackList && savedOriginalTrackList) {
        try {
          const trackList = JSON.parse(savedTrackList);
          const originalTrackList = JSON.parse(savedOriginalTrackList);
          const currentIndex = parseInt(savedCurrentIndex || '0');
          
          // VALIDATE RESTORED DATA - ADD THIS
          if (Array.isArray(trackList) && Array.isArray(originalTrackList) && 
              trackList.length > 0 && originalTrackList.length > 0 &&
              currentIndex >= 0 && currentIndex < trackList.length) {
            
            console.log('✅ Restoring audio player state:', {
              trackListLength: trackList.length,
              originalTrackListLength: originalTrackList.length,
              currentIndex,
              currentTrack: trackList[currentIndex]?.title
            });
            
            setTrackListState(trackList);
            setOriginalTrackList(originalTrackList);
            setCurrentIndex(currentIndex);
            
            // Restore current track if exists
            if (trackList[currentIndex]) {
              setCurrentTrack(trackList[currentIndex]);
            }
          } else {
            console.log('❌ Invalid audio player state, clearing localStorage');
            // Clear invalid data
            localStorage.removeItem('audioPlayer_trackList');
            localStorage.removeItem('audioPlayer_originalTrackList');
            localStorage.removeItem('audioPlayer_currentIndex');
            localStorage.removeItem('audioPlayer_isShuffled');
            localStorage.removeItem('audioPlayer_repeatMode');
          }
        } catch (error) {
          console.error('Error restoring audio player state:', error);
          // Clear corrupted data
          localStorage.removeItem('audioPlayer_trackList');
          localStorage.removeItem('audioPlayer_originalTrackList');
          localStorage.removeItem('audioPlayer_currentIndex');
          localStorage.removeItem('audioPlayer_isShuffled');
          localStorage.removeItem('audioPlayer_repeatMode');
        }
      }
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('audioPlayer_isShuffled', isShuffled.toString());
    }
  }, [isShuffled]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('audioPlayer_repeatMode', repeatMode);
    }
  }, [repeatMode]);

  useEffect(() => {
    if (typeof window !== 'undefined' && trackList.length > 0) {
      localStorage.setItem('audioPlayer_trackList', JSON.stringify(trackList));
      localStorage.setItem('audioPlayer_currentIndex', currentIndex.toString());
    }
  }, [trackList, currentIndex]);

  useEffect(() => {
    if (typeof window !== 'undefined' && originalTrackList.length > 0) {
      localStorage.setItem('audioPlayer_originalTrackList', JSON.stringify(originalTrackList));
    }
  }, [originalTrackList]);

  // Đảm bảo chỉ sử dụng AudioService ở phía client
  const getAudioService = useCallback(() => {
    if (!isClient()) {
      return null;
    }
    return AudioService.getInstance();
  }, []);

  // Helper function để shuffle array
  const shuffleArray = useCallback((array: Track[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Lấy track tiếp theo dựa vào repeat mode
  const getNextTrack = useCallback(() => {
    if (trackList.length === 0) return null;

    if (repeatMode === 'one' && currentTrack) {
      return { track: currentTrack, index: currentIndex };
    }

    let nextIndex: number;
    if (repeatMode === 'all') {
      nextIndex = (currentIndex + 1) % trackList.length;
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= trackList.length) {
        return null; // Kết thúc playlist
      }
    }

    return { track: trackList[nextIndex], index: nextIndex };
  }, [trackList, currentIndex, repeatMode, currentTrack]);

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
          console.log('Audio ended - starting auto-next logic');
          setIsPlaying(false);
          setCurrentTime(0);
          // Sử dụng callback để lấy state mới nhất
          setCurrentIndex(currentIdx => {
            setTrackListState(currentTrackList => {
              setRepeatMode(currentRepeatMode => {
                setCurrentTrack(currentTrackState => {
                  if (currentTrackList.length === 0) return currentTrackState;

                  let nextIndex: number;
                  let nextTrack: Track | null = null;

                  if (currentRepeatMode === 'one' && currentTrackState) {
                    nextTrack = currentTrackState;
                    nextIndex = currentIdx;
                  } else if (currentRepeatMode === 'all') {
                    nextIndex = (currentIdx + 1) % currentTrackList.length;
                    nextTrack = currentTrackList[nextIndex];
                  } else {
                    nextIndex = currentIdx + 1;
                    if (nextIndex < currentTrackList.length) {
                      nextTrack = currentTrackList[nextIndex];
                    }
                  }

                  if (nextTrack) {
                    setTimeout(() => {
                      setCurrentIndex(nextIndex);
                      setCurrentTrack(nextTrack);
                      audioService.playTrack(nextTrack);
                    }, 100);
                  }

                  return currentTrackState;
                });
                return currentRepeatMode;
              });
              return currentTrackList;
            });
            return currentIdx;
          });
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

      // Check current trackList state immediately, but with a fallback
      const checkAndPlay = () => {
        // Get the most current trackList
        setTrackListState(currentTrackList => {
          // Tìm index của track trong playlist hiện tại
          const trackIndex = currentTrackList.findIndex((t) => t.id === track.id);
          
          if (trackIndex !== -1) {
            setCurrentIndex(trackIndex);
          } else if (currentTrackList.length === 0) {
            // If trackList is empty, wait a bit more for setTrackList to complete
            setTimeout(() => {
              setTrackListState(retryTrackList => {
                const retryIndex = retryTrackList.findIndex((t) => t.id === track.id);
                if (retryIndex !== -1) {
                  setCurrentIndex(retryIndex);
                } else {
                  // Still not found, create single-track queue
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('audioPlayer_trackList');
                    localStorage.removeItem('audioPlayer_originalTrackList');
                    localStorage.removeItem('audioPlayer_currentIndex');
                    localStorage.removeItem('audioPlayer_isShuffled');
                    localStorage.removeItem('audioPlayer_repeatMode');
                  }
                  setOriginalTrackList([track]);
                  setCurrentIndex(0);
                  setIsShuffled(false);
                  setRepeatMode('none');
                  return [track];
                }
                return retryTrackList;
              });
            }, 100);
          } else {
            // Track not found in existing non-empty list, create single-track queue
            if (typeof window !== 'undefined') {
              localStorage.removeItem('audioPlayer_trackList');
              localStorage.removeItem('audioPlayer_originalTrackList');
              localStorage.removeItem('audioPlayer_currentIndex');
              localStorage.removeItem('audioPlayer_isShuffled');
              localStorage.removeItem('audioPlayer_repeatMode');
            }
            setOriginalTrackList([track]);
            setCurrentIndex(0);
            setIsShuffled(false);
            setRepeatMode('none');
            return [track];
          }
          return currentTrackList;
        });
      };

      checkAndPlay();

      // Reset view tracking cho bài hát mới
      setHasRecordedView(false);
      setViewStartTime(Date.now());

      // Cập nhật state ngay lập tức - điều này đảm bảo UI được cập nhật ngay
      setCurrentTrack(track);
      setIsPlaying(true);
      setError(null);

      // Gọi service để phát bài hát
      audioService.playTrack(track);
    },
    [getAudioService],
  );

  // Clear invalid audio player state - ADD THIS HELPER FUNCTION
  const clearInvalidState = useCallback(() => {
    console.log('🧹 Clearing invalid audio player state');
    setCurrentTrack(null);
    setTrackListState([]);
    setOriginalTrackList([]);
    setCurrentIndex(0);
    setIsPlaying(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('audioPlayer_trackList');
      localStorage.removeItem('audioPlayer_originalTrackList');
      localStorage.removeItem('audioPlayer_currentIndex');
      localStorage.removeItem('audioPlayer_isShuffled');
      localStorage.removeItem('audioPlayer_repeatMode');
    }
  }, []);

  // Chuyển đổi giữa phát/tạm dừng - FIX INVALID TRACK ISSUE
  const togglePlayPause = useCallback(() => {
    const audioService = getAudioService();
    if (!audioService) return;

    // CHECK IF CURRENT TRACK IS VALID - ADD THIS
    if (!currentTrack) {
      console.log('❌ togglePlayPause - No current track available');
      return;
    }

    // CHECK IF CURRENT TRACK EXISTS IN TRACKLIST - ADD THIS
    const trackExists = trackList.some(track => track.id === currentTrack.id);
    if (!trackExists) {
      console.log('❌ togglePlayPause - Current track not found in trackList, clearing invalid state');
      clearInvalidState();
      return;
    }

    console.log('✅ togglePlayPause - Playing track:', currentTrack.title);
    audioService.togglePlayPause();
  }, [getAudioService, currentTrack, trackList, clearInvalidState]);

  // Thiết lập âm lượng
  const changeVolume = useCallback(
    (newVolume: number) => {
      const audioService = getAudioService();
      if (!audioService) return;

      // Save previous volume if not muting to 0
      if (newVolume > 0 && volume !== newVolume) {
        setPreviousVolume(volume);
      }

      audioService.setVolume(newVolume);
      setVolume(newVolume);
    },
    [getAudioService, volume],
  );

  // Toggle mute/unmute
  const toggleMute = useCallback(() => {
    if (volume === 0) {
      // Unmute: restore previous volume
      changeVolume(previousVolume > 0 ? previousVolume : 80);
    } else {
      // Mute: set volume to 0
      setPreviousVolume(volume);
      changeVolume(0);
    }
  }, [volume, previousVolume, changeVolume]);

  // Thiết lập danh sách track
  const setTrackList = useCallback((tracks: Track[]) => {
    // Clear old queue and reset state
    if (typeof window !== 'undefined') {
      localStorage.removeItem('audioPlayer_trackList');
      localStorage.removeItem('audioPlayer_originalTrackList');
      localStorage.removeItem('audioPlayer_currentIndex');
      localStorage.removeItem('audioPlayer_isShuffled');
      localStorage.removeItem('audioPlayer_repeatMode');
    }
    
    setOriginalTrackList(tracks);
    setTrackListState(tracks);
    setCurrentIndex(0);
    setIsShuffled(false);
    setRepeatMode('none');
  }, []);

  // Toggle shuffle
  const toggleShuffle = useCallback(() => {
    if (isShuffled) {
      // Tắt shuffle: trở về danh sách gốc
      setTrackListState(originalTrackList);
      // Tìm vị trí của bài hát hiện tại trong danh sách gốc
      if (currentTrack) {
        const originalIndex = originalTrackList.findIndex(t => t.id === currentTrack.id);
        if (originalIndex !== -1) {
          setCurrentIndex(originalIndex);
        }
      }
    } else {
      // Bật shuffle: xáo trộn danh sách
      const shuffled = shuffleArray(originalTrackList);
      // Đặt bài hát hiện tại ở đầu danh sách shuffle
      if (currentTrack) {
        const currentTrackIndex = shuffled.findIndex(t => t.id === currentTrack.id);
        if (currentTrackIndex !== -1) {
          // Hoán đổi bài hát hiện tại lên đầu
          [shuffled[0], shuffled[currentTrackIndex]] = [shuffled[currentTrackIndex], shuffled[0]];
        }
      }
      setTrackListState(shuffled);
      setCurrentIndex(0);
    }
    setIsShuffled(!isShuffled);
  }, [isShuffled, originalTrackList, currentTrack, shuffleArray]);

  // Toggle repeat mode
  const toggleRepeat = useCallback(() => {
    const modes: ('none' | 'one' | 'all')[] = ['none', 'all', 'one'];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  }, [repeatMode]);

  // Toggle queue visibility
  const toggleQueue = useCallback(() => {
    setIsQueueOpen(!isQueueOpen);
  }, [isQueueOpen]);

  // Remove track from queue
  const removeFromQueue = useCallback((trackId: number) => {
    const newTrackList = trackList.filter(track => track.id !== trackId);
    setTrackListState(newTrackList);
    
    // Cập nhật originalTrackList nếu cần
    if (!isShuffled) {
      setOriginalTrackList(newTrackList);
    }
    
    // Điều chỉnh currentIndex nếu cần
    if (currentTrack && trackId === currentTrack.id) {
      // Nếu xóa bài đang phát, chuyển sang bài tiếp theo
      if (newTrackList.length > 0) {
        const nextIndex = Math.min(currentIndex, newTrackList.length - 1);
        setCurrentIndex(nextIndex);
        playTrack(newTrackList[nextIndex]);
      } else {
        setCurrentTrack(null);
        setCurrentIndex(0);
      }
    } else if (currentTrack) {
      // Điều chỉnh index nếu bài bị xóa nằm trước bài đang phát
      const removedIndex = trackList.findIndex(t => t.id === trackId);
      const currentTrackIndex = newTrackList.findIndex(t => t.id === currentTrack.id);
      if (removedIndex < currentIndex && currentTrackIndex !== -1) {
        setCurrentIndex(currentTrackIndex);
      }
    }
  }, [trackList, currentTrack, currentIndex, isShuffled, playTrack]);

  // Reorder queue
  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    const newTrackList = [...trackList];
    const [movedTrack] = newTrackList.splice(fromIndex, 1);
    newTrackList.splice(toIndex, 0, movedTrack);
    
    setTrackListState(newTrackList);
    
    // Cập nhật currentIndex
    if (currentTrack) {
      const newCurrentIndex = newTrackList.findIndex(t => t.id === currentTrack.id);
      if (newCurrentIndex !== -1) {
        setCurrentIndex(newCurrentIndex);
      }
    }
  }, [trackList, currentTrack]);

  // Jump to specific track in queue
  const jumpToTrack = useCallback((index: number) => {
    if (index >= 0 && index < trackList.length) {
      const track = trackList[index];
      if (track) {
        playTrack(track);
      }
    }
  }, [trackList, playTrack]);

  // Chuyển đến bài hát tiếp theo
  const playNext = useCallback(() => {
    const nextTrackInfo = getNextTrack();
    if (nextTrackInfo) {
      setCurrentIndex(nextTrackInfo.index);
      playTrack(nextTrackInfo.track);
    }
  }, [getNextTrack, playTrack]);

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

    // Set flag immediately to prevent multiple calls
    setHasRecordedView(true);

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
        console.log(`View recorded for track ${trackId} after ${playDuration} seconds`);
      } else {
        // Reset flag if API call failed
        const errorData = await response.json().catch(() => ({}));
        console.error(`Failed to record view for track ${trackId}:`, errorData);
        if (response.status === 400) {
          // Don't retry for validation errors
          console.log('View recording failed due to validation - will not retry');
        } else {
          // Reset flag for other errors to allow retry
          setHasRecordedView(false);
        }
      }
    } catch (error) {
      console.error('Error recording view:', error);
      // Reset flag on network errors to allow retry
      setHasRecordedView(false);
    }
  }, [hasRecordedView, sessionId]);


  useEffect(() => {
    const audioService = getAudioService();
    if (!audioService) return;

    // Check if we should record a view (after 15 seconds of actual listening time)
    if (!hasRecordedView && currentTrack && viewStartTime > 0) {
      const actualPlayDuration = Math.floor((Date.now() - viewStartTime) / 1000);
      
      // Only record view if user has actually listened for 15+ seconds
      if (actualPlayDuration >= 15) {
        recordTrackView(currentTrack.id, actualPlayDuration);
      }
    }
  }, [currentTime, hasRecordedView, currentTrack, viewStartTime, recordTrackView, getAudioService]);

  // Trả về các trạng thái và phương thức điều khiển
  return {
    currentTrack,
    trackList,
    originalTrackList,
    currentIndex,
    isPlaying,
    volume,
    currentTime,
    duration,
    error,
    isShuffled,
    repeatMode,
    isQueueOpen,
    playTrack,
    setTrackList,
    playNext,
    playPrevious,
    togglePlayPause,
    changeVolume,
    seekTo,
    formatTime,
    toggleShuffle,
    toggleRepeat,
    toggleQueue,
    toggleMute,
    removeFromQueue,
    reorderQueue,
    jumpToTrack,
  };
}