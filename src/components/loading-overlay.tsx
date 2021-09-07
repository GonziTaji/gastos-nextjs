import React from 'react';

interface LoadingOverlayProps {
    message: string;
    iconClass: string;
    show: boolean;
}

export default function LoadingOverlay(props: LoadingOverlayProps) {
    const message = props.message.trim() || 'Cargando';
    const iconClass = props.iconClass.trim() || 'spinner-border';

    return <div hidden={!props.show} className="fixed-top w-100 h-100" style={{
        position: 'fixed',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#ffffff80',
        zIndex: 1001, // 1000 max of bootstrap
        cursor: 'progress',
    }}>
        <div className="h-100 row align-items-center">
            <div className="col text-center" style={{ fontSize: '3rem' }}>
                <i className={iconClass}></i>
                <p>{message}</p>
            </div>
        </div>
    </div>
}