import { PrismaClient } from "@prisma/client"

export default interface DatabaseConnection {
  query<T>(callback: (prisma: PrismaClient) => Promise<T>): Promise<T>
  close(): Promise<void>
}
