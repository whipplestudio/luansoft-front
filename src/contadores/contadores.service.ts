import { Injectable } from "@nestjs/common"
import type { PrismaService } from "../prisma/prisma.service"

@Injectable()
export class ContadoresService {
  constructor(private prisma: PrismaService) {}

  async getContadorPerformance() {
    return this.prisma.contador.findMany({
      include: {
        _count: {
          select: { clients: true, fiscalDeliverables: true },
        },
      },
    })
  }

  async getTopContadores(limit = 5) {
    return this.prisma.contador.findMany({
      take: limit,
      orderBy: { clients: { _count: "desc" } },
      include: {
        _count: { select: { clients: true, fiscalDeliverables: true } },
      },
    })
  }
}

