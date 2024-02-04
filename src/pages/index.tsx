import { trpc } from "@/server/trpc/client"

type Props = {
  name: string
}

const Index = ({ name }: Props) => {
  const sync = trpc.sync.useMutation()
  const teams = trpc.teams.useQuery()
  const users = trpc.users.useQuery()

  return (
    <div>
      <button onClick={() => sync.mutate()}>SYNC</button>
      <pre>{JSON.stringify(users.data, null, 2)}</pre>
      <pre>{JSON.stringify(teams.data, null, 2)}</pre>
    </div>
  )
}

export default Index