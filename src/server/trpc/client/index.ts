import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import { ssrPrepass } from '@trpc/next/ssrPrepass';
import { TrpcRouter } from '../server/router';

// @ts-ignore
const isClient = () => !!global.window

export const trpc = createTRPCNext<TrpcRouter>({
  ssrPrepass,
  abortOnUnmount: true,
  overrides: {
    useMutation: {
      async onSuccess(opts) {
        await opts.originalFn()
        await opts.queryClient.invalidateQueries()
      }
    }
  },
  config(opts) {
    const url = isClient() ? '/api/trpc' : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/trpc` : 'http://localhost:3000/api/trpc'
    console.log({ url })
    return {
      links: [
        httpBatchLink({
          url,
        }),
      ],
    };
  },
  ssr: true,
});