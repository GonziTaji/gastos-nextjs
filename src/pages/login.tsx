import React from 'react';
import Router from 'next/router'
import { authenticate, createAuthToken, storeAuthToken } from '../pages-lib/authService';

interface LoginProps {}

interface LoginStatus {
    secret: string;
}

export default class Login extends React.Component<LoginProps, LoginStatus> {
    constructor(props: LoginProps) {
        super(props);

        this.state = {
            secret: '',
        }

        this.validateSecret = this.validateSecret.bind(this);
        this.inputOnChange = this.inputOnChange.bind(this);
    }

    componentDidMount() {
        storeAuthToken('');
    }

    async validateSecret(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const authToken = createAuthToken(this.state.secret);

        const valid = await authenticate(authToken);

        if (valid) {
            storeAuthToken(authToken);
            Router.push('/');
        } else {   
            alert('Contraseña incorrecta');
            
            this.setState({ secret: '' });
        }
    }

    inputOnChange(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ secret: e.currentTarget.value });
    }

    render() {
        return (
            <div className="container">
                <div className="card mt-4">
                    <div className="card-header">
                        Acceso
                    </div>

                    <form onSubmit={this.validateSecret}>
                        <div className="card-body">
                            <label htmlFor="password">Contraseña:</label>
                            <input className="form-control" type="password" id="password" onChange={this.inputOnChange}/>
                        </div>

                        <div className="card-footer">
                            <button className="btn" type="submit">Entrar</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
