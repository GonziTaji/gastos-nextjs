import { MongoClient, MongoClientOptions, ObjectId, UpdateResult } from "mongodb";
import { ListaGastosFilters } from "../shared/interfaces/lista-gasto-filters";
import { IGasto } from "../shared/interfaces/gasto";

const MONGO_URL= 'mongodb+srv://'+process.env.MONGO_USR+':'+process.env.MONGO_SECRET+'@cluster0.jakm5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
export class ConfiguredMongoClient extends MongoClient {
    constructor(options?: MongoClientOptions | undefined) {
        super(MONGO_URL, options)
    }
}

export async function editarGasto(id: string, body: IGasto, connectedMongoClient: MongoClient): Promise<UpdateResult> {
    // TODO: validate body
    delete body._id;

    if (typeof body.fecha === 'string') {
        body.fecha = new Date(body.fecha);
    }

    body.monto = parseInt(body.monto as any);

    body.updated = new Date();

    const response = await connectedMongoClient.db('gastos').collection('gastos').updateOne(
        { _id: new ObjectId(id) },
        { $set: body }
    )
    
    return response as UpdateResult;
}

export async function verGasto(id: string, connectedMongoClient: MongoClient) {
    const [ gasto ] = await connectedMongoClient.db('gastos').collection('gastos').find({ _id: new ObjectId(id) }).toArray();

    return gasto;
}

/**
 * Elimina gasto de colección 'gastos', y lo agrega a la colección 'gastos_eliminados'
 * 
 * @returns null if not found
 */
export async function eliminarGasto(id: string, connectecMongoClient: MongoClient) {
    const gastoDocument = await connectecMongoClient.db('gastos').collection('gastos').findOne({ _id: new ObjectId(id) });

    if (!gastoDocument) {
        return null;
    }

    gastoDocument.created = new Date();
    gastoDocument.updated = new Date();

    const deleteResult = await connectecMongoClient.db('gastos').collection('gastos').findOneAndDelete({ _id: new ObjectId(id) });
    const insertResult = await connectecMongoClient.db('gastos').collection('gastos_eliminados').insertOne(gastoDocument);

    return { deleteResult, insertResult };
}

export async function nuevoGasto(body: IGasto, connectedMongoClient: MongoClient): Promise<ObjectId> {
    // TODO: validate body
    if (typeof body.fecha === 'string') {
        body.fecha = new Date(body.fecha);
    }

    body.monto = parseInt(body.monto as any);
    body.created = new Date();

    const response = await connectedMongoClient
        .db('gastos')
        .collection('gastos')
        .insertOne(body);

    return response.insertedId;
}

export async function verGastos(filter: ListaGastosFilters = {} as any, connectedMongoClient: MongoClient) {
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

    const response = await connectedMongoClient
        .db('gastos')
        .collection('gastos')
        .find(findQuery)
        .toArray();

    return response;
}

export async function verGastosAgrupados(filter: ListaGastosFilters = {} as any, connectedMongoClient: MongoClient) {
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

    const response = await connectedMongoClient.db('gastos').collection('gastos').aggregate([
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

    return response;
}

export async function resumenMensual(filter: ListaGastosFilters = {} as any, connectedMongoClient: MongoClient) {
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

    const response = await connectedMongoClient.db('gastos').collection('gastos').aggregate([
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
        {
            $sort: {
                pagador: 1
            }
        }
    ]).toArray();

    // await connectedMongoClient.close();

    return response;
}

export async function mesesAnteriores(mes: number, anio: number, connectedMongoClient: MongoClient) {
    const response = await connectedMongoClient.db('gastos').collection('gastos').aggregate([
        {
            $addFields: {
                month: { $month: '$fecha' },
                year: { $year: '$fecha' }
            }
        },
        {
            $match: {
                month: { $gt: mes - 4, $lte: mes + 1 },
                year: { $gte: anio }
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

    return response;
}