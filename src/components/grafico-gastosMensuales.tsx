import React from "react";
import { Bar } from 'react-chartjs-2';
import { ChartData, ChartOptions } from "chart.js";
import moment from 'moment';

interface GraficoGastosMensualesProps {
    mes: number
}

interface GraficoGastosMensualesState {
    chartData: ChartData;
    chartOptions: ChartOptions;
    mounted: boolean;
}

export default class GraficoGastosMensuales extends React.Component<GraficoGastosMensualesProps, GraficoGastosMensualesState>{
    constructor(props: GraficoGastosMensualesProps) {
        super(props);

        this.state = {
            chartData: {
                datasets: [{
                    data: []
                }],
                labels: [],
            },
            chartOptions: {
                maintainAspectRatio: false,
            },
            mounted: false
        }
    }

    componentDidMount() {
        this.setState({ mounted: true });
        this.loadGastosMensuales();
    }

    componentDidUpdate(prevProps: GraficoGastosMensualesProps) {
        if (!this.state.mounted) {
            return;
        }

        if (prevProps.mes !== this.props.mes) {
            this.loadGastosMensuales();
        }
    }

    async loadGastosMensuales() {
        const { meses, error } = await this.fetchGastosMensuales();
    
        if (error) {
            alert(error);
            console.error(error);
        }
    
        const data = [];
        const labels = [];
        const backgroundColor = [];
        const borderColor = [];

        const colorMesesAnteriores = '#ed7864';
        const colorMesActual = '#7864ed';

        if (Array.isArray(meses)) {
            for (let i = 0; i < meses.length; i++) {
                const gastoMensual = meses[i];

                data.push(gastoMensual.monto);
                labels.push(moment.months()[gastoMensual.mes - 1]);

                const color = i === meses.length - 1 ? colorMesActual : colorMesesAnteriores;
                
                backgroundColor.push(color + '40');
                borderColor.push(color);
            }
        }

        this.setState({
            chartData: {
                datasets: [{
                    label: 'Total Gasto',
                    data,
                    backgroundColor,
                    borderColor,
                    borderWidth: 1,

                }],
                labels
            }
        });
    }

    async fetchGastosMensuales() {
        return fetch('/api/gasto/mesesAnteriores?mes=' + this.props.mes).then((res) => res.json());
    }

    render() {
        return <Bar style={{ maxHeight: '30rem' }} data={this.state.chartData} options={this.state.chartOptions}></Bar>;
    }
}