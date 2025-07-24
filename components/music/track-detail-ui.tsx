import React from 'react';

const TrackGridSm = ({ tracks, isLoading }) => {
  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!tracks || tracks.length === 0) {
    return <p>No tracks available.</p>;
  }

  return (
    <div className="space-y-2">
      {tracks.map((track) => (
        <div key={track.id} className="track-item">
          {track.name}
        </div>
      ))}
    </div>
  );
};

export default TrackGridSm;