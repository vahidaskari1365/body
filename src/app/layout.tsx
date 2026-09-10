import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

/* فونت variable تک‌فایلی (wght 100-900) به‌جای ۶ فایل وزن جدا — دانلود کمتر، رندر سریع‌تر */
const vazir = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "فیت‌کوچ | پلتفرم مدیریت مربیان و ورزشکاران",
  description:
    "پلتفرم آنلاین مدیریت ارتباط مربیان ورزشی و ورزشکاران — برنامه تمرینی، تقویم، تحلیل عملکرد، پیام‌رسانی و مدیریت مالی",
  keywords: ["مربی ورزشی", "برنامه تمرینی", "ورزشکار", "فیتنس", "مدربوک", "coach", "workout"],
  authors: [{ name: "FitCoach" }],
  icons: { icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg" },
  openGraph: {
    title: "فیت‌کوچ | پلتفرم مدیریت مربیان و ورزشکاران",
    description: "مدیریت کامل فرآیند کاری مربیان با ورزشکاران در یک سیستم یکپارچه",
    siteName: "FitCoach",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${vazir.variable} font-vazir antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
