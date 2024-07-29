import {
  Box,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useColorModeValue,
  Image as ChakraImage,
} from "@chakra-ui/react";
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
import { useRef, useState, useEffect, useCallback } from "react";

interface VideoPlayerProps {
  videoUrl: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [mouseMoving, setMouseMoving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const [previewTime, setPreviewTime] = useState(0);
  const [previewX, setPreviewX] = useState(0);
  const [pageLoaded, setPageLoaded] = useState(false);

  const handleOnMouseMoveTimeline = useCallback(
    (event: React.MouseEvent<HTMLInputElement>) => {
      const slider = event.target as HTMLInputElement;
      const rect = slider.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const previewTime = (offsetX / slider.offsetWidth) * duration;
      setPreviewTime(previewTime);
      setPreviewX(offsetX);
      captureFrame(previewTime);
    },
    [duration]
  );

  const handleOnMouseLeaveTimeline = () => {
    setPreviewTime(0);
  };

  const captureFrame = (time: number) => {
    if (hiddenVideoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");

      hiddenVideoRef.current.currentTime = time;

      if (context) {
        context.drawImage(
          hiddenVideoRef.current,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );

        const dataURL = canvasRef.current.toDataURL("image/png");
        setPreviewSrc(dataURL);
      }
    }
  };

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

  const handleSliderChange = useCallback((value: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      setCurrentTime(value);
    }
  }, []);

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

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  if (!pageLoaded) {
    return null;
  }

  return (
    <Box
      ref={containerRef}
      position="relative"
      width="100vw"
      height="100vh"
      onMouseMove={handleMouseMove}
      bg="black"
      overflow="hidden"
    >
      {!!previewTime && (
        <ChakraImage
          src={previewSrc}
          alt="preview"
          position="absolute"
          bottom="24"
          left={`${previewX}px`}
          width="200px"
          height="120px"
        />
      )}
      <video
        ref={videoRef}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        controls={false}
        disablePictureInPicture
        controlsList="nodownload noremoteplayback nofullscreen"
        onClick={handleClickTogglePlay}
        onDoubleClick={handleDoubleClickToggleScreen}
        crossOrigin="anonymous"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        p="4"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        transition="opacity 0.3s"
        bg="rgba(0, 0, 0, 0.5)"
        opacity={showControls ? 1 : 0}
        zIndex="1"
      >
        <IconButton
          aria-label="Skip back"
          icon={<IoPlaySkipBack />}
          onClick={() => handleSkip(-10)}
          bg="transparent"
          _hover={{ bg: "transparent" }}
        />
        <IconButton
          aria-label="Play/Pause"
          icon={playing ? <IoPause /> : <IoPlay />}
          onClick={togglePlay}
          bg="transparent"
          _hover={{ bg: "transparent" }}
        />
        <IconButton
          aria-label="Skip forward"
          icon={<IoPlaySkipForward />}
          onClick={() => handleSkip(10)}
          bg="transparent"
          _hover={{ bg: "transparent" }}
        />
        <IconButton
          aria-label="Mute/Unmute"
          icon={muted ? <IoVolumeMute /> : <IoVolumeHigh />}
          onClick={toggleMute}
          bg="transparent"
          _hover={{ bg: "transparent" }}
        />
        <Slider
          focusThumbOnChange={false}
          value={currentTime}
          max={duration}
          step={0.1}
          onChange={(val) => handleSliderChange(val)}
          onMouseDown={handleSliderMouseDown}
          onMouseUp={handleSliderMouseUp}
          flexGrow={1}
          mx="4"
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
        <IconButton
          aria-label="Full screen"
          icon={isFullScreen ? <IoContract /> : <IoExpand />}
          onClick={handleFullScreenToggle}
          bg="transparent"
          _hover={{ bg: "transparent" }}
        />
      </Box>
      <canvas ref={canvasRef} style={{ visibility: "hidden" }} />
      <video
        ref={hiddenVideoRef}
        width="640"
        height="360"
        style={{ display: "none" }}
        crossOrigin="anonymous"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
    </Box>
  );
};
