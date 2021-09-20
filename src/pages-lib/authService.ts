
import jws from 'jws';
import moment from 'moment';

export async function authenticate(authToken: string) {
    const response = await fetch('api/authenticate', {
        method: 'post',
        body: JSON.stringify({ authToken })
    });

    return response.ok;
}

// aux
const authTokenStorageKey = 'authToken';

export function getStoredAuthToken() {
    return localStorage.getItem(authTokenStorageKey) || '';
}

export function storeAuthToken(jwsToken: string) {
    localStorage.setItem(authTokenStorageKey, jwsToken);
}

export function createAuthToken(secret: string) {
    if (!secret) return '';

    return jws.sign({
        header: { alg: 'HS256' },
        payload: {
            src: 'gastos-next',
            exp: moment().add(10, 'days').toDate()
        },
        secret: secret,
    });
}