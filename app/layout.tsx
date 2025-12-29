import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { App } from "antd";
import ClientLayout from "./ClientLayout";
import { AuthProvider } from "@/lib/auth";
import NextAuthProvider from "./NextAuthProvider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className}>
        <NextAuthProvider>
          <AuthProvider>
            <App>
              <ClientLayout>{children}</ClientLayout>
            </App>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}

export const metadata = {
  generator: "v0.dev",
};
