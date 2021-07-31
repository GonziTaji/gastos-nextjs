import { Document } from 'mongodb';

export interface IGasto extends Document {
    // _id?: string | null,
    pagador: string,
    tipo: string,
    fecha: Date | string,
    monto: number,
    detalle: string,
    observaciones: string,
}