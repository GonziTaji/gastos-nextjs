import moment from 'moment';
import React from 'react';
import { personas } from './shared/data/personas';
import { tipoGastos } from './shared/data/tipoGasto';
import { IGasto } from './shared/interfaces/gasto';

interface NuevoGastoProps {}

interface NuevoGastoState {
    form: IGasto;
    tipoGastos: string[];
    personas: string[];
}

type HTMLFormElement =
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement;

export default class NuevoGasto extends React.Component<
    NuevoGastoProps,
    NuevoGastoState
> {
    constructor(props: NuevoGastoProps) {
        super(props);
        this.state = {
            form: {
                _id: null,
                pagador: '',
                tipo: '',
                fecha: moment().format('yyyy-MM-DD'),
                monto: 0,
                detalle: '',
                observaciones: '',
            },
            tipoGastos: [],
            personas: [],
        };

        this.onChangeFormField = this.onChangeFormField.bind(this);
        this.guardarGasto = this.guardarGasto.bind(this);
    }

    onChangeFormField({ currentTarget }: React.ChangeEvent<HTMLFormElement>) {
        if (!this.state.form.hasOwnProperty(currentTarget.id)) {
            console.error(
                `form field ${currentTarget.id} not registered in form`
            );
        }

        this.setState({
            form: {
                ...this.state.form,
                [currentTarget.id]: currentTarget.value,
            },
        });
    }

    async guardarGasto() {
        const fetchConfig = {
            method: 'POST',
            body: JSON.stringify(this.state.form),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        const { id, error } = await fetch('/api/gasto', fetchConfig).then((res) => res.json());

        if (error) {
            console.error(error);
            alert('Error al guardar gasto');
            return;
        }

        this.setState({
            form: {
                ...this.state.form,
                fecha: moment().format('yyyy-MM-DD'),
                monto: 0,
                detalle: '',
                observaciones: '',
            },
        });
    }

    render() {
        return (
            <form>
                <label htmlFor="pagador">Pagador</label>
                <select
                    className="form-select"
                    id="pagador"
                    value={this.state.form.pagador}
                    onChange={this.onChangeFormField}
                >
                    <option key="-1" value="">Seleccione Persona</option>
                    {personas.map((persona, index) =>
                        <option key={index} value={persona}>
                            {persona}
                        </option>
                    )}
                </select>

                <label htmlFor="tipo">Tipo</label>
                <select
                    className="form-select"
                    id="tipo"
                    value={this.state.form.tipo}
                    onChange={this.onChangeFormField}
                >
                    <option key="-1" value="">Seleccione Tipo</option>
                    {tipoGastos.map((tipo, index) =>
                        <option key={index} value={tipo}>
                            {tipo}
                        </option>
                    )}
                </select>

                <label htmlFor="fecha">Fecha</label>
                <input
                    type="date"
                    className="form-control"
                    id="fecha"
                    value={this.state.form.fecha}
                    onChange={this.onChangeFormField}
                />

                <label htmlFor="monto">Monto</label>
                <input
                    type="text"
                    className="form-control"
                    id="monto"
                    value={this.state.form.monto}
                    onChange={this.onChangeFormField}
                />

                <label htmlFor="detalle">Detalle</label>
                <input
                    type="text"
                    className="form-control"
                    id="detalle"
                    value={this.state.form.detalle}
                    onChange={this.onChangeFormField}
                />

                <label htmlFor="observaciones">Observaciones</label>
                <textarea
                    className="form-control"
                    id="observaciones"
                    placeholder="Detalles adicionales"
                    value={this.state.form.observaciones}
                    onChange={this.onChangeFormField}
                ></textarea>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.guardarGasto}
                >
                    Guardar
                </button>
            </form>
        );
    }
}
