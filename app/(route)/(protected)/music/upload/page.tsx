
import { Metadata } from "next";
import { MusicUpload } from "../music-upload";

export const metadata: Metadata = {
  title: "Upload Music - SoundHex",
  description: "Upload your music to SoundHex or import from Spotify",
};

export default function UploadPage() {
  return <MusicUpload />;
}
