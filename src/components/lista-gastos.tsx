import moment from 'moment';
import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { deleteGasto, listGastos } from '../pages-lib/gastoService';
import { date } from '../pages-lib/utils';
import { IGasto } from '../shared/interfaces/gasto';
import { ListaGastosFilters } from '../shared/interfaces/lista-gasto-filters';

interface ListaGastosProps extends ListaGastosFilters {
    selectGasto: (id: string) => void
}

interface ListaGastosState {
    gastos: IGasto[];
}

export default class ListaGastos extends React.Component<
    ListaGastosProps,
    ListaGastosState
> {
    constructor(props: ListaGastosProps) {
        super(props);
 
        this.state = {
            gastos: [],
        };

        this.loadGastos = this.loadGastos.bind(this);
        this.eliminarGasto = this.eliminarGasto.bind(this);
        this.editarGasto = this.editarGasto.bind(this);
    }

    componentDidMount() {
        this.loadGastos();
    }

    componentDidUpdate({ dateFrom, dateTo }: ListaGastosProps) {
        if (dateFrom !== this.props.dateFrom || dateTo !== this.props.dateTo) {
            this.loadGastos();
        }
    }

    async loadGastos() {
        const { dateFrom, dateTo, tipo } = this.props;

        const { gastos, error } = await listGastos({ dateFrom, dateTo, tipo });

        if (error) {
            console.error(error);
            alert('No se pudieron cargar los gastos.' + error.message);
            return;
        }

        if (!Array.isArray(gastos)) {
            console.warn(
                'ListaGastos.loadGastos: gastos is not an array, but ' +
                    typeof gastos,
                gastos
            );
            return;
        }

        this.setState({ gastos });
    }

    async eliminarGasto(e: React.MouseEvent<HTMLElement>) {
        const id = e.currentTarget.getAttribute('data-id');

        const { error } = await deleteGasto(id || '');

        if (error) {
            console.error(error);
            alert('No se pudo eliminar el gasto. ' + error.message);
            return;
        }

        this.loadGastos();
    }

    editarGasto(e: React.MouseEvent<HTMLElement>) {
        const id = e.currentTarget.getAttribute('data-id');
        id && this.props.selectGasto(id);
    }

    render() {
        return (
            <div style={{ fontSize: '0.8rem' }}>
                <button className="btn btn-primary" onClick={this.loadGastos}>
                    Actualizar
                </button>
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
                            {this.state.gastos.map((gasto) =>
                                <tr key={gasto._id}>
                                    {/* <td>{gasto._id}</td> */}
                                    <td>{date(gasto.fecha)}</td>
                                    <td>{gasto.pagador}</td>
                                    <td>{gasto.tipo}</td>
                                    <td>{gasto.monto}</td>
                                    <td>{gasto.detalle}</td>
                                    <td className="d-none d-md-table-cell">{gasto.observaciones}</td>
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
