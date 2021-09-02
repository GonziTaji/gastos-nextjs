import type { NextApiRequest, NextApiResponse } from 'next';
import { IGasto } from '../../../shared/interfaces/gasto';
import { MongoClient } from 'mongodb';
import { MONGO_URL } from '../../../api-lib/mongo';

export default async function gasto(req: NextApiRequest, res: NextApiResponse<any>) {
    let status = 200,
        json = {};

    try {
        switch (req.method) {
            case 'GET': {
                const mes = parseInt(req.query.mes as string) || new Date().getMonth() + 1;
                const meses = await mesesAnteriores(mes);
                json = { meses };
                break;
            }

            default:
                status = 404;
                json = { message: 'not found' };
                break;
        }
    } catch (e) {
        status = 500;
        json = { error: e.toString(), errorDetails: e.stack.split('\n') };
    }

    res.status(status).json(json);
}

async function mesesAnteriores(mes: number) {
    const client = new MongoClient(MONGO_URL);

    await client.connect();

    const response = await client.db('gastos').collection('gastos').aggregate([
        {
            $addFields: {
                month: { $month: '$fecha' },
                year: { $year: '$fecha' }
            }
        },
        {
            $match: {
                month: { $gt: mes - 4 }
            }
        },
        {
            $group: {
                _id: { month: '$month', year: '$year' },
                monto: { $sum: '$monto' }
            }
        },
        {
            $project: {
                mes: '$_id.month',
                monto: '$monto',
            }
        },
        {
            $sort: {
                mes: 1
            }
        }
    ]).toArray();

    client.close();

    return response;
}

export interface GastoMongo extends IGasto {
    fecha: Date;
}
