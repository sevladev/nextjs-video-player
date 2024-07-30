# Video Streaming Service Frontend

This project is a frontend application built with Next.js that interfaces with a video upload and streaming backend service. The backend service can be found here: [Streaming Service](https://github.com/sevladev/video-service-api).

## Usage

The frontend application provides a video player with features like play/pause, mute/unmute, volume control, fullscreen mode, and video seeking. To use the video player, simply provide a video URL from the backend service.

![Player GIF](./public/player.gif)

## Features

- Stream video files from the backend
- Responsive UI with Chakra UI

## Requirements

- Next.js
- [Streaming Service](https://github.com/sevladev/video-service-api).

## Setup

1. Clone the repository:

```sh
git clone https://github.com/your-repo/video-streaming-frontend.git
cd video-streaming-frontend
```

2. Install dependencies:

```sh
pnpm install
```

3. Set up environment variables. Create a `.env.local` file in the root directory with the following content:

```plaintext
NEXT_PUBLIC_VIDEO_SERVICE_URL=http://localhost:3000
```

4. Start the server:

```sh
pnpm dev
```

The server will run on `http://localhost:3000`.
