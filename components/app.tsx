"use client";

import { useEffect, useState } from "react";
import sdk from "@farcaster/frame-sdk";

import WalletConnector from "./buttons/wallet-connector";
import SwapUI from "./swap-interface/swap";

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
    <div className="min-h-screen bg-white">
      <WalletConnector />
      <SwapUI />
    </div>
  );
}
