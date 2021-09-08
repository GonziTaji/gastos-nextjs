import { ChartData } from 'chart.js';
import moment from 'moment';
import React from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import FormGasto from '../components/form-gasto';
import GraficoGastos from '../components/grafico-gastos';
import GraficoGastosMensuales from '../components/grafico-gastosMensuales';
import ListaGastos from '../components/lista-gastos';
import LoadingOverlay from '../components/loading-overlay';
import Resumen from '../components/resumen';
import { colorTipoGasto } from '../shared/data/tipoGasto';
import { DashboardData } from '../shared/interfaces/dashboardData';
import { IGasto } from '../shared/interfaces/gasto';
import { ListaGastosFilters } from '../shared/interfaces/lista-gasto-filters';
import { IResumen } from '../shared/interfaces/resumen';

interface MonthlyViewProps {}

interface MonthlyViewState {
    filters: ListaGastosFilters;
    month: number;
    year: number;
    showGastoModal: boolean;
    selectedGastoId: string; 
    gastos: IGasto[];
    abonos: IGasto[];
    resumen: IResumen[];
    barChartData: ChartData;
    pieChartData: ChartData;
    loading: boolean;
    oldData: {
        dateFrom: string;
        dateTo: string;
        gastos: IGasto[];
        abonos: IGasto[];
        resumen: IResumen[];
        barChartData: ChartData;
        pieChartData: ChartData;
    }[]
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
            selectedGastoId: '',
            gastos: [],
            abonos: [],
            resumen: [],
            barChartData: {
                datasets: [{
                    data: []
                }],
                labels: []
            },
            pieChartData: {
                datasets: [{
                    data: []
                }],
                labels: []
            },
            loading: false,
            oldData: [],
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

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate(_prevProps: MonthlyViewProps, prevState: MonthlyViewState) {
        const { dateFrom: prevDateFrom, dateTo: prevDateTo } = prevState.filters;
        const { dateFrom, dateTo } = this.state.filters;

        if (dateTo !== prevDateTo || dateFrom !== prevDateFrom) {
            this.loadData();
        }
    }

    loadData() {
        const {
            filters: { dateFrom, dateTo },
            gastos,
            abonos,
            resumen,
            barChartData,
            pieChartData,
            oldData
        } = this.state;

        oldData.push({
            dateFrom,
            dateTo,
            gastos,
            abonos,
            resumen,
            barChartData,
            pieChartData,
        });

        this.setState({ loading: true }, async () => {
            const queryString = [];


            if(dateFrom) {
                queryString.push('dateFrom=' + dateFrom);
            }
        
            if(dateTo) {
                queryString.push('dateTo=' + dateTo);
            }
        
            const { error, ...dashboardData } = await fetch('/api/dashboard?' + queryString.join('&')).then((res) =>
                res.json() as (Promise<DashboardData>)
            );
            
            if (error) {
                console.error(error);
                alert('Error al cargar la data' + error);
            }

            this.setState({
                ...this.state,
                loading: false,
                gastos: dashboardData.gastos,
                abonos: dashboardData.abonos,
                resumen: dashboardData.resumen,
                pieChartData: this.getPieChartData(dashboardData.agrupados),
                barChartData: this.getBarChartData(dashboardData.meses),
            });
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

    getPieChartData(gastos: IGasto[]) {
        const data = [];
        const labels = [];
        const backgroundColor = [];
        
        if (Array.isArray(gastos)) {
            for (const gasto of gastos) {
                data.push(gasto.monto);
                labels.push(gasto.tipo);
                backgroundColor.push(colorTipoGasto(gasto.tipo))
            }
    
        }

        return {
            datasets: [{
                data,
                backgroundColor
            }],
            labels
        };
    }

    getBarChartData(meses: any) {  
        const { dateFrom } = this.state.filters;  
        const data: number[] = [];
        const labels: string[] = [];
        const backgroundColor: string[] = [];
        const borderColor: string[] = [];

        const colorMesesAnteriores = '#ed7864';
        const colorMesActual = '#7864ed';
        const lineBodyAlpha = 40;

        if (Array.isArray(meses)) {
            for (let i = 0; i < meses.length; i++) {
                const gastoMensual = meses[i];

                data.push(gastoMensual.monto);
                labels.push(moment.months()[gastoMensual.mes - 1]);

                const color = moment(dateFrom).month() + 1 === gastoMensual.mes ? colorMesActual : colorMesesAnteriores;

                backgroundColor.push(color + lineBodyAlpha);
                borderColor.push(color);
            }
        }
        
        return {
            datasets: [{
                label: 'Total Gasto',
                data,
                backgroundColor,
                borderColor,
                borderWidth: 1,
            }],
            labels
        };
    }

    // dashboard should control every component
    // - components should recieve data and execute delegates

    // methods needed for actions (delegates):
    // - Load gasto
    // - Update gasto
    // - Delete gasto
    // - Create gasto

    render() {
        return (
            <>
                <LoadingOverlay
                    message="Cargando..."
                    iconClass="spinner-border text-primary"
                    show={this.state.loading}
                ></LoadingOverlay>

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
                        resumen={this.state.resumen}
                    >
                        <p>AYYY LAMAO</p>
                    </Resumen>

                    <div className="row">
                        <div className="col-12 col-sm-6">
                            <GraficoGastos
                                chartData={this.state.pieChartData}
                            ></GraficoGastos>
                        </div>

                        <div className="col-12 col-sm-6">
                            <GraficoGastosMensuales
                                chartData={this.state.barChartData}
                            ></GraficoGastosMensuales>
                        </div>
                    </div>
                </div>

                <Tabs defaultActiveKey="gastos">
                    <Tab eventKey="gastos" title={<h3>Gastos</h3>}>
                        <ListaGastos
                            gastos={this.state.gastos}
                            selectGasto={this.showModal}
                        ></ListaGastos>
                    </Tab>
                    <Tab eventKey="abonos" title={<h3>Abonos</h3>}>
                        <ListaGastos
                            gastos={this.state.abonos}
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
