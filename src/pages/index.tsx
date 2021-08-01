import '../styles/Home.module.scss';
import ListaGastos, { ListaGastosFilters } from '../components/lista-gastos';
import FormGasto from '../components/form-gasto';
import React from 'react';
import moment from 'moment';
import { Col, Row } from 'react-bootstrap';
import MasterDetail from '../widgets/master-detail';

interface HomeProps {}

interface HomeStatus {
}

export default class Home extends React.Component<HomeProps, HomeStatus> {
    constructor(props: HomeProps) {
        super(props);
    }

    render() {
        return (
            <>
                <MasterDetail></MasterDetail>
            </>
        );
    }
}
