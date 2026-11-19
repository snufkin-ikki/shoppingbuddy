"use client";

import { useRef, useState, type RefObject } from "react";

const copy = {
  ja: { play: "再生", pause: "一時停止", unavailable: "再生できませんでした。もう一度お試しください。" },
  en: { play: "Play", pause: "Pause", unavailable: "Could not play the video. Please try again." },
  zh: { play: "播放", pause: "暂停", unavailable: "无法播放，请重试。" },
};

export default function PictogramVideo({
  videoRef, src, poster, label, descriptionId, language = "ja", width = 1080, height = 1920,
}: {
  videoRef?: RefObject<HTMLVideoElement | null>;
  src: string;
  poster: string;
  label: string;
  descriptionId: string;
  language?: keyof typeof copy;
  width?: number;
  height?: number;
}) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const ref = videoRef ?? localVideoRef;
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const labels = copy[language];

  function togglePlayback() {
    const video = ref.current;
    if (!video) return;
    if (!video.paused && !video.ended) {
      video.pause();
      return;
    }
    setFailed(false);
    if (video.error) video.load();
    void video.play().catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === "AbortError")) setFailed(true);
    });
  }

  return <div className="pictogram-video">
    <div className="pictogram-video-frame">
      <video ref={ref} src={src} poster={poster} playsInline preload="metadata"
        width={width} height={height} aria-label={label} aria-describedby={descriptionId}
        onError={() => { setPlaying(false); setFailed(true); }}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
      />
      <button type="button" className="pictogram-video-toggle"
        aria-label={playing ? labels.pause : labels.play} onClick={togglePlayback}>
        <span className={playing ? "pictogram-pause-icon" : "pictogram-play-icon"} aria-hidden="true" />
      </button>
    </div>
    {failed && <p role="status">{labels.unavailable}</p>}
  </div>;
}
