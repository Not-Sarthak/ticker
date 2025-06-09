"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";

import SwapUI from "./swap-interface/swap";
import Preview from "./background/background";
import Nav from "./nav";

export default function App() {

  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [farcasterUserContext, setFarcasterUserContext] = useState<any>();

  useEffect(() => {
    const load = async () => {
      setFarcasterUserContext(await sdk.context);
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  return (
    <div className="min-h-screen bg-[var(--background)] relative">
      <div className="fixed inset-0 z-0">
        <Preview />
      </div>

      <Nav />
      <div className="pt-32">
        <SwapUI />
      </div>
    </div>
  );
}