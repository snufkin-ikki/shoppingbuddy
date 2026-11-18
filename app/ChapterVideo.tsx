"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

type Chapter = readonly [seconds: number, label: string];
type Controls = { play: string; pause: string; choose: string; unavailable: string };

export default function ChapterVideo({
  videoRef, src, poster, label, descriptionId, chapters, controls,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  src: string;
  poster: string;
  label: string;
  descriptionId: string;
  chapters: readonly Chapter[];
  controls: Controls;
}) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [preparingChapter, setPreparingChapter] = useState(false);
  const requestedTime = useRef<number | null>(null);
  const download = useRef<AbortController | null>(null);
  const objectUrl = useRef<string | null>(null);

  useEffect(() => () => {
    download.current?.abort();
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
  }, []);

  function applyChapter() {
    const video = videoRef.current;
    if (!video || requestedTime.current === null) return;
    video.currentTime = requestedTime.current;
    requestedTime.current = null;
    setPreparingChapter(false);
  }

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) {
      video.pause();
      return;
    }
    setFailed(false);
    void video.play().catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === "AbortError")) setFailed(true);
    });
  }

  async function showChapter(value: string) {
    const video = videoRef.current;
    if (!video || !value) return;
    video.pause();
    setFailed(false);
    const time = Number(value);
    requestedTime.current = time;
    if (Array.from({ length: video.seekable.length }, (_, i) => i)
      .some(i => video.seekable.start(i) <= time && time <= video.seekable.end(i))) {
      applyChapter();
      return;
    }
    if (download.current || objectUrl.current) return;

    // Some static hosts serve the MP4 without byte ranges, so load these
    // short clips in full when a viewer needs to jump to a later scene.
    setPreparingChapter(true);
    const controller = new AbortController();
    download.current = controller;
    try {
      const response = await fetch(src, { signal: controller.signal });
      if (!response.ok) throw new Error("Video download failed");
      const file = await response.blob();
      if (controller.signal.aborted) return;
      objectUrl.current = URL.createObjectURL(file);
      video.src = objectUrl.current;
      video.load();
    } catch {
      if (controller.signal.aborted) return;
      requestedTime.current = null;
      setPreparingChapter(false);
      setFailed(true);
    } finally {
      if (download.current === controller) download.current = null;
    }
  }

  return <div className="chapter-video">
    <div className="chapter-video-controls">
      <button type="button" disabled={preparingChapter} onClick={togglePlayback}>{playing ? controls.pause : controls.play}</button>
      <select aria-label={controls.choose} value="" onChange={event => { void showChapter(event.target.value); }}>
        <option value="" disabled>{controls.choose}</option>
        {chapters.map(([seconds, title]) => <option key={seconds} value={seconds}>{title}</option>)}
      </select>
    </div>
    {failed && <p role="status">{controls.unavailable}</p>}
    <video ref={videoRef} src={src} poster={poster}
      controls playsInline preload="metadata" width={1080} height={1920}
      aria-label={label} aria-describedby={descriptionId}
      onLoadedMetadata={() => { if (objectUrl.current) applyChapter(); }}
      onError={() => { setPreparingChapter(false); setFailed(true); }}
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
    />
  </div>;
}
