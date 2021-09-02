export interface TipoGasto {
    label: string;
    iconClass: string;
    color: string;
}

export const tipoGastos = [
    { label: 'Supermercado', iconClass: '', color: '#edbc64' },
    { label: 'Comida Rapida', iconClass: '', color: '#ed6495' },
    { label: 'Sodimac', iconClass: '', color: '#8b008b' },
    { label: 'Farmacia', iconClass: '', color: '#008b00' },
    { label: 'Otro', iconClass: '', color: 'black' },
    { label: 'Abono Deuda', iconClass: '', color: '#8b0000' },
    { label: 'GG.CC.', iconClass: '', color: '#7864ed' },
    { label: 'Internet', iconClass: '', color: '#ed7864' },
    { label: 'Luz', iconClass: '', color: '#daed64' },
    { label: 'Gas', iconClass: '', color: '#64edbc' },
    { label: 'Agua', iconClass: '', color: '#6495ed' },
];

export function colorTipoGasto(tipoGasto: string) {
    const tipo = tipoGastos.find(t => t.label === tipoGasto);
    return tipo && tipo.color || '';
}

