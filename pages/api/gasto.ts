import type { NextApiRequest, NextApiResponse } from 'next';
import { IGasto } from '../shared/interfaces/gasto';
import { MongoClient, ObjectId } from 'mongodb';

export default async function(req: NextApiRequest, res: NextApiResponse<any>) {
    let status = 200,
        json = {};

    try {
        switch (req.method) {
            case 'POST': {
                const id = await nuevoGasto(req.body);
                json = { id };
                break;
            }
            
            case 'GET': {
                const gastos = await verGastos(req.body);
                json = { gastos };
                break;
            }
            
            default:
                status = 404;
                json = { message: 'not found' }
                break;
            }
    } catch (e) {
        status = 500;
        json = { error: e.toString(), errorDetails: e.stack }
    }

    res.status(status).json(json)
};

async function nuevoGasto(body: IGasto): Promise<ObjectId> {
    // TODO: validate body

    const client = new MongoClient('mongodb://localhost:27017');
        
    await client.connect();
    const response = await client.db('gastos').collection('gastos').insertOne(body);
    
    client.close();

    return response.insertedId;
}

async function verGastos(filter = {}) {
    const client = new MongoClient('mongodb://localhost:27017');

    await client.connect();
    
    const response = await client.db('gastos').collection('gastos').find(filter).toArray();
    
    client.close();

    return response;
}
