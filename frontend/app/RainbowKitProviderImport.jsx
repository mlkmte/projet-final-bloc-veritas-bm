"use client";
import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { hardhat } from "wagmi/chains";
import { sepolia } from '@/utils/sepolia' //sepolia
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const WALLET_CONNECT_ID = process.env.WALLET_CONNECT_ID || "";
console.log(WALLET_CONNECT_ID)
const config = getDefaultConfig({
  appName: "Bloc Veritas",
  projectId: WALLET_CONNECT_ID,
  // chains: [hardhat],
  chains: [sepolia], //sepolia
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

const RainbowKitProviderImport = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default RainbowKitProviderImport;