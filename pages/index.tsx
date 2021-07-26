import '../styles/Home.module.scss';
import ListaGastos from './lista-gastos';
import NuevoGasto from './nuevo-gasto';

export default function Home() {
    return (
        <>
            <NuevoGasto></NuevoGasto>
            <ListaGastos></ListaGastos>
        </>
    );
}
