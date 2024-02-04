import { trpc } from '@/server/trpc/client';
import type { AppType } from 'next/app';
import { Noto_Sans } from 'next/font/google';

import "@/styles/globals.css";

const notoSans = Noto_Sans({ subsets: ['latin'] });

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className={notoSans.className}>
      <Component {...pageProps} />
    </div>
  )
};

export default trpc.withTRPC(MyApp);