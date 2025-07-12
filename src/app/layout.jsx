import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ChatProvider } from "../contexts/ChatContext";
import Navigation from "../components/Navigation";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DevShare Lite",
  description: "A developer community forum",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <ChatProvider>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                  <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex-1">
                      <Navigation />
                    </div>
                  </header>
                  <main className="flex flex-1 flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-900">
                    {children}
                  </main>
                  <Footer />
                </SidebarInset>
              </SidebarProvider>
              <ChatWidget />
            </ChatProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
