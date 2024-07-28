"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  IoPlay,
  IoPause,
  IoVolumeHigh,
  IoVolumeMute,
  IoExpand,
  IoContract,
  IoPlaySkipBack,
  IoPlaySkipForward,
} from "react-icons/io5";

export const VideoPlayer = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [mouseMoving, setMouseMoving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  }, [playing]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  }, [muted]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && !isDragging) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, [isDragging]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleSliderChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (videoRef.current) {
        const newTime = Number(event.target.value);
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    },
    []
  );

  const handleSliderMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleSliderMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFullScreenToggle = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullScreen(true);
      setShowControls(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  }, []);

  const handleSkip = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += time;
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleMouseMove = useCallback(() => {
    setMouseMoving(true);
    setShowControls(true);
  }, []);

  const handleClickTogglePlay = useCallback(() => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      return;
    }

    setClickTimeout(
      setTimeout(() => {
        togglePlay();
        setClickTimeout(null);
      }, 200)
    );
  }, [clickTimeout, togglePlay]);

  const handleDoubleClickToggleScreen = useCallback(() => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
    }

    handleFullScreenToggle();
  }, [clickTimeout, handleFullScreenToggle]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mouseMoving) {
        setShowControls(false);
      }
      setMouseMoving(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [mouseMoving]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
      setShowControls(true);
      if (document.fullscreenElement) {
        containerRef.current?.classList.add("fullscreen");
      } else {
        containerRef.current?.classList.remove("fullscreen");
      }
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  useEffect(() => {
    const updateCurrentTime = () => {
      if (videoRef.current && !isDragging) {
        setCurrentTime(videoRef.current.currentTime);
      }
      requestAnimationFrame(updateCurrentTime);
    };
    updateCurrentTime();
  }, [isDragging]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        togglePlay();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [togglePlay]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onMouseMove={handleMouseMove}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        controls={false}
        disablePictureInPicture
        controlsList="nodownload noremoteplayback nofullscreen"
        onClick={handleClickTogglePlay}
        onDoubleClick={handleDoubleClickToggleScreen}
      >
        <source
          src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
      <div
        className={`controls absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between transition-opacity duration-300 bg-black bg-opacity-75 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <button onClick={() => handleSkip(-10)} className="text-white">
          <IoPlaySkipBack size={24} />
        </button>
        <button onClick={togglePlay} className="text-white">
          {playing ? <IoPause size={24} /> : <IoPlay size={24} />}
        </button>
        <button onClick={() => handleSkip(10)} className="text-white">
          <IoPlaySkipForward size={24} />
        </button>
        <button onClick={toggleMute} className="text-white">
          {muted ? <IoVolumeMute size={24} /> : <IoVolumeHigh size={24} />}
        </button>
        <input
          type="range"
          className="flex-grow mx-4"
          value={currentTime}
          max={duration}
          step="0.1"
          onChange={handleSliderChange}
          onMouseDown={handleSliderMouseDown}
          onMouseUp={handleSliderMouseUp}
        />
        <button onClick={handleFullScreenToggle} className="text-white">
          {isFullScreen ? <IoContract size={24} /> : <IoExpand size={24} />}
        </button>
      </div>
    </div>
  );
};
