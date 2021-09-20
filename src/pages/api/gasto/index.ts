import type { NextApiRequest, NextApiResponse } from 'next';
import { IGasto } from '../../../shared/interfaces/gasto';
import { ConfiguredMongoClient, nuevoGasto } from '../../../api-lib/mongo';
import { authenticateWithHeader } from '../../../api-lib/authenticateWithHeader';

export default async function gasto(req: NextApiRequest, res: NextApiResponse<any>) {
    if (!authenticateWithHeader(req)) {
        return res.status(401).end();
    }

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
        json = { message: e.toString(), error: e };
    }

    res.status(status).json(json);
}

export interface GastoMongo extends IGasto {
    fecha: Date;
}
