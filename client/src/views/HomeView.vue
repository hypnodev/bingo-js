<template>
  <div>
    <div class="d-flex flex-wrap mt-8">
      <v-card class="ma-2 pa-2" v-for="(room, index) in rooms" :title="room.name" :key="index">
<!--        <v-card-text>-->
<!--          <v-icon icon="mdi-account"></v-icon>-->

<!--          <strong>-->
<!--            Players: {{ room.currentPlayers }} / {{ room.maxPlayers }}-->
<!--          </strong>-->
<!--        </v-card-text>-->

        <v-card-actions class="text-center">
          <v-btn color="primary" variant="elevated" :block="true" @click="join(room.id)" :disabled="!logged">Join!</v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <v-card class="pa-12" v-if="logged">
        <v-card-title>Create a room </v-card-title>
        <v-card-text>
          <v-form>
            <v-container>
              <v-row>
                <v-col
                    cols="12"
                    md="4"
                >
                  <v-text-field
                      v-model="createRoom.name"
                      label="Room name"
                      required
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-btn class="ma-2" @click="create">
                    Create
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { inject, Ref, ref } from "vue";
import { Room } from "../../../src/room/entities/room.entity";
import { useAuth } from "@/store/auth";
import { Services } from "@/services";
import { useRouter } from "vue-router";
import { useSocket } from "@/store/socket";
import { NEW_ROOM_AVAILABLE_EVENT } from "../../../src/sockets/consts/sockets.const";
import { storeToRefs } from "pinia";

// Store
const auth = useAuth();
const { logged } = storeToRefs(auth);
const router = useRouter();
const socket = useSocket();
const { client } = socket;

// Data
const createRoom = ref({ name: '' });
const rooms: Ref<Room[]> = ref([]);
const services: Services | undefined = inject<Services>('services');

if (logged.value) {
  client?.on(NEW_ROOM_AVAILABLE_EVENT, async () => {
    console.debug('Rooms reloaded.')
    await index();
  });
}

// Methods
async function index() {
  const availableRooms = await services?.roomService.index();
  rooms.value = availableRooms?.data || [];
}

async function create() {
  try {
    const createdRoom = await services?.roomService.create(createRoom.value.name);
    if (!createdRoom) {
      return;
    }

    await index();
    await join(createdRoom.data.id);
  } catch (err) {
    alert(err);
  }
}

async function join(roomId: number) {
  router?.push({ name: 'rooms', params: { roomId } });
}

index();
</script>
