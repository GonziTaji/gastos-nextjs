import { NextApiRequest, NextApiResponse } from "next";
import { verifyJws } from "../../api-lib/verifyJsw";

export default async function authenticate(req: NextApiRequest, res: NextApiResponse<any>) {
    try {
        switch (req.method) {
            case 'POST': {
                const { authToken } = JSON.parse(req.body);

                if (verifyJws(authToken)) {
                    return res.status(200).json({ message: 'Autorizado' });
                } else {
                    return res.status(401).json({ message: 'No autorizado' });
                }
            }
        }

        return res.status(400).json({ message: 'No admitido' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: 'unexpected server error', error: e });
    }
}