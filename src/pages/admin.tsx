import { trpc } from "@/server/trpc/client"
import dayjs from "dayjs"
import Head from "next/head"
import { twMerge } from 'tailwind-merge'

const Admin = () => {
  const sync = trpc.sync.now.useMutation()
  const syncUsernames = trpc.sync.usernames.useMutation()

  const actions = [
    { name: 'sync.now', action: sync },
    { name: 'sync.usernames', action: syncUsernames },
  ]

  return (
    <div className='bg-wise-purple-dark p-4 overflow-hidden flex flex-col gap-4'>
      <Head>
        <title>Wise Future Steps 2024 - Admin</title>
      </Head>
      <div className='bg-white p-4 rounded-md shadow-md text-wise-purple-dark flex flex-col gap-4'>
        {actions.map(({ name, action }) => {
          return <div key={name} className='flex flex-row gap-4 items-center'>
            <p className='mr-auto'>{name}</p>
            <button onClick={() => action.mutateAsync()}>Run</button>
            <p>{action.status}</p>
          </div>
        })}
      </div>
    </div>
  )
}

export default Admin