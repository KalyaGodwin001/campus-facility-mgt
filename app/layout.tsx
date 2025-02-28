import type { Metadata } from "next";
import { Montserrat } from 'next/font/google';
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/footer";


const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: "Kabu Campus Facility MGT system",
  description: "manage bookings and rooms SBE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={montserrat.className}
      >
        {/* <Navbar logo={heroProps.logo} navigation={heroProps.navigation} /> */}
        {children}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
