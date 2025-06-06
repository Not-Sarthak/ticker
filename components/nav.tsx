import React from "react";
import WalletConnector from "./buttons/wallet-connector";
import Image from "next/image";

const Nav = () => {
  return (
    <nav
      className={`fixed w-full z-50 top-0 px-6 py-4 flex justify-between items-center backdrop-blur-3xl`}
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
          <div className="text-[10px] text-[#ffd698]">Powered by Bungee</div>
        </div>
      </a>
      <div className="flex gap-4 items-center">
        <WalletConnector />
      </div>
    </nav>
  );
};

export default Nav;
