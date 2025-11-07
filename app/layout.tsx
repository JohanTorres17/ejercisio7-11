"use client"; // Necesario para usar hooks y Supabase
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
export default function RootLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {user && (
          <nav className="bg-gray-100 p-4 flex gap-4 justify-center">
            <Link href="/mvp" className="text-blue-600 font-semibold hover:underline">
              MVP
            </Link>
            <Link href="/user" className="text-blue-600 font-semibold hover:underline">
              Usuario
            </Link>
          </nav>
        )}
        <main>{children}</main>
      </body>
    </html>
  );
}