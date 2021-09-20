import moment from 'moment';
import Router from 'next/router';
import React from 'react';
import { Modal } from 'react-bootstrap';
import { saveGasto, loadGasto } from '../pages-lib/gastoService';
import { personas } from '../shared/data/personas';
import { tipoGastos } from '../shared/data/tipoGasto';
import { ApiErrorBody } from '../shared/interfaces/apiErrorbody';
import { IGasto } from '../shared/interfaces/gasto';

interface FormGastoProps {
    gastoId: string;
    showModal: boolean,
    hideModal: () => void, 
}

interface FormGastoState {
    form: IGasto;
    personas: string[];
    gastoOriginal: IGasto;
    alertMsg: string;
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
            personas: [],
            gastoOriginal: {} as IGasto,
            alertMsg: '',
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
        if (this.state.form[currentTarget.id] === undefined) {
            console.error(
                `form field ${currentTarget.id} not registered in form`
            );
            return;
        }

        this.setState({
            form: {
                ...this.state.form,
                [currentTarget.id]: currentTarget.value,
            },
        });
    }

    async guardarGasto(_e: React.MouseEvent, callback: () => void = () => {}) {
        const saveResponse = await saveGasto(this.state.form);

        if (saveResponse.status === 401) {
            await Router.push('/login'); 
            return
        }

        if (!saveResponse.ok) {
            const errorBody: ApiErrorBody = await saveResponse.json();
            console.error(errorBody, saveResponse);
            alert(`Error al guardar gasto (${saveResponse.status}): ${saveResponse.statusText}. ${errorBody.message}` );

            return;
        }

        alert('Gasto guardado');

        this.setState({
            form: {
                ...this.state.form,
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
        try {
            const gastoResponse = await loadGasto(id);

            if (gastoResponse.status === 401) {
                await Router.push('/login');
                return
            }

            if (!gastoResponse.ok) {
                const body: ApiErrorBody = await gastoResponse.json();
                console.error(body)

                alert(`Error al cargar gasto (${gastoResponse.status}): ${gastoResponse.statusText}. ${body.message}` );

                this.props.hideModal();
                return
            }

            let alertMsg = '';

            const { gasto }  = await gastoResponse.json() as { gasto: IGasto };

            if (!tipoGastos.find(tipo => tipo.label.trim().toUpperCase() === gasto.tipo.trim().toUpperCase())) {
                alertMsg = `Tipo de gasto '${gasto.tipo}' no encontrado. Seleccione tipo correspondiente.`;
                gasto.tipo = '';
            }

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
                gastoOriginal: gasto,
                alertMsg,
            });
        } catch (e) {
            console.error(e);
        }
    }

    resetForm() {
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
                                <option key={index} value={tipo.label}>
                                    {tipo.label}
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

                    { this.state.form._id && (
                        <>
                            <hr className="px-4 mb-2"></hr>
                            <small className="text-muted">id: {this.state.form._id}</small>
                        </>
                    )}

                    { this.state.alertMsg && (
                        <div className="alert alert-warning">
                            {this.state.alertMsg}
                        </div>
                    )}
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
