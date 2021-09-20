import Router from 'next/router';
import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { deleteGasto } from '../pages-lib/gastoService';
import { currency, date } from '../pages-lib/utils';
import { ApiErrorBody } from '../shared/interfaces/apiErrorbody';
import { IGasto } from '../shared/interfaces/gasto';

interface ListaGastosProps {
    // eslint-disable-next-line no-unused-vars
    selectGasto: (id: string) => void;
    gastos: IGasto[];
}

interface ListaGastosState {
}

export default class ListaGastos extends React.Component<
    ListaGastosProps,
    ListaGastosState
> {
    constructor(props: ListaGastosProps) {
        super(props);

        this.eliminarGasto = this.eliminarGasto.bind(this);
        this.editarGasto = this.editarGasto.bind(this);
    }

    async eliminarGasto(e: React.MouseEvent<HTMLElement>) {
        const id = e.currentTarget.getAttribute('data-id');

        if (!id) {
            alert('No se pudo eliminar el gasto. Inténtelo de nuevo');
            return;
        }

        const deleteResponse = await deleteGasto(id);

        if (deleteResponse.status === 401) {
            await Router.push('/login');
            return
        }

        if (!deleteResponse.ok) {
            const body: ApiErrorBody = await deleteResponse.json();
            console.error(body)

            alert(`No se pudo eliminar el gasto (${deleteResponse.status}): ${deleteResponse.statusText}. ${body.message}` );

            return;
        }

        alert('Gasto eliminado!');
    }

    editarGasto(e: React.MouseEvent<HTMLElement>) {
        const id = e.currentTarget.getAttribute('data-id');
        id && this.props.selectGasto(id);
    }

    render() {
        return (
            <div>
                <div className="table-responsive">
                    <table className="table table-sm">
                        <thead>
                            <tr>
                                {/* <th>Id</th> */}
                                <th>Fecha</th>
                                <th>Pagador</th>
                                <th>Tipo</th>
                                <th>Monto</th>
                                <th>Detalle</th>
                                <th className="d-none d-md-table-cell">Observaciones</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {this.props.gastos && this.props.gastos.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center">
                                        Sin resultados
                                    </td>
                                </tr>
                            )}
                            {this.props.gastos && this.props.gastos.map((gasto) =>
                                <tr key={gasto._id}>
                                    {/* <td>{gasto._id}</td> */}
                                    <td>{date(gasto.fecha)}</td>
                                    <td>{gasto.pagador}</td>
                                    <td>{gasto.tipo}</td>
                                    <td>{currency(gasto.monto)}</td>
                                    <td>{gasto.detalle}</td>
                                    <td className="d-none d-md-table-cell" style={{
                                        maxWidth: '30vw',
                                        overflow: 'hidden',
                                        whiteSpace: 'nowrap',
                                    }}>{gasto.observaciones}</td>
                                    <td>
                                        <Dropdown>
                                            <Dropdown.Toggle id="dropdown-custom-1">
                                                <span className="d-none d-md-inline">Acciones</span>
                                                <i className="d-md-none bi bi-list"></i>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Dropdown.Item data-id={gasto._id} onClick={this.editarGasto}>Editar</Dropdown.Item>
                                                <Dropdown.Item data-id={gasto._id} onClick={this.eliminarGasto}>Eliminar</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
