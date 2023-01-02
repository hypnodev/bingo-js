import {App} from "vue";
import RoomService from "@/services/RoomService";
import {UserService} from "@/services/UserService";
import {AuthService} from "@/services/AuthService";
import io from 'socket.io-client';
import cookie from "cookie";

export interface Services {
    roomService: RoomService,
    userService: UserService,
    authService: AuthService,
}

export default {
    install: (app: App, options: any) => {
        app.provide('services', {
            roomService: new RoomService(),
            userService: new UserService(),
            authService: new AuthService(),
        });
    },
};
