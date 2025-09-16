import { PrismaClient } from "@prisma/client"
import DatabaseConnection from "./database-connection.js"

export class PrismaAdapter implements DatabaseConnection {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  async query<T>(callback: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return callback(this.prisma)
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect()
  }
}
