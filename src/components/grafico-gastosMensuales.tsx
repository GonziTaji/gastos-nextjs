import React from "react";
import { Bar } from 'react-chartjs-2';
import { ChartData, ChartOptions } from "chart.js";

interface GraficoGastosMensualesProps {
    chartData: ChartData;
}

interface GraficoGastosMensualesState {
    chartOptions: ChartOptions;
}

export default class GraficoGastosMensuales extends React.Component<GraficoGastosMensualesProps, GraficoGastosMensualesState>{
    constructor(props: GraficoGastosMensualesProps) {
        super(props);

        this.state = {
            chartOptions: {
                maintainAspectRatio: false,
            },
        }
    }

    render() {
        return <Bar style={{ maxHeight: '30rem' }} data={this.props.chartData} options={this.state.chartOptions}></Bar>;
    }
}