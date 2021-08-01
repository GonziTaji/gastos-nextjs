import { ListaGastosFilters } from "../shared/interfaces/lista-gasto-filters";
import { IGasto } from "../shared/interfaces/gasto";

export function listGastos(filters: ListaGastosFilters = {} as any): Promise<{gastos: IGasto[], error?: any }> {
    const queryString = [];

    if(filters.dateFrom) {
        queryString.push('dateFrom=' + filters.dateFrom);
    }

    if(filters.dateTo) {
        queryString.push('dateTo=' + filters.dateTo);
    }

    if (filters.tipo) {
        queryString.push('tipo=' + filters.tipo);
    }

    return fetch('/api/gasto?' + queryString.join('&')).then((res) =>
        res.json()
    );
}

export function deleteGasto(id: string): Promise<{error?: any}> {
    return fetch('/api/gasto/' + id, { method: 'DELETE' }).then((res) =>
        res.json()
    );
}

export function saveGasto(gasto: IGasto, id?: string): Promise<{ id: string, error?: any }> {
    const fetchConfig: RequestInit = {
        method: 'POST',
        body: JSON.stringify(gasto),
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    };

    let url = 'api/gasto/';
    if (gasto._id) url += gasto._id;

    return fetch(url, fetchConfig).then((res) =>
        res.json()
    );
}

export function loadGasto(id: string): Promise<{gasto: IGasto, error?:any}> {
    return fetch('/api/gasto/' + id).then((res) => res.json());
}