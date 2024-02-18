import { trpc } from "@/server/trpc/client"
import dayjs from "dayjs"
import { uniq } from "lodash"
import Head from "next/head"
import { twMerge } from 'tailwind-merge'

const Admin = () => {
  const actionHistories = trpc.actionHistories.useQuery()
  const sync = trpc.sync.now.useMutation()
  const syncUsernames = trpc.sync.usernames.useMutation()
  const syncDonations = trpc.sync.donations.useMutation()

  const actionMap: Record<string, undefined | Pick<typeof sync, 'status' | 'mutateAsync'>> = {
    'sync.now': sync,
    'sync.usernames': syncUsernames,
    'sync.donations': syncDonations,
  }

  const allKeys = uniq([...Object.keys(actionMap), ...(actionHistories.data?.map((action) => action.id) ?? [])])

  const allActions = allKeys.map((action) => {
    const be = actionHistories.data?.find((a) => a.id === action)
    const mutation = actionMap[action]
    return {
      name: action,
      lastRun: be ? dayjs(be.lastRun) : null,
      status: mutation?.status,
      mutateAsync: mutation?.mutateAsync,
    }
  })

  return (
    <div className='bg-wise-purple-dark p-4 overflow-hidden flex flex-col gap-4'>
      <Head>
        <title>Wise Future Steps 2024 - Admin</title>
      </Head>
      <div className='bg-white p-4 rounded-md shadow-md text-wise-purple-dark flex flex-col gap-4'>
        {allActions?.map(({ name, lastRun, mutateAsync, status }) => {
          return <div key={name} className='grid grid-cols-4 gap-4'>
            <p>{name}</p>
            <p className='font-bold text-xs'>Last run: {lastRun ? lastRun.format('DD/MM/YYYY HH:mm') : '-'}</p>
            {mutateAsync ? <button onClick={() => mutateAsync()}>Run</button> : <div />}
            <p>{status ?? '-'}</p>
          </div>
        })}
      </div>
    </div>
  )
}

export default Admin