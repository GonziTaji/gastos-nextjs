import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, ObjectId, UpdateResult } from 'mongodb';
import { IGasto } from '../../../shared/interfaces/gasto';

const MONGO_URL = process.env.MONGO_URL || '';

export default async function gastoid(req: NextApiRequest, res: NextApiResponse<any>) {
    let status = 200,
        json = {};

        const id: string = req.query.id.toString();

    try {
        switch (req.method) {
            case 'PUT':
            case 'POST': {
                const { matchedCount, modifiedCount } = await editarGasto(id, req.body);

                if (!matchedCount) {
                    status = 404;
                    json = { message: 'gasto no encontrado' };

                } else if (!modifiedCount) {
                    status = 304;
                    json = { message: 'sin cambios' };

                } else {
                    json = { message: 'modificado' };
                }

                break;
            }
            
            case 'GET': {
                const gasto = await verGasto(id);
                json = { gasto };
                break;
            }

            case 'DELETE': {
                const response = await eliminarGasto(id);
                if (!response) {
                    status = 404;

                } else {
                    json = {
                        message: 'eliminado',
                        id: response.insertResult && response.insertResult.insertedId || ''
                    }
                }
                break;
            }
            default:
                status = 404;
                json = { message: 'not found' }
                break;
            }
    } catch (e) {
        status = 500;
        json = { error: e.toString(), errorDetails: e.stack.split('\n') }
    }

    res.status(status).json(json)
};

async function editarGasto(id: string, body: IGasto): Promise<UpdateResult> {
    // TODO: validate body
    delete body._id;

    if (typeof body.fecha === 'string') {
        body.fecha = new Date(body.fecha);
    }

    body.monto = parseInt(body.monto as any);

    const client = new MongoClient(MONGO_URL);
        
    await client.connect();

    const response = await client.db('gastos').collection('gastos').updateOne(
        { _id: new ObjectId(id) },
        { $set: body }
    )
    
    client.close();

    return response as UpdateResult;
}

async function verGasto(id: string) {
    const client = new MongoClient(MONGO_URL);

    await client.connect();
    
    const [ gasto ] = await client.db('gastos').collection('gastos').find({ _id: new ObjectId(id) }).toArray();
    
    client.close();

    return gasto;
}

/**
 * Elimina gasto de colección 'gastos', y lo agrega a la colección 'gastos_eliminados'
 * 
 * @returns null if not found
 */
 async function eliminarGasto(id: string) {
    const client = new MongoClient(MONGO_URL);

    await client.connect();
    
    const gastoDocument = await client.db('gastos').collection('gastos').findOne({ _id: new ObjectId(id) });

    if (!gastoDocument) {
        return null;
    }

    const deleteResult = await client.db('gastos').collection('gastos').findOneAndDelete({ _id: new ObjectId(id) });
    const insertResult = await client.db('gastos').collection('gastos_eliminados').insertOne(gastoDocument);

    client.close();

    return { deleteResult, insertResult };
}