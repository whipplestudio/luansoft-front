import { Injectable } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async getClientsByStatus() {
    const [active, inactive] = await Promise.all([
      this.prisma.client.count({ where: { status: "ACTIVE" } }),
      this.prisma.client.count({ where: { status: "INACTIVE" } }),
    ])

    return { active, inactive }
  }

  async getTopClients(limit = 5) {
    return this.prisma.client.findMany({
      take: limit,
      orderBy: { fiscalDeliverables: { _count: "desc" } },
      include: { fiscalDeliverables: { select: { id: true } } },
    })
  }
}

