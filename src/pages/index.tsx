import React from 'react';
import MonthlyView from '../widgets/monthly-view';
import Router from 'next/router';
import { authenticate, getStoredAuthToken } from '../pages-lib/authService';

interface HomeProps {}

interface HomeStatus {
    authToken: string
}

export default class Home extends React.Component<HomeProps, HomeStatus> {
    constructor(props: HomeProps) {
        super(props);

        this.state = {
            authToken: '',
        }
    }

    componentDidMount() {
        this.validateToken();
    }

    async validateToken() {
        const authToken = getStoredAuthToken();

        if (!await authenticate(authToken)) {
            return await Router.push('login');
        }

        this.setState({ authToken });
    }

    render() {
        if (!this.state.authToken) {
            return <p>Loading...</p>;
        }

        return (
            <div className="container">
                <MonthlyView></MonthlyView>
            </div>
        );
    }
}
