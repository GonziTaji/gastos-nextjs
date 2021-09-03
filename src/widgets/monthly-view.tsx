import moment from 'moment';
import React from 'react';
import { Tab, TabContent, Tabs } from 'react-bootstrap';
import FormGasto from '../components/form-gasto';
import GraficoGastos from '../components/grafico-gastos';
import GraficoGastosMensuales from '../components/grafico-gastosMensuales';
import ListaGastos from '../components/lista-gastos';
import Resumen from '../components/resumen';
import { ListaGastosFilters } from '../shared/interfaces/lista-gasto-filters';

interface MonthlyViewProps {}

interface MonthlyViewState {
    filters: ListaGastosFilters;
    month: number;
    year: number;
    showGastoModal: boolean;
    selectedGastoId: string; 
}

const dateFormat = 'yyyy-MM-DD';

export default class MonthlyView extends React.Component<
    MonthlyViewProps,
    MonthlyViewState
> {
    constructor(props: MonthlyViewProps) {
        super(props);

        const lastMonth = moment().month();
        const currentYear = moment().year();

        this.state = {
            month: lastMonth,
            year: currentYear,
            filters: this.getToFromDates(lastMonth, currentYear),
            showGastoModal: false,
            selectedGastoId: ''
        };

        this.years = [currentYear];
        for (let i = 1; i < 4; i++) {
            this.years.push(currentYear - i);
        }

        this.onChangeMonth = this.onChangeMonth.bind(this);
        this.goPreviousMonth = this.goPreviousMonth.bind(this);
        this.goNextMonth = this.goNextMonth.bind(this);
        this.onChangeYear = this.onChangeYear.bind(this);
        this.goPreviousYear = this.goPreviousYear.bind(this);
        this.goNextYear = this.goNextYear.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.showModal = this.showModal.bind(this);
        this.nuevoGasto = this.nuevoGasto.bind(this);
    }

    readonly years: number[];

    readonly styles = {
        autoWidth: {
            margin: 'auto',
            width: 'fit-content'
        } 
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

    onChangeYear(e: React.ChangeEvent<HTMLSelectElement>) {
        const year = parseInt(e.currentTarget.value);

        if (isNaN(year)) {
            console.error('value of year select is not a number: ' + year);
            return;
        }

        this.setState({
            ...this.state,
            filters: this.getToFromDates(this.state.month, year),
            year: year,
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
        this.changeMonth(this.state.month - 1);
    }

    goNextMonth() {
        this.changeMonth(this.state.month + 1);
    }

    goPreviousYear() {
        this.changeYear(this.state.year - 1);
    }

    goNextYear() {
        this.changeYear(this.state.year + 1);
    }

    changeYear(year: number) {
        if (this.years.indexOf(year) !== -1) {
            this.setState({
                year,
                filters: this.getToFromDates(this.state.month, year),
            });
        }
    }

    changeMonth(month: number) {
        let year = this.state.year;
        if (month < 0) {
            month = 11 - month;
            year -= 1;
        } else if (month > 11) {
            month -= 11;
            year += 1;
        }

        this.setState({
            month,
            year,
            filters: this.getToFromDates(month, year),
        });
    }

    hideModal() {
        this.setState({
            showGastoModal: false,
            selectedGastoId: '',
        });
    }

    showModal(gastoId: string = '') {
        this.setState({
            showGastoModal: true,
            selectedGastoId: gastoId,
        });
    }

    nuevoGasto() {
        this.showModal()
    }

    render() {
        const { dateTo, dateFrom } = this.state.filters;

        const mes = moment(dateFrom).month() + 1;

        return (
            <>
                <h1 className="d-flex justify-content-between align-items-end">
                    <span>Vista mensual</span>
                    <button type="button" className="btn btn-success" onClick={this.nuevoGasto}>
                        Crear nuevo gasto o abono
                    </button>
                </h1>

                <div style={this.styles.autoWidth}>
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

                    {this.state.month !== -1 && (
                        <div className="input-group">
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={this.goPreviousYear}
                            >
                                <i className="bi bi-caret-left-fill"></i>
                            </button>

                            <select
                                className="form-select"
                                value={this.state.year}
                                onChange={this.onChangeYear}
                            >
                                {this.years.map((year, index) => (
                                    <option key={index} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                className="btn btn-outline-primary btn-sm"
                                onClick={this.goNextYear}
                            >
                                <i className="bi bi-caret-right-fill"></i>
                            </button>
                        </div>
                    )}
                </div>

                <div className="py-2">
                    <Resumen
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                    ></Resumen>

                    <div className="row">
                        <div className="col-12 col-sm-6">
                            <GraficoGastos
                                dateTo={dateTo}
                                dateFrom={dateFrom}
                            ></GraficoGastos>
                        </div>

                        <div className="col-12 col-sm-6">
                            <GraficoGastosMensuales
                                mes={mes}
                            ></GraficoGastosMensuales>
                        </div>
                    </div>
                </div>

                <Tabs defaultActiveKey="gastos">
                    <Tab eventKey="gastos" title={<h3>Gastos</h3>}>
                        <TabContent>
                            <ListaGastos
                                dateFrom={dateFrom}
                                dateTo={dateTo}
                                tipo="gasto"
                                selectGasto={this.showModal}
                            ></ListaGastos>
                        </TabContent>
                    </Tab>
                    <Tab eventKey="abonos" title={<h3>Abonos</h3>}>
                        <ListaGastos
                            dateFrom={dateFrom}
                            dateTo={dateTo}
                            tipo="abono"
                            selectGasto={this.showModal}
                        ></ListaGastos>
                    </Tab>
                </Tabs>

                <FormGasto
                    gastoId={this.state.selectedGastoId}
                    showModal={this.state.showGastoModal}
                    hideModal={this.hideModal}
                ></FormGasto>
            </>
        );
    }
}
