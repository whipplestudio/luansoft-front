import { Controller, Get, Query } from "@nestjs/common"
import type { DashboardService } from "./dashboard.service"
import type { ClientsService } from "../clients/clients.service"
import type { ContadoresService } from "../contadores/contadores.service"
import type { FiscalDeliverablesService } from "../fiscal-deliverables/fiscal-deliverables.service"

@Controller("dashboard")
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly clientsService: ClientsService,
    private readonly contadoresService: ContadoresService,
    private readonly fiscalDeliverablesService: FiscalDeliverablesService,
  ) {}

  @Get()
  async getDashboardData() {
    return this.dashboardService.getDashboardData()
  }

  @Get("clients")
  async getClientsByStatus() {
    return this.clientsService.getClientsByStatus()
  }

  @Get('top-clients')
  async getTopClients(@Query('limit') limit: string) {
    const limitNumber = limit ? Number.parseInt(limit, 10) : 5;
    return this.clientsService.getTopClients(limitNumber);
  }

  @Get("contadores")
  async getContadorPerformance() {
    return this.contadoresService.getContadorPerformance()
  }

  @Get('top-contadores')
  async getTopContadores(@Query('limit') limit: string) {
    const limitNumber = limit ? Number.parseInt(limit, 10) : 5;
    return this.contadoresService.getTopContadores(limitNumber);
  }

  @Get("deliverables")
  async getDeliverablesByStatus() {
    return this.fiscalDeliverablesService.getDeliverablesByStatus()
  }

  @Get('upcoming-deliverables')
  async getUpcomingDeliverables(@Query('days') days: string) {
    const daysNumber = days ? Number.parseInt(days, 10) : 7;
    return this.fiscalDeliverablesService.getUpcomingDeliverables(daysNumber);
  }
}

