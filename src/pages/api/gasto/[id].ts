import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticateWithHeader } from '../../../api-lib/authenticateWithHeader';
import { ConfiguredMongoClient, editarGasto, eliminarGasto, verGasto } from '../../../api-lib/mongo';

export default async function gastoid(req: NextApiRequest, res: NextApiResponse<any>) {
    if (!authenticateWithHeader(req)) {
        return res.status(401).end();
    }

    let status = 200,
        json = {};

        const id: string = req.query.id.toString();

    try {
        switch (req.method) {
            case 'PUT':
            case 'POST': {
                const mongoClient = await new ConfiguredMongoClient().connect();
                const { matchedCount, modifiedCount } = await editarGasto(id, req.body, mongoClient);
                await mongoClient.close();
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
                const mongoClient = await new ConfiguredMongoClient().connect();
                const gasto = await verGasto(id, mongoClient);

                if (!gasto) {
                    status = 404;
                    json = { message: 'not found' }
                } else {
                    json = { gasto };
                }

                await mongoClient.close();
                break;
            }

            case 'DELETE': {
                const mongoClient = await new ConfiguredMongoClient().connect();
                const response = await eliminarGasto(id, mongoClient);
                await mongoClient.close();

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
                json = { message: 'route not found' }
                break;
            }
    } catch (e: any) {
        status = 500;
        json = { message: e.toString(), error: e.stack.split('\n') }
    }

    res.status(status).json(json)
}

