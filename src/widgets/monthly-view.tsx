import moment from 'moment';
import React from 'react';
import ListaGastos from '../components/lista-gastos';
import Resumen from '../components/resumen';
import { ListaGastosFilters } from '../shared/interfaces/lista-gasto-filters';

interface MonthlyViewProps {}

interface MonthlyViewState {
    filters: ListaGastosFilters;
    month: number;
    year: number;
}

const dateFormat = 'yyyy-MM-DD';

export default class MonthlyView extends React.Component<
    MonthlyViewProps,
    MonthlyViewState
> {
    constructor(props: MonthlyViewProps) {
        super(props);

        const currentMonth = moment().month();
        const currentYear = moment().year();

        this.state = {
            month: currentMonth,
            year: currentYear,
            filters: this.getToFromDates(currentMonth, currentYear),
        };

        this.onChangeMonth = this.onChangeMonth.bind(this);
        this.goPreviousMonth = this.goPreviousMonth.bind(this);
        this.goNextMonth = this.goNextMonth.bind(this);
    }

    onChangeMonth(e: React.ChangeEvent<HTMLSelectElement>) {
        const month = parseInt(e.currentTarget.value);

        if (isNaN(month)) {
            console.error('value of month select is not a number: ' + month);
            return;
        }

        this.setState({
            ...this.state,
            filters: this.getToFromDates(month, this.state.year),
            month: month,
        });
    }

    getToFromDates(month: number, year: number) {
        if (month === -1) {
            return { dateFrom: '', dateTo: '' };
        }

        const baseDate = moment(0).year(year).month(month);
        const dateFrom = baseDate.clone().startOf('month').format(dateFormat);
        const dateTo = baseDate.clone().endOf('month').format(dateFormat);

        return { dateFrom, dateTo };
    }

    goPreviousMonth() {
        let month = this.state.month - 1;
        let year = this.state.year;
        if (this.state.month < 0) {
            month = 11;
            year = year - 1;
        }

        this.setState({
            month,
            year,
            filters: this.getToFromDates(month, year),
        });
    }

    goNextMonth() {
        let month = this.state.month + 1;
        let year = this.state.year;
        if (this.state.month > 11) {
            month = 0;
            year = year + 1;
        }

        this.setState({
            month,
            year,
            filters: this.getToFromDates(month, year),
        });
    }

    render() {
        return (
            <>
                <p> {this.state.year} </p>

                <div className="row">
                    <div className="col">
                        <Resumen
                            dateFrom={this.state.filters.dateFrom}
                            dateTo={this.state.filters.dateTo}
                        ></Resumen>
                    </div>

                    <div className="col">
                        <div className="input-group">
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={this.goPreviousMonth}
                            >
                                <i className="bi bi-caret-left-fill"></i>
                            </button>

                            <select
                                className="form-select"
                                value={this.state.month}
                                onChange={this.onChangeMonth}
                            >
                                <option key={-1} value={-1}>
                                    Todos
                                </option>
                                {moment.months().map((month, index) => (
                                    <option key={index} value={index}>
                                        {month}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={this.goNextMonth}
                            >
                                <i className="bi bi-caret-right-fill"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <ListaGastos
                    dateFrom={this.state.filters.dateFrom}
                    dateTo={this.state.filters.dateTo}
                    selectGasto={() => {}}
                ></ListaGastos>
            </>
        );
    }
}
