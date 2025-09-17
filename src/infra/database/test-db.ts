import { PostgreSqlContainer } from "@testcontainers/postgresql"
import { PrismaClient } from "@prisma/client"
import { execSync } from "node:child_process"
import path from "node:path"

export async function startPostgresTestDb() {
  const container = await new PostgreSqlContainer("postgres:16-alpine")
    .withDatabase("adoteja_test_db")
    .withUsername("postgres")
    .withPassword("password")
    .start()
  const url = container.getConnectionUri()
  const schemaPath = path.resolve(process.cwd(), "prisma", "schema.prisma")
  execSync(
    `npx prisma db push --schema "${schemaPath}" --url "${url}" --accept-data-loss --skip-generate`,
    { stdio: "inherit" }
  )
  const prisma = new PrismaClient({ datasources: { db: { url } } })
  return { prisma, container, url }
}
