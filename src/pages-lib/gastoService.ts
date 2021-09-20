import { IGasto } from "../shared/interfaces/gasto";
import { getStoredAuthToken } from "./authService";

export function deleteGasto(id: string): Promise<Response> {
    return fetch('/api/gasto/' + id, {
        method: 'DELETE',
        headers: {
            Authorization: getStoredAuthToken(),
        }
    });
}

export function saveGasto(gasto: IGasto): Promise<Response> {
    let url = 'api/gasto/';
    if (gasto._id) url += gasto._id;

    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(gasto),
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: getStoredAuthToken(),
        },
    });
}

export function loadGasto(id: string): Promise<Response> {
    return fetch('/api/gasto/' + id, {
        headers: {
            Authorization: getStoredAuthToken(),
        }
    })
}