import axios, {AxiosInstance} from "axios";
import cookie from 'cookie';

export default class Api {
    protected httpClient: AxiosInstance;

    constructor() {
        const cookies = cookie.parse(document.cookie);
        const token: string | undefined = cookies.token?.length
            ? `Bearer ${cookies.token}`
            : undefined;

        this.httpClient = axios.create({
            baseURL: `${process.env.VUE_APP_API_URL || 'http://localhost:3000'}/api`,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: token
            }
        });
    }
}
