import type { NextApiRequest, NextApiResponse } from 'next';
import { IGasto } from '../../../shared/interfaces/gasto';
import { ConfiguredMongoClient, nuevoGasto } from '../../../api-lib/mongo';

export default async function gasto(req: NextApiRequest, res: NextApiResponse<any>) {
    let status = 200,
        json = {};

    try {
        switch (req.method) {
            case 'POST': {
                const mongoClient = await new ConfiguredMongoClient().connect();
                const id = await nuevoGasto(req.body, mongoClient);
                json = { id };
                status = 201;
                break;
            }

            default:
                status = 404;
                json = { message: 'not found' };
                break;
        }
    } catch (e: any) {
        status = 500;
        json = { error: e.toString(), errorDetails: e.stack.split('\n') };
    }

    res.status(status).json(json);
}

export interface GastoMongo extends IGasto {
    fecha: Date;
}
