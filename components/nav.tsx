import React from "react";
import WalletConnector from "./buttons/wallet-connector";

const Nav = () => {
  return (
    <nav
      className={`fixed w-full z-50 top-0 px-6 py-4 flex justify-between items-center backdrop-blur-3xl`}
    >
      <a href="/" className="w-fit text-white">
        Logo
      </a>
      <div className="flex gap-4 items-center">
        <WalletConnector />
      </div>
    </nav>
  );
};

export default Nav;
