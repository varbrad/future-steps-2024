import { createTrpcContext } from '@/server/trpc/server/context';
import { trpcRouter } from '@/server/trpc/server/router';
import * as trpcNext from '@trpc/server/adapters/next';

export default trpcNext.createNextApiHandler({
  router: trpcRouter,
  createContext: createTrpcContext,
});