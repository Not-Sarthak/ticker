import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { Button } from "./button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

import { trimAddress, copyToClipboard } from "@/lib/utils";

export default function WalletConnector() {
  const { authenticated, ready, login, logout } = usePrivy();
  const { address } = useAccount();
  const [showCheck, setShowCheck] = useState(false);

  const handleCopyAddress = async () => {
    if (address) {
      const success = await copyToClipboard(address);
      if (success) {
        setShowCheck(true);
        setTimeout(() => setShowCheck(false), 1000);
      }
    }
  };

  return (
    <>
      {authenticated && ready ? (
        <div className="flex flex-row gap-2 rounded-full bg-[var(--button-color)]">
          <div 
            onClick={handleCopyAddress}
            className="h-9 text-sm text-[var(--text-color)] flex items-center px-3 cursor-pointer hover:opacity-80 min-w-[100px] justify-center relative"
          >
            <AnimatePresence mode="wait">
              {showCheck ? (
                <motion.div
                  key="check"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-green-500 absolute"
                >
                  <Check className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {trimAddress(address as string)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="w-[1px] my-2 border-l border-dotted border-[var(--text-color)] opacity-50" />
          <Button onClick={logout} className="cursor-pointer rounded-full">
            Logout
          </Button>
        </div>
      ) : (
        <Button onClick={login} className="cursor-pointer font-semibold rounded-full py-2">
          Connect Wallet
        </Button>
      )}
    </>
  );
}
