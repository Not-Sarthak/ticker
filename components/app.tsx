"use client";

import SwapUI from "./swap-interface/swap";
import Preview from "./background/background";
import Nav from "./nav";

export default function App() {

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
