import moment from 'moment';
import React from 'react';
import { Modal } from 'react-bootstrap';
import { saveGasto, loadGasto } from '../pages-lib/gastoService';
import { personas } from '../shared/data/personas';
import { tipoGastos } from '../shared/data/tipoGasto';
import { IGasto } from '../shared/interfaces/gasto';

interface FormGastoProps {
    gastoId: string;
    showModal: boolean,
    hideModal: () => void, 
}

interface FormGastoState {
    form: IGasto;
    tipoGastos: string[];
    personas: string[];
    gastoOriginal: IGasto;
}

type HTMLFormElement =
    | HTMLInputElement
    | HTMLSelectElement
    | HTMLTextAreaElement;

export default class FormGasto extends React.Component<
    FormGastoProps,
    FormGastoState
> {
    constructor(props: FormGastoProps) {
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
            gastoOriginal: {} as IGasto,
        };

        this.onChangeFormField = this.onChangeFormField.bind(this);
        this.guardarGasto = this.guardarGasto.bind(this);
        this.guardarGastoYCerrar = this.guardarGastoYCerrar.bind(this);
    }

    componentDidUpdate(prevProps: FormGastoProps) {
        if (prevProps.gastoId !== this.props.gastoId) {
            if (this.props.gastoId) {
                this.cargarGasto(this.props.gastoId);
            } else {
                this.resetForm();
            }
        }
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

    async guardarGasto(_e: React.MouseEvent, callback: () => void = () => {}) {
        const { id: _id, error } = await saveGasto(this.state.form);

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
        }, callback);
    }

    guardarGastoYCerrar(e: React.MouseEvent) {
        this.guardarGasto(e, this.props.hideModal);
    }

    async cargarGasto(id: string) {
        const { gasto }: { gasto: IGasto } = await loadGasto(id);

        this.setState({
            form: {
                _id: gasto._id,
                pagador: gasto.pagador,
                tipo: gasto.tipo,
                fecha: moment(gasto.fecha).format('yyyy-MM-DD'),
                monto: gasto.monto,
                detalle: gasto.detalle,
                observaciones: gasto.observaciones,
            },
            gastoOriginal: gasto
        });
    }

    resetForm(callback = () => {}) {
        this.setState(
            {
                form: {
                    _id: null,
                    pagador: '',
                    tipo: '',
                    fecha: moment().format('yyyy-MM-DD'),
                    monto: 0,
                    detalle: '',
                    observaciones: '',
                },
                gastoOriginal: {} as IGasto,
            },
            callback
        );
    }

    render() {
        return (
            <Modal show={this.props.showModal} onHide={this.props.hideModal}>
                <Modal.Header>
                    {(this.props.gastoId &&
                        'Editando gasto' ||
                        'Ingresando nuevo gasto')}

                    <button type="button" className="btn btn-close"
                        onClick={this.props.hideModal}
                    ></button>
                </Modal.Header>

                <Modal.Body>
                    <form>
                        <label htmlFor="pagador">Pagador</label>
                        <select
                            className="form-select"
                            id="pagador"
                            value={this.state.form.pagador}
                            onChange={this.onChangeFormField}
                        >
                            <option key="-1" value="">
                                Seleccione Persona
                            </option>
                            {personas.map((persona, index) => (
                                <option key={index} value={persona}>
                                    {persona}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="tipo">Tipo</label>
                        <select
                            className="form-select"
                            id="tipo"
                            value={this.state.form.tipo}
                            onChange={this.onChangeFormField}
                        >
                            <option key="-1" value="">
                                Seleccione Tipo
                            </option>
                            {tipoGastos.map((tipo, index) => (
                                <option key={index} value={tipo}>
                                    {tipo}
                                </option>
                            ))}
                        </select>

                        <label htmlFor="fecha">Fecha</label>
                        <input
                            type="date"
                            className="form-control"
                            id="fecha"
                            value={this.state.form.fecha as string}
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
                    </form>
                </Modal.Body>

                <Modal.Footer>
                    <button type="button" className="btn btn-danger" onClick={this.props.hideModal}>
                        Cerrar
                    </button>

                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={this.guardarGastoYCerrar}
                    >
                        Guardar
                    </button>

                    <button type="button" className="btn btn-primary" onClick={this.guardarGasto}>
                        Guardar y crear otro
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}
