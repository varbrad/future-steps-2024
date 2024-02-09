import { CreateNextContextOptions } from "@trpc/server/adapters/next";

const CRON_SECRET = process.env.CRON_SECRET

export const createTrpcContext = async (opts: CreateNextContextOptions) => {
  const { req } = opts

  const isVercelCronJob = Boolean(CRON_SECRET && req.headers.authorization?.split('Bearer ').at(1) === CRON_SECRET)

  return {
    isVercelCronJob,
  }
}

export type TrpcContext = Awaited<ReturnType<typeof createTrpcContext>>