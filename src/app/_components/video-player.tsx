import {
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Image as ChakraImage,
  Flex,
  Text,
  Icon,
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
import { IconButton } from "./icon-button";

interface VideoPlayerProps {
  videoUrl: string;
}

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedHours = hours < 10 ? `0${hours}` : hours;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const formattedSeconds =
    remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

  return hours > 0
    ? `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
    : `${formattedMinutes}:${formattedSeconds}`;
};

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
  const [showVolume, setShowVolume] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(0);
  const [mouseMoving, setMouseMoving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");
  const [previewTime, setPreviewTime] = useState(0);
  const [previewX, setPreviewX] = useState(0);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>("");

  const containerWidth = 200;
  const windowWidth = window ? window.innerWidth : 0;

  const adjustedPreviewX = Math.min(
    Math.max(previewX, containerWidth / 2),
    windowWidth - containerWidth / 2
  );

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

  const handleVolumeChange = useCallback((value: number) => {
    if (videoRef.current) {
      const currentVolume = value;
      videoRef.current.volume = currentVolume;
      setCurrentVolume(currentVolume);
    }
  }, []);

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

      if (event.code === "ArrowRight") {
        handleSkip(10);
      }

      if (event.code === "ArrowLeft") {
        handleSkip(-10);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [togglePlay, handleSkip]);

  useEffect(() => {
    fetch(videoUrl, {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        range: "bytes=0-",
        "sec-ch-ua":
          '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "video",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        Referer: "http://localhost:3000/",
      },
      body: null,
      method: "GET",
    })
      .then((res) => res.blob())
      .then((blob) => {
        const videoUrl = URL.createObjectURL(blob);
        setVideoSrc(videoUrl);
      })
      .catch(console.warn)
      .finally(() => {
        setPageLoaded(true);
      });
  }, [videoUrl]);

  useEffect(() => {
    return () => {
      console.log("desfeito");
    };
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
        <Flex
          align="center"
          bg="rgba(0, 0, 0, 0.5)"
          position="absolute"
          left={`${adjustedPreviewX}px`}
          bottom={28}
          flexDir="column"
          gap={1}
          transform="translateX(-40%)"
          minW="200px"
          minH="120px"
        >
          <ChakraImage
            src={previewSrc}
            alt="preview"
            width="200px"
            height="120px"
          />
          <Text color="white">{formatTime(previewTime)}</Text>
        </Flex>
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
        onContextMenu={(e) => e.preventDefault()}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <Box
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        px={6}
        py={4}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        transition="opacity 0.3s"
        bg="rgba(0, 0, 0, 0.5)"
        opacity={showControls ? 1 : 0}
        zIndex="1"
      >
        <Flex gap={2} flexDir="column" w="100%">
          <Flex gap={4} align="center">
            <Slider
              focusThumbOnChange={false}
              value={currentTime}
              max={duration}
              step={0.1}
              onChange={(val) => handleSliderChange(val)}
              onMouseDown={handleSliderMouseDown}
              onMouseUp={handleSliderMouseUp}
              onMouseMove={handleOnMouseMoveTimeline}
              onMouseLeave={handleOnMouseLeaveTimeline}
              flexGrow={1}
              h={4}
            >
              <SliderTrack>
                <SliderFilledTrack bg="#fff" />
              </SliderTrack>
            </Slider>
            <Text>{formatTime(duration - currentTime)}</Text>
          </Flex>
          <Flex justify="space-between" w="100%">
            <Flex>
              <IconButton
                aria-label="Skip back"
                Icon={IoPlaySkipBack}
                onClick={() => handleSkip(-10)}
                bg="transparent"
                _hover={{ bg: "transparent" }}
              />
              <IconButton
                aria-label="Play/Pause"
                Icon={playing ? IoPause : IoPlay}
                onClick={togglePlay}
                bg="transparent"
                _hover={{ bg: "transparent" }}
              />
              <IconButton
                aria-label="Skip forward"
                Icon={IoPlaySkipForward}
                onClick={() => handleSkip(10)}
                bg="transparent"
                _hover={{ bg: "transparent" }}
              />
              <Flex
                onMouseMove={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
                gap={2}
              >
                <IconButton
                  aria-label="Mute/Unmute"
                  Icon={muted ? IoVolumeMute : IoVolumeHigh}
                  onClick={toggleMute}
                  bg="transparent"
                  _hover={{ bg: "transparent" }}
                />
                {showVolume && (
                  <Slider
                    focusThumbOnChange={false}
                    ml={2}
                    w={86}
                    min={0}
                    max={1}
                    step={0.01}
                    onChange={handleVolumeChange}
                    value={currentVolume}
                    transition="opacity 2s"
                    opacity={showVolume ? 1 : 0}
                  >
                    <SliderTrack>
                      <SliderFilledTrack bg="#fff" />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                )}
              </Flex>
            </Flex>
            <IconButton
              aria-label="Full screen"
              Icon={isFullScreen ? IoContract : IoExpand}
              onClick={handleFullScreenToggle}
              bg="transparent"
              _hover={{ bg: "transparent" }}
            />
          </Flex>
        </Flex>
      </Box>
      <canvas ref={canvasRef} style={{ visibility: "hidden" }} />
      <video
        ref={hiddenVideoRef}
        width="640"
        height="360"
        style={{ display: "none" }}
        crossOrigin="anonymous"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </Box>
  );
};
