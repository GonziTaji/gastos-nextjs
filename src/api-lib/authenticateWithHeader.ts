import { verifyJws } from './verifyJsw';
import { NextApiRequest } from 'next';

export const authenticateWithHeader = (req: NextApiRequest) => {
    const authorization = req.headers.authorization;

    return authorization && verifyJws(authorization);
};