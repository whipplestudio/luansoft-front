import { Injectable } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"

@Injectable()
export class FiscalDeliverablesService {
  constructor(private prisma: PrismaService) {}

  async getDeliverablesByStatus() {
    const [pending, inProgress, completed, delayed] = await Promise.all([
      this.prisma.fiscalDeliverable.count({ where: { status: "PENDING" } }),
      this.prisma.fiscalDeliverable.count({ where: { status: "IN_PROGRESS" } }),
      this.prisma.fiscalDeliverable.count({ where: { status: "COMPLETED" } }),
      this.prisma.fiscalDeliverable.count({ where: { status: "DELAYED" } }),
    ])

    return { pending, inProgress, completed, delayed }
  }

  async getUpcomingDeliverables(days = 7) {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    return this.prisma.fiscalDeliverable.findMany({
      where: {
        dueDate: {
          lte: futureDate,
        },
        status: {
          not: "COMPLETED",
        },
      },
      include: {
        client: true,
        contador: true,
      },
      orderBy: {
        dueDate: "asc",
      },
    })
  }
}

