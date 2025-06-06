import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { Button } from "./button";

import { trimAddress } from "@/lib/utils";

export default function WalletConnector() {
  const { authenticated, ready, login, logout } = usePrivy();
  const { address } = useAccount();
  return (
    <>
      {authenticated && ready ? (
        <div className="flex flex-row gap-2">
          <div className="h-9 text-sm">
            {trimAddress(address as string)}
          </div>
          <Button onClick={logout} className="cursor-pointer">
            Logout
          </Button>
        </div>
      ) : (
        <Button onClick={login} className="cursor-pointer">
          Connect Wallet
        </Button>
      )}
    </>
  );
}
