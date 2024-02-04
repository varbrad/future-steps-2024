import { db } from "@/drizzle"
import { users } from "@/drizzle/schema"
import { trpc } from "@/server/trpc/client"
import { GetServerSideProps } from "next"

type Props = {
  name: string
}

const Index = ({ name }: Props) => {
  const sync = trpc.sync.useMutation()
  const teams = trpc.teams.useQuery()

  return (
    <div>
      <button onClick={() => sync.mutate()}>SYNC</button>
      <pre>{JSON.stringify(teams.data, null, 2)}</pre>
    </div>
  )
}

export default Index