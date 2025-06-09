import React, { useState } from "react";
import WalletConnector from "./buttons/wallet-connector";
import Image from "next/image";

const Nav = () => {
  const [showTrafficAlert, setShowTrafficAlert] = useState(true);

  return (
    <>
      {showTrafficAlert && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#1e2024] border-b border-[#2e2f34] md:p-3 p-1">
          <div className="max-w-3xl mx-auto flex items-center justify-center text-center">
            <p className="text-[#ffd698] text-sm">
              High API Volume - We're working with providers to increase capacity. Thank you for your patience!
            </p>
          </div>
        </div>
      )}
      <nav
        className={`fixed w-full z-40 ${showTrafficAlert ? 'top-12' : 'top-0'} px-6 py-4 flex justify-between items-center backdrop-blur-3xl`}
      >
        <a href="/" className="w-fit text-white flex items-center gap-2 group">
          <Image src="/splash.png" alt="Ticker" width={40} height={40} />
          <div className="flex flex-col">
            <div
              style={{
                fontFamily: "var(--font-pacifico)",
                color: "#ffd698",
                fontSize: "1.5rem",
                transition: "all 0.3s ease",
                transform: "scale(1) rotate(0deg)",
              }}
              className="group-hover:[transform:scale(1.1)_rotate(2deg)]"
            >
              Ticker
            </div>
            <div className="hidden md:block text-[#ffd698] whitespace-nowrap md:text-[10px]">Powered by Bungee</div>
          </div>
        </a>
        <div className="flex gap-4 items-center">
          <WalletConnector />
        </div>
      </nav>
    </>
  );
};

export default Nav;
