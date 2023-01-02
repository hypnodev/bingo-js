import Api from "@/services/Api";
import {AxiosPromise} from "axios";
import {User} from "../../../src/user/entities/user.entity";

export class AuthService extends Api {
    async login(username: string, password: string): AxiosPromise<{ access_token }> {
        return this.httpClient.post<{ access_token }>(`/auth/login`, { username, password });
    }

    async register(username: string, password: string): AxiosPromise<{ access_token }> {
        return this.httpClient.post<{ access_token }>(`/auth/register`, { username, password });
    }

    async me(): AxiosPromise<User> {
        return this.httpClient.get<User>(`/auth/me`);
    }
}
