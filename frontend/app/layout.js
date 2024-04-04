import Layout from "@/components/Layout";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import RainbowKitProviderImport from "./RainbowKitProviderImport";
import { OwnerContextProvider } from "@/context/owner";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

// These styles apply to every route in the application
import "./globals.css";

export const metadata = {
  title: "Bloc Veritas App",
  description: "Your reviews to the Blockchain",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RainbowKitProviderImport>
          <AppRouterCacheProvider>
            <OwnerContextProvider>
              <Layout>{children}</Layout>
            </OwnerContextProvider>
          </AppRouterCacheProvider>
        </RainbowKitProviderImport>
      </body>
    </html>
  );
}
