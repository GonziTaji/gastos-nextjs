import '../styles/Home.module.scss';
import ListaGastos, { ListaGastosFilters } from '../components/lista-gastos';
import FormGasto from '../components/form-gasto';
import React from 'react';
import moment from 'moment';
import { Col, Row } from 'react-bootstrap';

interface HomeProps {}

interface HomeStatus {
    selectedGastoId: string;
    dateFrom: string;
    dateTo: string;
    /** Starts at 0: January */
    month: number;
    year: number;
}

export default class Home extends React.Component<HomeProps, HomeStatus> {
    constructor(props: HomeProps) {
        super(props);

        const currentMonth = moment().month();
        const currentYear = moment().year();

        this.state = {
            selectedGastoId: '',
            month: currentMonth,
            year: currentYear,
            ...this.getToFromDates(currentMonth, currentYear),
        };

        this.onSelectGasto = this.onSelectGasto.bind(this);
        this.onChangeMonth = this.onChangeMonth.bind(this);
    }

    onSelectGasto(id: string) {
        this.setState({
            selectedGastoId: id,
        });
    }

    onChangeMonth(e: React.ChangeEvent<HTMLSelectElement>) {
        const month = parseInt(e.currentTarget.value);

        if (isNaN(month)) {
            console.error('value of month select is not a number: ' + month);
            return;
        }

        this.setState({
            ...this.state,
            ...this.getToFromDates(month, this.state.year),
            month: month,
        });
    }

    getToFromDates(month: number, year: number) {
        if (month === -1) {
            return { dateFrom: '', dateTo: '' }
        }

        const baseDate = moment(0).year(year).month(month);
        const dateFrom = baseDate.clone().startOf('month').format('yyyy-MM-DD');
        const dateTo = baseDate.clone().endOf('month').format('yyyy-MM-DD');

        return { dateFrom, dateTo }
    }

    render() {
        const { dateFrom, dateTo, selectedGastoId, month } = this.state;
        return (
            <>
                <h1>Gastos</h1>
                <div className="row">
                    <div className="col col-auto">
                        <h2>
                            {(selectedGastoId &&
                                'Editando gasto' ||
                                'Ingresando nuevo gasto')}
                        </h2>
                        <FormGasto gastoId={this.state.selectedGastoId}></FormGasto>
                    </div>
                    <div className="col">
                        <h2>
                            Lista de gastos
                        </h2>

                        <select className="form-select" value={month} onChange={this.onChangeMonth}>
                            <option key={-1} value={-1}>
                                    Todos
                            </option>
                            {moment.months().map((month, index) => (
                                <option key={index} value={index}>
                                    {month}
                                </option>
                            ))}
                        </select>

                        <ListaGastos
                            dateFrom={dateFrom}
                            dateTo={dateTo}
                            selectGasto={this.onSelectGasto}
                        ></ListaGastos>
                    </div>
                </div>
            </>
        );
    }
}
