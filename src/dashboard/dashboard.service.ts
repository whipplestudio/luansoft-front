import { Injectable } from "@nestjs/common"
import type { ClientsService } from "../clients/clients.service"
import type { ContadoresService } from "../contadores/contadores.service"
import type { FiscalDeliverablesService } from "../fiscal-deliverables/fiscal-deliverables.service"

@Injectable()
export class DashboardService {
  constructor(
    private clientsService: ClientsService,
    private contadoresService: ContadoresService,
    private fiscalDeliverablesService: FiscalDeliverablesService,
  ) {}

  async getDashboardData() {
    const [
      clientsByStatus,
      contadorPerformance,
      deliverablesByStatus,
      topClients,
      topContadores,
      upcomingDeliverables,
    ] = await Promise.all([
      this.clientsService.getClientsByStatus(),
      this.contadoresService.getContadorPerformance(),
      this.fiscalDeliverablesService.getDeliverablesByStatus(),
      this.clientsService.getTopClients(),
      this.contadoresService.getTopContadores(),
      this.fiscalDeliverablesService.getUpcomingDeliverables(),
    ])

    return {
      clientsByStatus,
      contadorPerformance,
      deliverablesByStatus,
      topClients,
      topContadores,
      upcomingDeliverables,
    }
  }
}

