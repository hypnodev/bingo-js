import Api from "@/services/Api";
import {User} from "../../../src/user/entities/user.entity";
import {AxiosPromise} from "axios";

export class UserService extends Api {
    public show(address: string): AxiosPromise<User> {
        return this.httpClient.get<User>(`/users/${address}`);
    }

    public create(address: string): AxiosPromise<User> {
        return this.httpClient.post<User>(`/users`, { address });
    }
}
