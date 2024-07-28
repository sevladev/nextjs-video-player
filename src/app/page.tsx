"use client";

import { NextPage } from "next";
import Head from "next/head";
import { VideoPlayer } from "./_components/video-player";

const Home: NextPage = () => {
  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden">
      <Head>
        <title>Netflix Video Player</title>
        <meta
          name="description"
          content="Netflix-like video player using Next.js and Tailwind CSS"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="w-full h-full">
        <VideoPlayer />
      </main>
    </div>
  );
};

export default Home;
