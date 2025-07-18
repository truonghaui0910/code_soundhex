
import { useState } from 'react';
import { Track } from '@/lib/definitions/Track';
import { DownloadService } from '@/lib/services/download-service';
import { toast } from 'sonner';
import { useCurrentUser } from './use-current-user';
import { showWarning } from '@/lib/services/notification-service';

export function useDownload() {
  const { user } = useCurrentUser();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, boolean>>({});

  const downloadTrack = async (track: Track) => {
    if (!user) {
      showWarning({
        title: "Login Required",
        message: "You need to login to download tracks"
      });
      return;
    }

    if (!track.file_url) {
      toast.error('This track is not available for download');
      return;
    }

    if (!DownloadService.isDownloadSupported()) {
      toast.error('Downloads are not supported in your browser');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(prev => ({ ...prev, [track.id]: true }));

    try {
      await DownloadService.downloadTrack(track);
      toast.success(`Downloaded: ${track.title}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error(error instanceof Error ? error.message : 'Download failed');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(prev => ({ ...prev, [track.id]: false }));
    }
  };

  const downloadMultipleTracks = async (tracks: Track[]) => {
    if (!user) {
      showWarning({
        title: "Login Required",
        message: "You need to login to download tracks"
      });
      return;
    }

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
