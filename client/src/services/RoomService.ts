import Api from "@/services/Api";
import {Room} from "../../../src/room/entities/room.entity";
import {AxiosPromise} from "axios";

export default class RoomService extends Api {
    public index(): AxiosPromise<Room[]> {
        return this.httpClient.get<Room[]>('/rooms');
    }

    public create(name: string): AxiosPromise<Room> {
        return this.httpClient.post<Room>(`/rooms`, { name });
    }

    public show(roomId: number): AxiosPromise<Room> {
        return this.httpClient.get<Room>(`/rooms/${roomId}`);
    }

    public ticketPrice(roomId: number, ticketPrice: number) {
        return this.httpClient.post<Room>(`/rooms/${roomId}/ticket-price`, { ticketPrice });
    }

    public resetPrize(roomId: number, prizeToReset: string) {
        return this.httpClient.post<Room>(`/rooms/${roomId}/reset-prize`, { prizeToReset });
    }
}
