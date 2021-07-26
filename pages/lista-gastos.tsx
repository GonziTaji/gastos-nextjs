import React from 'react';
import { IGasto } from './shared/interfaces/gasto';

interface ListaGastosProps {}

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
    }

    componentDidMount() {
        this.loadGastos();
    }

    async loadGastos() {
        const { gastos, error } = await fetch('/api/gasto').then((res) =>
            res.json()
        );

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

    render() {
        return (
            <div
                style={{
                    display: 'grid',
                    gridTemplateRows: 'auto 1fr',
                }}
            >
                <button className="btn btn-primary" onClick={this.loadGastos}>
                    Actualizar
                </button>

                <table className="table">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Pagador</th>
                            <th>Tipo</th>
                            <th>Fecha</th>
                            <th>Monto</th>
                            <th>Detalle</th>
                            <th>Observaciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {this.state.gastos.map((gasto) =>
                            <tr key={gasto._id}>
                                <td>{gasto._id}</td>
                                <td>{gasto.pagador}</td>
                                <td>{gasto.tipo}</td>
                                <td>{gasto.fecha}</td>
                                <td>{gasto.monto}</td>
                                <td>{gasto.detalle}</td>
                                <td>{gasto.observaciones}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}
