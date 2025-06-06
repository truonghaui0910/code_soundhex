
import { useState } from 'react';
import { Track } from '@/lib/definitions/Track';
import { DownloadService } from '@/lib/services/download-service';

export function useDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, boolean>>({});

  const downloadTrack = async (track: Track) => {
    if (!DownloadService.isDownloadSupported()) {
      alert('Download is not supported in your browser');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(prev => ({ ...prev, [track.id]: true }));

    try {
      await DownloadService.downloadTrack(track);
    } catch (error) {
      console.error('Download error:', error);
      alert(error instanceof Error ? error.message : 'Download failed');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(prev => ({ ...prev, [track.id]: false }));
    }
  };

  const downloadMultipleTracks = async (tracks: Track[]) => {
    if (!DownloadService.isDownloadSupported()) {
      alert('Download is not supported in your browser');
      return;
    }

    setIsDownloading(true);

    try {
      await DownloadService.downloadMultipleTracks(tracks);
    } catch (error) {
      console.error('Batch download error:', error);
      alert(error instanceof Error ? error.message : 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const isTrackDownloading = (trackId: number) => {
    return downloadProgress[trackId] || false;
  };

  return {
    downloadTrack,
    downloadMultipleTracks,
    isDownloading,
    isTrackDownloading,
  };
}
