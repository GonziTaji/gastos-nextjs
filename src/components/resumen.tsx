import moment from 'moment';
import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { deleteGasto } from '../pages-lib/gastoService';
import { listResumen } from '../pages-lib/resumenService';
import { currency } from '../pages-lib/utils';
import { IGasto } from '../shared/interfaces/gasto';
import { ListaGastosFilters } from '../shared/interfaces/lista-gasto-filters';
import { IResumen } from '../shared/interfaces/resumen';

interface ResumenProps extends ListaGastosFilters {}

interface ResumenState {
    resumen: IResumen[];
}

export default class Resumen extends React.Component<
    ResumenProps,
    ResumenState
> {
    constructor(props: ResumenProps) {
        super(props);

        this.state = {
            resumen: [],
        };

        this.loadResumen = this.loadResumen.bind(this);
    }

    componentDidMount() {
        this.loadResumen();
    }

    componentDidUpdate({ dateFrom, dateTo }: ResumenProps) {
        if (dateFrom !== this.props.dateFrom || dateTo !== this.props.dateTo) {
            this.loadResumen();
        }
    }

    async loadResumen() {
        const { dateFrom, dateTo } = this.props;

        const { resumen, error } = await listResumen({ dateFrom, dateTo });

        if (error) {
            console.error(error);
            alert('No se pudieron cargar los resumen.' + error.message);
            return;
        }

        if (!Array.isArray(resumen)) {
            console.warn(
                'Resumen.loadGastos: resumen is not an array, but ' +
                    typeof resumen,
                resumen
            );
            return;
        }

        this.setState({ resumen });
    }

    render() {
        const totalGastos = this.state.resumen.reduce((acc, curr) => acc += curr.gasto, 0);

        return (
            <>
                <div className="card">
                    <div className="card-header">
                        Resumen
                    </div>

                    <div className="card-body">
                        <table className="table table-sm">
                            <thead>
                                <tr>
                                    <th> Pagador </th>
                                    <th> Gasto </th>
                                    <th> Deuda </th>
                                    <th> Abono </th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.resumen.map(({ _id, gasto, abono, pagador }) => {
                                    const deuda = (totalGastos / 2) - gasto;

                                    return (
                                        <tr key={_id}>
                                            <td>{pagador}</td>
                                            <td>{currency(gasto)}</td>
                                            <td>{currency(deuda)}</td>
                                            <td>{currency(abono)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                        <table className="table table-sm">
                            <thead>
                                <tr>
                                    <th>Total</th>
                                    <th>Total por persona</th>
                                </tr>
                            </thead>

                            <thead>
                                <tr>
                                    <td>{currency(totalGastos)}</td>
                                    <td>{currency(totalGastos/2)}</td>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>
            </>
        );
    }
}
