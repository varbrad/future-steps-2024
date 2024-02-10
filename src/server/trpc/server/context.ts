import { CreateNextContextOptions } from "@trpc/server/adapters/next";

const CRON_SECRET = process.env.CRON_SECRET

export const createTrpcContext = async (opts: CreateNextContextOptions) => {
  const { req } = opts

  const isVercelCronJob = Boolean(CRON_SECRET && req.headers.authorization?.split('Bearer ').at(1) === CRON_SECRET)
  const XTraceOrigin = req.headers['x-trace-origin'] as string | undefined
  const XTraceID = req.headers['x-trace-id'] as string | undefined

  return {
    isVercelCronJob,
    trace: {
      id: XTraceID,
      origin: XTraceOrigin,
    }
  }
}

export type TrpcContext = Awaited<ReturnType<typeof createTrpcContext>>