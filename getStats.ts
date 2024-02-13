import { db } from "@/drizzle";
import { teams } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

const fn = async () => {
  const start = performance.now();
  const d = await db.query.stepHistory.findMany({
    with: {
      user: {
        with: {
          team: true,
        }
      }
    }
  })
  const end = performance.now()

  console.log(`Query took ${end - start}ms`);
}

fn()
