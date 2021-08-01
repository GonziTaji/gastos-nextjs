import { MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { ListaGastosFilters } from "../../shared/interfaces/lista-gasto-filters";

const MONGO_URL = process.env.MONGO_URL || '';

export default async function (req: NextApiRequest, res: NextApiResponse<any>) {
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
        { $group: { _id: "$pagador", total: { $sum: "$monto" } } }
    ]).toArray();

    client.close();

    return response;
}