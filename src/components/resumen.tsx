import React from 'react';
import { currency } from '../pages-lib/utils';
import { IResumen } from '../shared/interfaces/resumen';

interface ResumenProps {
    resumen: IResumen[];
}

interface ResumenState {
}

export default class Resumen extends React.Component<
    ResumenProps,
    ResumenState
> {
    constructor(props: ResumenProps) {
        super(props);
    }

    render() {
        const totalGastos = this.props.resumen ? this.props.resumen.reduce((acc, curr) => acc += curr.gasto, 0) : 0;

        return (
            <>
                <div className="card">
                    <div className="card-header">
                        Resumen
                    </div>

                    <div className="card-body">
                        <table className="table table-sm table-hover">
                            <thead>
                                <tr>
                                    <th> Pagador </th>
                                    <th> Gasto </th>
                                    <th> Deuda </th>
                                    <th> Abono </th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.props.resumen.map(({ _id, gasto, abono, pagador }) => {
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

                        <table className="table table-sm table-hover">
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
