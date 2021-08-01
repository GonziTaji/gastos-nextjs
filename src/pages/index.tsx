import React from 'react';
import MonthlyView from '../widgets/monthly-view';

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
                <MonthlyView></MonthlyView>
            </>
        );
    }
}
