import jws from 'jws';
import moment from 'moment';

export const verifyJws = (signature: string) => {
    if (!process.env.AUTH_SECRET || !signature) {
        return false;
    }

    if (!jws.isValid(signature) || !jws.verify(signature, 'HS256', process.env.AUTH_SECRET)) {
        return false;
    }

    try {
        const payload = JSON.parse(jws.decode(signature).payload);

        if (payload.src !== 'gastos-next' || moment(payload.exp).isBefore(moment())) {
            return false
        }

    } catch (e) {
        return false;
    }

    return true;
};
