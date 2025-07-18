
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

    let downloadSuccess = false;
    let errorMessage = '';

    try {
      await DownloadService.downloadTrack(track);
      downloadSuccess = true;
      toast.success(`Downloaded: ${track.title}`);
    } catch (error) {
      console.error('Download error:', error);
      errorMessage = error instanceof Error ? error.message : 'Download failed';
      toast.error(errorMessage);
    } finally {
      // Log the download attempt
      try {
        await fetch(`/api/tracks/${track.id}/download`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            downloadType: 'single',
            success: downloadSuccess,
            errorMessage: errorMessage || undefined
          })
        });
      } catch (logError) {
        console.error('Failed to log download:', logError);
      }

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

    let downloadSuccess = false;
    let errorMessage = '';

    try {
      await DownloadService.downloadMultipleTracks(tracks);
      downloadSuccess = true;
    } catch (error) {
      console.error('Batch download error:', error);
      errorMessage = error instanceof Error ? error.message : 'Download failed';
      alert(errorMessage);
    } finally {
      // Log the batch download
      try {
        for (const track of tracks) {
          await fetch(`/api/tracks/${track.id}/download`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              downloadType: 'batch',
              success: downloadSuccess,
              errorMessage: errorMessage || undefined
            })
          });
        }
      } catch (logError) {
        console.error('Failed to log batch download:', logError);
      }

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
