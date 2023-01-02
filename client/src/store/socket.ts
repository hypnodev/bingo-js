import { defineStore } from "pinia";
import io, { Socket } from "socket.io-client";
import { ref, Ref } from "vue";

export const useSocket = defineStore('socket', () => {
  const client: Ref<Socket | null> = ref(null);

  function connect(uri: string, token?: string) {
    client.value = io(uri, {
      auth: {
        Bearer: token
      }
    });
  }

  return { client, connect };
})
