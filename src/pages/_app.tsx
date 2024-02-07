import { trpc } from '@/server/trpc/client';
import type { AppType } from 'next/app';
import { Noto_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

import "@/styles/globals.css";

const notoSans = Noto_Sans({ subsets: ['latin'] });

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className={`w-full overflow-hidden ${notoSans.className}`}>
      <Component {...pageProps} />
      <Analytics />
      <SpeedInsights />
    </div>
  )
};

export default trpc.withTRPC(MyApp);