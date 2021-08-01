import { ListaGastosFilters } from "../shared/interfaces/lista-gasto-filters";
import { IResumen } from "../shared/interfaces/resumen";

export function listResumen(filters: ListaGastosFilters = {} as any): Promise<{resumen: IResumen[], error?: any }> {
    const queryString = [];

    if(filters.dateFrom) {
        queryString.push('dateFrom=' + filters.dateFrom);
    }

    if(filters.dateTo) {
        queryString.push('dateTo=' + filters.dateTo);
    }

    return fetch('/api/resumen?' + queryString.join('&')).then((res) =>
        res.json()
    );
}