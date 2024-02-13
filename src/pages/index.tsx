import { trpc } from "@/server/trpc/client"
import dayjs from "dayjs"
import Head from "next/head"
import { twMerge } from 'tailwind-merge'

const Index = () => {
  const sync = trpc.sync.now.useMutation()
  const teams = trpc.teams.useQuery()
  const users = trpc.users.useQuery()
  const dailySteps = trpc.dailySteps.useQuery()

  return (
    <div className='bg-wise-purple-dark p-4 overflow-hidden flex flex-col gap-4'>
      <Head>
        <title>Wise Future Steps 2024</title>
      </Head>
      <div className='bg-white p-4 rounded-md shadow-md text-wise-purple-dark flex flex-col gap-4'>
        {sync.isPending ? <p className='text-wise-purple-dark'>Syncing...</p> : null}
        <h1 className='font-black text-2xl' onDoubleClick={() => sync.mutateAsync()}>Wise. Future Steps 2024 Leaderboard</h1>
        <h2 className='font-bold text-xl'>Individual.</h2>
        <div className='flex flex-col gap-1 p-4 border border-black/10'>
          {users.isLoading ? <p>Loading...</p> : null}
          {users.data?.map((u,ix) => {
            return (
              <div key={u.id} className={twMerge('flex flex-row items-center gap-4 p-2', ix % 2 === 0 ? 'bg-wise-purple/10' : 'bg-wise-purple/5', ix < 3 ? 'text-xl font-bold' : 'text-lg font-normal')}>
                <div className={twMerge('w-1.5 rounded-full self-stretch -mr-2', ix === 0 ? 'bg-yellow-400' : ix === 1 ? 'bg-slate-400' : ix === 2 ? 'bg-amber-600' : 'bg-wise-purple-dark/10')} />
                <p className='font-black text-wise-purple-dark w-8 text-right'>{ix+1}.</p>
                <div className='flex flex-col items-start'>
                  <p>{u.firstName} {u.lastName}</p>
                  {u.team ? <p className='text-xs px-2 py-0.5 border border-wise-purple-dark/10 bg-white rounded-md font-normal text-wise-purple-dark/75'>{u.team.name}</p> : null}
                </div>
                <p className='text-2xl ml-auto tracking-wide'>{u.steps.toLocaleString('en-GB')}</p>
              </div>
            )
          })}
        </div>
        </div>
      <div className='bg-white p-4 rounded-md shadow-md text-wise-purple-dark flex flex-col gap-4'>
        <h2 className='font-bold text-xl'>Teams.</h2>
        <div className='flex flex-col gap-1 p-4 border border-black/10'>
          {teams.isLoading ? <p>Loading...</p> : null}
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
      <div className='bg-white p-4 rounded-md shadow-md text-wise-purple-dark flex flex-col gap-4'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          <div>
            <h2 className='font-bold text-xl mb-4'>Most Daily Steps.</h2>
            <div className='flex flex-col gap-1 p-4 border border-black/10'>
              {dailySteps.isLoading ? <p>Loading...</p> : null}
              {dailySteps.data?.allTime.map((ds,ix) => (
                <div key={`${ds.day}-${ds.user.id}`} className={twMerge('flex flex-row items-center gap-4 p-2', ix % 2 === 0 ? 'bg-wise-purple/10' : 'bg-wise-purple/5', ix < 3 ? 'text-xl font-bold' : 'text-lg font-normal')}>
                <div className={twMerge('w-1.5 rounded-full self-stretch -mr-2', ix === 0 ? 'bg-yellow-400' : ix === 1 ? 'bg-slate-400' : ix === 2 ? 'bg-amber-600' : 'bg-wise-purple-dark/10')} />
                <p className='font-black text-wise-purple-dark w-8 text-right'>{ix+1}.</p>
                <div className='flex flex-col items-start'>
                  <p className='flex flex-row items-center gap-2'>{ds.user.firstName} {ds.user.lastName} <span className='font-light text-sm'>{dayjs(ds.day).format('Do MMM')}</span></p>
                  {ds.user.team ? <p className='text-xs px-2 py-0.5 border border-wise-purple-dark/10 bg-white rounded-md font-normal text-wise-purple-dark/75'>{ds.user.team.name}</p> : null}
                </div>
                <p className='text-2xl ml-auto tracking-wide'>{ds.steps.toLocaleString('en-GB')}</p>
              </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className='font-bold text-xl mb-4'>Daily Step Leaders.</h2>
            <div className='flex flex-col gap-1 p-4 border border-black/10'>
              {dailySteps.isLoading ? <p>Loading...</p> : null}
              {dailySteps.data?.perDay.map((day, ix) => (
                <div key={`${day.day}-${day.user.id}`} className={twMerge('flex flex-row items-center gap-4 p-2 text-lg font-normal', ix % 2 === 0 ? 'bg-wise-purple/10' : 'bg-wise-purple/5')}>
                <div className={twMerge('w-1.5 rounded-full self-stretch -mr-2 bg-wise-purple-dark/10')} />
                <p className='font-black text-wise-purple-dark w-20 text-right text-sm flex-shrink-0'>{dayjs(day.day).format('Do MMM')}.</p>
                <div className='flex flex-col items-start'>
                  <p className='flex flex-row items-center gap-2'>{day.user.firstName} {day.user.lastName}</p>
                  {day.user.team ? <p className='text-xs px-2 py-0.5 border border-wise-purple-dark/10 bg-white rounded-md font-normal text-wise-purple-dark/75'>{day.user.team.name}</p> : null}
                </div>
                <p className='text-2xl ml-auto tracking-wide'>{day.steps.toLocaleString('en-GB')}</p>
              </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Index