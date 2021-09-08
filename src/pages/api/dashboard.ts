import moment from "moment";
import { NextApiRequest, NextApiResponse } from "next";
import { ConfiguredMongoClient, mesesAnteriores, resumenMensual, verGastos, verGastosAgrupados } from "../../api-lib/mongo";
import { DashboardData } from "../../shared/interfaces/dashboardData";
import { ListaGastosFilters } from "../../shared/interfaces/lista-gasto-filters";

export default async function dashboard(req: NextApiRequest, res: NextApiResponse<any>) {
    let status = 200,
        json = {};

    try {
        switch (req.method) {
            case 'GET': {
                const filters: ListaGastosFilters = req.query as any;
                const dateFrom = moment(filters.dateFrom);
                const mes = dateFrom.month() + 1;
                const anio = dateFrom.year();

                const connectedMongoClient = await new ConfiguredMongoClient().connect();

                json = {
                    gastos: await verGastos({ ...filters, tipo: 'gasto' }, connectedMongoClient),
                    abonos: await verGastos({ ...filters, tipo: 'abono' }, connectedMongoClient),
                    resumen: await resumenMensual(filters, connectedMongoClient),
                    meses: await mesesAnteriores(mes, anio, connectedMongoClient),
                    agrupados: await verGastosAgrupados(filters, connectedMongoClient),
                } as DashboardData;

                await connectedMongoClient.close();

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