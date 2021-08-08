import { MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { ListaGastosFilters } from "../../shared/interfaces/lista-gasto-filters";

const MONGO_URL = process.env.MONGO_URL || '';

export default async function resumen(req: NextApiRequest, res: NextApiResponse<any>) {
    let status = 200,
        json = {};

    try {
        switch (req.method) {
            case 'GET': {
                const resumen = await verResumen(req.query as any);
                json = { resumen };
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

async function verResumen(filter: ListaGastosFilters = {} as any) {
    const matchQuery = {} as any;

    if (filter.dateFrom) {
        if (!matchQuery.fecha) {
            matchQuery.fecha = {};
        }

        matchQuery.fecha.$gte = new Date(filter.dateFrom)
    }

    if (filter.dateTo) {
        if (!matchQuery.fecha) {
            matchQuery.fecha = {};
        }
        matchQuery.fecha.$lte = new Date(filter.dateTo);
    }

    const client = new MongoClient(MONGO_URL);

    await client.connect();

    const response = await client.db('gastos').collection('gastos').aggregate([
        { $match: matchQuery},
        {
            $set: {
                tipo: {
                    $cond: {
                        if: {
                            $regexMatch: {
                                input: '$tipo',
                                regex: /abono/i,
                            },
                        },
                        then: 'abono',
                        else: 'gasto',
                    },
                },
            },
        },
        {
            $group: {
                _id: { pagador: '$pagador', tipo: '$tipo' },
                total: { $sum: '$monto' },
            },
        },
        {
            $group: {
                _id: '$_id.pagador',
                items: { $push: { total: '$total', tipo: '$_id.tipo' } },
            },
        },
        {
            $set: {
                reduceResult: {
                    $reduce: {
                        input: '$items',
                        initialValue: { abono: 0, gasto: 0 },
                        in: {
                            abono: {
                                $cond: {
                                    if: { $eq: ['$$this.tipo', 'abono'] },
                                    then: {
                                        $add: ['$$value.abono', '$$this.total'],
                                    },
                                    else: '$$value.abono',
                                },
                            },
                            gasto: {
                                $cond: {
                                    if: { $eq: ['$$this.tipo', 'gasto'] },
                                    then: {
                                        $add: ['$$value.gasto', '$$this.total'],
                                    },
                                    else: '$$value.gasto',
                                },
                            },
                        },
                    },
                },
            },
        },
        {
            $project: {
                abono: '$reduceResult.abono',
                gasto: '$reduceResult.gasto',
                pagador: '$_id',
            },
        },
    ]).toArray();

    client.close();

    return response;
}