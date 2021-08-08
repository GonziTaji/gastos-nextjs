import { Document } from 'mongodb';

export interface IResumen extends Document {
    abono: number;
    gasto: number;
    pagador: string;
}