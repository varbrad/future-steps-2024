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
    <div className='bg-wise-purple-dark p-4 overflow-hidden'>
      <div className='bg-white p-4 rounded-md shadow-md text-wise-purple-dark flex flex-col gap-4'>
        {sync.isPending ? <p className='text-wise-purple-dark'>Syncing...</p> : null}
        <h1 className='font-black text-2xl' onDoubleClick={() => sync.mutateAsync()}>Wise. Future Steps 2024 Leaderboard</h1>
        <h2 className='font-bold text-xl'>Individual.</h2>
        <div className='flex flex-col gap-1 p-4 border border-black/10'>
          {users.data?.map((u,ix) => (
            <div key={u.id} className={twMerge('flex flex-row items-center gap-4 p-2', ix % 2 === 0 ? 'bg-wise-purple/10' : 'bg-wise-purple/5', ix < 3 ? 'text-xl font-bold' : 'text-lg font-normal')}>
              <div className={twMerge('w-1.5 rounded-full self-stretch -mr-2', ix === 0 ? 'bg-yellow-400' : ix === 1 ? 'bg-slate-400' : ix === 2 ? 'bg-amber-600' : 'bg-wise-purple-dark/10')} />
              <p className='font-black text-wise-purple-dark w-8 text-right'>{ix+1}.</p>
              <div className='flex flex-col items-start'>
                <p>{u.firstName} {u.lastName}</p>
                {u.team ? <p className='text-xs px-2 py-0.5 border border-wise-purple-dark/10 bg-white rounded-md font-normal text-wise-purple-dark/75'>{u.team.name}</p> : null}
              </div>
              <p className='text-2xl ml-auto tracking-wide'>{u.steps.toLocaleString('en-GB')}</p>
            </div>
          ))}
        </div>
        <h2 className='font-bold text-xl'>Teams.</h2>
        <div className='flex flex-col gap-1 p-4 border border-black/10'>
          {teams.data?.map((t,ix) => (
            <div key={t.id} className={twMerge('flex flex-row items-center gap-4 p-2', ix % 2 === 0 ? 'bg-wise-purple/10' : 'bg-wise-purple/5', ix < 3 ? 'text-xl font-bold' : 'text-lg font-normal')}>
              <div className={twMerge('w-1.5 rounded-full self-stretch -mr-2', ix === 0 ? 'bg-yellow-400' : ix === 1 ? 'bg-slate-400' : ix === 2 ? 'bg-amber-600' : 'bg-wise-purple-dark/10')} />
              <p className='font-black text-wise-purple-dark w-8 text-right'>{ix+1}.</p>
              <div className="flex flex-col items-start">
                <p>{t.name}</p>
                <div className="flex flex-col lg:flex-row flex-wrap items-start lg:items-center gap-1 lg:gap-2">
                  {t.users.map(u => (
                    <p key={u.id} className='text-xs px-1 py-0.5 sm:px-2 border border-wise-purple-dark/10 bg-white rounded-md font-normal text-wise-purple-dark/75'>{u.firstName} {u.lastName}</p>
                  ))}
                </div>
              </div>
              <p className='text-2xl ml-auto tracking-wide'>{(t.totalSteps ?? 0).toLocaleString('en-GB')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Index