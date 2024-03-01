import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import { TrpcRouter } from '../server/router';

// @ts-ignore
const isClient = () => !!global.window

export const trpc = createTRPCNext<TrpcRouter>({
  abortOnUnmount: true,
  overrides: {
    useMutation: {
      async onSuccess(opts) {
        await opts.originalFn()
        await opts.queryClient.invalidateQueries()
      }
    }
  },
  config({ ctx }) {
    const url = isClient() ? '/api/trpc' : process.env.BASE_URL ? `${process.env.BASE_URL}/api/trpc` : 'http://localhost:3000/api/trpc'
    return {
      links: [
        httpBatchLink({
          url,
          headers() {
            if (!ctx?.req?.headers) return {}
            const { connection, ...headers } = ctx.req.headers
            return { ...headers, 'x-trpc-origin': 'server' }
          },
        }),
      ],
    };
  },
  ssr: false,
});