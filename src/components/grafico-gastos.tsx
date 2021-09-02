import React from "react";
import { listGastos } from "../pages-lib/gastoService";
import { Pie } from 'react-chartjs-2';
import { ChartData } from "chart.js";
import { colorTipoGasto } from "../shared/data/tipoGasto";

interface GraficoGastosProps {
    dateFrom: string;
    dateTo: string;
}

interface GraficoGastosState {
    chartData: ChartData;
    mounted: boolean;
}

export default class GraficoGastos extends React.Component<GraficoGastosProps, GraficoGastosState>{
    constructor(props: GraficoGastosProps) {
        super(props);

        this.state = {
            chartData: {
                datasets: [{
                    data: []
                }],
                labels: []
            },
            mounted: false
        }
    }

    componentDidMount() {
        this.setState({ mounted: true });
        this.loadGastos();
    }

    componentDidUpdate(prevProps: GraficoGastosProps) {
        if (!this.state.mounted) {
            return;
        }

        const { dateTo, dateFrom } = this.props;

        if (prevProps.dateTo !== dateTo || prevProps.dateFrom !== dateFrom) {
            this.loadGastos();
        }
    }

    async loadGastos() {
        const { dateFrom, dateTo } = this.props;

        const { gastos, error } = await listGastos({ dateFrom, dateTo }, true);
    
        if (error) {
            alert(error);
            console.error(error);
        }
    
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

        this.setState({
            chartData: {
                datasets: [{
                    data,
                    backgroundColor
                }],
                labels
            }
        });
    }

    render() {
        return <Pie style={{ maxHeight: '30rem' }} data={this.state.chartData}></Pie>;
    }
}