import { Document } from 'mongodb';

export interface IResumen extends Document {
    total: number;
}