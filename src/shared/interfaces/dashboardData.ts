import { IGasto } from "./gasto";

export interface DashboardData extends ApiResponse {
    gastos: IGasto[];
    abonos: IGasto[];
    resumen: any,
    meses: any,
    agrupados: IGasto[],
}

interface ApiResponse {
    error?: string;
}