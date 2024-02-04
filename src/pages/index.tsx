import { trpc } from "@/server/trpc/client"
import { twMerge } from 'tailwind-merge'

type Props = {
  name: string
}

const Index = ({ name }: Props) => {
  const sync = trpc.sync.useMutation()
  const teams = trpc.teams.useQuery()
  const users = trpc.users.useQuery()

  return (
    <div className='bg-wise-purple-dark p-4'>
      <div className='bg-white p-4 rounded-md shadow-md text-wise-purple-dark flex flex-col gap-4'>
        {/* <button onClick={() => sync.mutate()}>SYNC</button> */}
        <h1 className='font-black text-2xl'>Wise. Future Steps 2024 Leaderboard</h1>
        <div className='flex flex-col gap-1 p-4 border border-black/10'>
          {users.data?.map((u,ix) => (
            <div key={u.id} className={twMerge('flex flex-row items-center gap-4 p-2', ix % 2 === 0 ? 'bg-black/0' : 'bg-wise-purple/5', ix < 3 ? 'text-xl font-black' : 'text-lg font-normal')}>
              <p className='font-black text-wise-purple-dark w-8 text-right'>{ix+1}.</p>
              <p>{u.firstName} {u.lastName}</p>
              <p className='text-xl ml-auto'>{u.steps.toLocaleString('en-GB')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Index