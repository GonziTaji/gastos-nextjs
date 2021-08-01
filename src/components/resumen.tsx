import moment from 'moment';
import React from 'react';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { deleteGasto } from '../pages-lib/gastoService';
import { listResumen } from '../pages-lib/resumenService';
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
        return (
            <>
                <div className="card" style={{ maxWidth: '300px' }}>
                    <div className="card-body">
                        {this.state.resumen.map((item) => (
                            <div className="row" key={item._id}>
                                <div className="col">{item._id}</div>
                                <div className="col col-auto">{item.total}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
    }
}
