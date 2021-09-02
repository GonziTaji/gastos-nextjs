import type { NextApiRequest, NextApiResponse } from 'next';
import { IGasto } from '../../../shared/interfaces/gasto';
import { MongoClient, ObjectId } from 'mongodb';
import { ListaGastosFilters } from '../../../shared/interfaces/lista-gasto-filters';
import { MONGO_URL } from '../../../api-lib/mongo';

export default async function gasto(req: NextApiRequest, res: NextApiResponse<any>) {
    let status = 200,
        json = {};

    try {
        switch (req.method) {
            case 'POST': {
                const id = await nuevoGasto(req.body);
                json = { id };
                status = 201;
                break;
            }

            case 'GET': {
                const delegate = req.query.group ? verGastosAgrupados : verGastos;
                const gastos = await delegate(req.query as any);
                json = { gastos };
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

async function nuevoGasto(body: IGasto): Promise<ObjectId> {
    // TODO: validate body
    if (typeof body.fecha === 'string') {
        body.fecha = new Date(body.fecha);
    }

    body.monto = parseInt(body.monto as any);
    body.created = new Date();

    const client = new MongoClient(MONGO_URL);

    await client.connect();
    const response = await client
        .db('gastos')
        .collection('gastos')
        .insertOne(body);

    client.close();

    return response.insertedId;
}

async function verGastos(filter: ListaGastosFilters = {} as any) {
    const findQuery = {} as any;

    if (filter.dateFrom) {
        if (!findQuery.fecha) {
            findQuery.fecha = {};
        }

        findQuery.fecha.$gte = new Date(filter.dateFrom);
    }

    if (filter.dateTo) {
        if (!findQuery.fecha) {
            findQuery.fecha = {};
        }
        findQuery.fecha.$lte = new Date(filter.dateTo);
    }

    if (filter.tipo) {
        switch (filter.tipo) {
            case 'abono':
                findQuery.tipo = { $eq: 'Abono Deuda' };
                break;

            case 'gasto':
                findQuery.tipo = { $not: { $eq: 'Abono Deuda' } };
                break;

            default:
                console.warn('filtro para tipo de gasto no definido: ' + filter.tipo);
                break;
        }
    }

    const client = new MongoClient(MONGO_URL);

    await client.connect();

    const response = await client
        .db('gastos')
        .collection('gastos')
        .find(findQuery)
        .toArray();

    client.close();

    return response;
}

async function verGastosAgrupados(filter: ListaGastosFilters = {} as any) {
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

    matchQuery.tipo = { $not: /abono/i };

    const client = new MongoClient(MONGO_URL);

    await client.connect();

    const response = await client.db('gastos').collection('gastos').aggregate([
        {
            $match: matchQuery
        },
        {
            $group: {
                _id: '$tipo',
                monto: { $sum: '$monto'}
            }
        },
        {
            $addFields: {
                tipo: '$_id',
            }
        },
        {
            $sort: {
                monto: -1
            }
        }
    ]).toArray();

    client.close();

    return response;
}

export interface GastoMongo extends IGasto {
    fecha: Date;
}
