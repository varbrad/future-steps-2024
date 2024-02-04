import { trpc } from '@/server/trpc/client';
import type { AppType } from 'next/app';

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default trpc.withTRPC(MyApp);