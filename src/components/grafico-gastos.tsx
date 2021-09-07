import React from "react";
import { Pie } from 'react-chartjs-2';
import { ChartData } from "chart.js";

interface GraficoGastosProps {
    chartData: ChartData;
}

interface GraficoGastosState {
}

export default class GraficoGastos extends React.Component<GraficoGastosProps, GraficoGastosState>{
    constructor(props: GraficoGastosProps) {
        super(props);
    }

    render() {
        return <Pie style={{ maxHeight: '30rem' }} data={this.props.chartData}></Pie>;
    }
}