<template>
  <div class="d-flex flex-column">
    <div class="d-none d-md-inline-flex d-lg-inline-flex flex-row" style="width: 100%;">
      <div class="d-flex flex-column flex-grow-1" style="width: 23%">
        <div class="ball">
          <label>{{ lastCalledNumber }}</label>
        </div>
        <h2 class="text-center text-white font-weight-bold">Numeri estratti: {{ calledNumbers.length }}</h2>

        <div class="d-flex flex-row">
          <div class="little-ball" v-for="number in calledNumbers.slice(-3)" :key="number">
            <label>{{ number }}</label>
          </div>
        </div>

        <div class="mt-4 d-flex flex-column bingo-prizes text-center">
          <div class="d-flex flex-column bingo-one mb-3">
            <h1>Bingo ONE</h1>
            <table>
              <tr>
                <td style="padding:  0">€ {{ roomPrize?.onePrice || 1 }}</td>
                <td style="padding: 0">{{ roomPrize?.oneBalls || 70 }}</td>
              </tr>
              <tr>
                <td colspan="2" class="matches-left" v-if="matchesLeftForBingoOne >= 1">
                  <label>Partite rimanenti</label> {{ matchesLeftForBingoOne }}
                </td>
              </tr>
            </table>
          </div>

          <div class="d-flex flex-column super-bingo mt-2 mb-3">
            <h1>Super bingo</h1>
            <table>
              <tr>
                <td>€ {{ roomPrize?.superPrice || 1 }}</td>
                <td>{{ roomPrize?.superBalls || 48 }}</td>
              </tr>
            </table>
          </div>

          <div class="d-flex flex-column bingo-bronze mt-2">
            <h1>Bronzo</h1>
            <table>
              <tr>
                <td>€ {{ roomPrize?.bronzePrice || 1 }}</td>
                <td>{{ roomPrize?.bronzeBalls || 46 }}</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="mt-8" v-if="user?.id === room?.owner.id">
          <v-dialog v-model="housekeepingDialog">
            <template v-slot:activator="{ props }">
              <v-btn color="error" variant="elevated" v-bind="props">
                <v-icon icon="mdi-lock"></v-icon>
                Housekeeping
              </v-btn>
            </template>

            <v-sheet class="d-flex flex-row">
              <v-form class="flex-grow-1">
                <v-card>
                  <v-card-title>Start new match</v-card-title>

                  <v-card-text>
                    <v-row>
                      <v-col cols="12" md="4">
                        <v-text-field v-model="soldCards" label="Cards sold" required></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col cols="12" md="4">
                        <v-btn color="secondary" block  @click="newMatch">Start new match</v-btn>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-form>

              <v-form class="flex-grow-1 ml-2">
                <v-card>
                  <v-card-title></v-card-title>
                </v-card>
                <v-container>
                  <v-row>
                    <v-col cols="12" md="4">
                      <v-text-field v-model="ticketPrice" label="Ticket price" required></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12" md="4">
                      <v-btn color="primary" block @click="setupPrice">Setup price</v-btn>
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>

              <v-form class="flex-grow-1">
                <v-container>
                  <v-row>
                    <v-col cols="12" md="4">
                      <v-radio-group v-model="prizeToReset">
                        <v-radio label="Bingo one" value="bingo-one"></v-radio>
                        <v-radio label="Super bingo" value="super-bingo"></v-radio>
                        <v-radio label="Bingo bronzo" value="bingo-bronze"></v-radio>
                      </v-radio-group>
                    </v-col>
                  </v-row>

                  <v-row>
                    <v-col cols="12" md="4">
                      <v-btn color="primary" block @click="resetPrize">Reset prize</v-btn>
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>

              <v-form class="flex-grow-1" v-if="currentMatchId !== null">
                <v-container>
                  <v-row>
                    <v-col cols="12" md="4">
                      <v-list>
                        <v-list-item>
                          <v-list-item-title>Match:</v-list-item-title>
                          #{{ currentMatchId }}
                        </v-list-item>
                      </v-list>
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </v-sheet>

            <div class="pt-4 bg-white">
              <v-btn color="primary" block variant="flat" @click="housekeepingDialog = false">Close</v-btn>
            </div>
          </v-dialog>

          <v-btn color="primary" variant="elevated" @click="pauseMatch" v-if="matchStatus === 'play'" class="ml-2">
            <v-icon icon="mdi-pause"></v-icon>
          </v-btn>

          <v-btn color="primary" variant="elevated" @click="playMatch" v-if="matchStatus === 'pause'" class="ml-2">
            <v-icon icon="mdi-play"></v-icon>
          </v-btn>
        </div>
      </div>

      <div class="d-lg-inline-flex flex-column flex-grow-1 pl-md-4 pl-lgbingo-one-ready-player-4 ml-md-4 ml-lg-4" style="width: 100%">
        <v-container>
          <v-table class="series">
            <tbody>
              <tr v-for="(tableRow, index) in tableRows" :key="index">
                <td class="number" v-for="cellNumber in tableRow" :key="cellNumber" :class="{ calledNumber: wasNumberCalled(cellNumber) }">
                  {{ cellNumber }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-container>
      </div>
      <button ref="fakeBtn" hidden></button>
      <audio id="bingo-one-ready-player" src="http://localhost:8081/audio/bingo-one-ready-player.mp3"></audio>
      <audio id="bingo-open-player" src="http://localhost:8081/audio/open.mp3"></audio>
      <audio id="bingo-background-player" src="http://localhost:8081/audio/background1.mp3"></audio>
    </div>
    <div class="d-sm-block d-md-none d-lg-none">
      <div class="d-flex flex-column flex-grow-1" style="width: 100%">
        <div class="ball">
          <label>{{ lastCalledNumber }}</label>
        </div>
        <h2 class="text-center text-white font-weight-bold">Numeri estratti: {{ calledNumbers.length }}</h2>

        <div class="d-flex flex-row">
          <div class="little-ball" v-for="number in calledNumbers.slice(-3)" :key="number">
            <label>{{ number }}</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed, inject, onMounted, Ref, ref } from "vue";
import { onBeforeRouteLeave, useRoute } from "vue-router";
import { useSocket } from "@/store/socket";
import {
  BINGO_ONE_STARTED_EVENT,
  EXTRACTED_NUMBERS_EVENT, NEW_MATCH_EVENT,
  NEW_MATCH_STARTED_EVENT, ON_ENTER_ROOM_EVENT, ON_EXIT_ROOM_EVENT, PAUSE_MATCH_EVENT, PLAY_MATCH_EVENT,
  PLAYER_JOINED_EVENT
} from "../../../src/sockets/consts/sockets.const";
import { Room } from "../../../src/room/entities/room.entity";
import { Services } from "@/services";
import { BINGO_ONE_MIN_MATCHES } from "../../../src/room/consts/room.consts";
import { RoomPrize } from "../../../src/room/entities/room-prize.entity";
import { Match } from "../../../src/match/entities/match.entity";
import { useAuth } from "@/store/auth";

// Store
const route = useRoute();
const socket = useSocket();
const {  user  } = useAuth();
const { client } = socket;

// Data
const tableRows = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  [21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
  [31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
  [41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
  [51, 52, 53, 54, 55, 56, 57, 58, 59, 60],
  [61, 62, 63, 64, 65, 66, 67, 68, 69, 70],
  [71, 72, 73, 74, 75, 76, 77, 78, 79, 80],
  [81, 82, 83, 84, 85, 86, 87, 88, 89, 90],
];
const lastCalledNumber: Ref<number> = ref(0);
const calledNumbers: Ref<number[]> = ref([]);
const players: Ref<string[]> = ref([]);
const voices = window.speechSynthesis.getVoices();
const wasNumberCalled = computed(() => num => calledNumbers.value.includes(num));
const services: Services | undefined = inject<Services>('services');
const room: Ref<Room | null> = ref(null);
const roomPrize: Ref<RoomPrize | null> = ref(null);
const matches: Ref<Match[]> = ref([]);
const currentMatchId: Ref<number | null> = ref(null);
const matchStatus: Ref<string> = ref('play');
const ticketPrice: Ref<number> = ref(0);
const soldCards: Ref<number> = ref(0);
const prizeToReset: Ref<string | null> = ref(null);
const housekeepingDialog: Ref<boolean> = ref(false);
const matchesLeftForBingoOne: Ref<number> = computed(() => BINGO_ONE_MIN_MATCHES - (matches?.value?.length || 0));

// Template ref
const fakeBtn: Ref<HTMLButtonElement | null> = ref(null);

services?.roomService.show(+route.params.roomId)
  .then(({ data }) => {
    room.value = data;
    roomPrize.value = data.roomPrize;
    matches.value = data.matches || [];
    currentMatchId.value = room.value?.currentMatch?.id;
    calledNumbers.value = data?.currentMatch?.matchNumbers?.map(matchNumber => matchNumber.number) || [];
    lastCalledNumber.value = calledNumbers.value.slice(-1)[0] || 0;
    toggleBackgroundMusic();
  });

// Methods
function callNumber(number: number) {
  lastCalledNumber.value = number;

  let msg = new SpeechSynthesisUtterance(number.toString())
  msg.voice = voices[0];
  msg.lang = 'it-IT';
  msg.volume = 1;
  msg.pitch = 1;
  msg.rate = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(msg);

  calledNumbers.value.push(number);
}
function newMatch() {
  client?.emit(NEW_MATCH_EVENT, { roomId: +route.params.roomId, soldCards: soldCards.value });
  housekeepingDialog.value = false;
}
function playMatch() {
  matchStatus.value = 'play';
  client?.emit(PLAY_MATCH_EVENT, { matchId: currentMatchId.value, room: room.value?.id })
  toggleBackgroundMusic();
}
function pauseMatch() {
  matchStatus.value = 'pause';
  client?.emit(PAUSE_MATCH_EVENT, { matchId: currentMatchId.value })
  toggleBackgroundMusic();
}
function setupPrice() {
  services?.roomService.ticketPrice(room.value!.id, ticketPrice.value)
    .then(({ data }) => {
      if((data.matches || []).length >= 1) {
        soldCards.value = matches.value.find(match => match.id === currentMatchId.value)!.soldCards;
      }
      // newMatch()
      housekeepingDialog.value = false
    })
    .catch(console.error)
}
function resetPrize() {
  if (prizeToReset.value === null) {
    return;
  }

  services?.roomService.resetPrize(room.value!.id, prizeToReset.value!)
    .then(({ data }) => {
      roomPrize.value = data.roomPrize;
      housekeepingDialog.value = false;
    })
    .catch(console.error)
}
function toggleBackgroundMusic() {
  const audio = document.getElementById('bingo-background-player') as HTMLAudioElement;
  audio.volume = 0.2;
  audio.loop = true;
  if (audio) {
    //audio.paused ? audio.play() : audio.pause();
  }
}

// Events
onMounted(() => fakeBtn?.value?.click())
onBeforeRouteLeave((to, from) => {
  client?.emit(ON_EXIT_ROOM_EVENT, { roomId: +route.params.roomId });
})

// Sockets
client?.emit(ON_ENTER_ROOM_EVENT, { roomId: +route.params.roomId });
client?.on(EXTRACTED_NUMBERS_EVENT, ({ matchId, number }) => {
  if (matchId === currentMatchId.value) {
    callNumber(number);
  }
});
client?.on(PLAYER_JOINED_EVENT, ({ username }) => {
  players.value.push(username);
});
client?.on(NEW_MATCH_STARTED_EVENT, ({ matchId, room }) => {
  console.info('New match has been started', matchId, room)

  currentMatchId.value = matchId;
  calledNumbers.value = [];
  lastCalledNumber.value = 0;
  room.value = room;
  roomPrize.value = room.roomPrize;
  matches.value = room.matches;
  matchStatus.value = 'play'

  const audio = document.getElementById('bingo-open-player');
  if (audio) {
    (audio as HTMLAudioElement).play()
  }
  toggleBackgroundMusic();
});
client?.on(BINGO_ONE_STARTED_EVENT, () => {
  console.info('Bingo one is ready from now!');

  const audio = document.getElementById('bingo-one-ready-player');
  if (audio) {
    //(audio as HTMLAudioElement).play()
  }
})
</script>

<style lang="scss">
.ball {
  display: block;
  width: 250px;
  height: 250px;
  margin: 30px auto 0;
  background-color: #3b4ba3;
  border-radius: 50%;
  box-shadow: inset -25px -25px 40px rgba(0,0,0,.5);
  background-image: -webkit-linear-gradient(-45deg, rgba(255,255,220,.3) 0%, transparent 100%);
  background-image: -moz-linear-gradient(-45deg, rgba(255,255,220,.3) 0%, transparent 100%);
  background-image: -o-linear-gradient(-45deg, rgba(255,255,220,.3) 0%, transparent 100%);
  background-image: -ms-linear-gradient(-45deg, rgba(255,255,220,.3) 0%, transparent 100%);

  label {
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    font-size: 12rem;
  }
}

table {
  background: black;
  border: 8px groove #9E9E9E;
}

.little-ball {
  display: inline-block;
  width: 80px;
  height: 80px;
  margin: 30px auto 0;
  background-color: #3b4ba3;
  border-radius: 50%;
  box-shadow: inset -25px -25px 40px rgba(0,0,0,.5);
  background-image: -webkit-linear-gradient(-45deg, rgba(255,255,220,.3) 0%, transparent 100%);
  background-image: -moz-linear-gradient(-45deg, rgba(255,255,220,.3) 0%, transparent 100%);
  background-image: -o-linear-gradient(-45deg, rgba(255,255,220,.3) 0%, transparent 100%);
  background-image: -ms-linear-gradient(-45deg, rgba(255,255,220,.3) 0%, transparent 100%);

  label {
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    font-size: 3rem;
  }
}

.number {
  font-size: 4.5rem !important;
  font-family: 'alarm clock', sans-serif;
  color: #484848;
}

.calledNumber {
  color: red;
  font-weight: bold;
  animation: blinker 1s linear 1.5;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}

.bingo-prizes {
  color: white;

  td {
    padding: 14px;
    font-size: 3.2rem !important;
    font-family: 'alarm clock', sans-serif;
    font-weight: bold;
  }

  h1 {
    margin-bottom: 10px;
    text-transform: uppercase;
    font-size: 2.5rem !important;
  }

  .matches-left {
    font-size: 3rem !important;
    padding: 0 !important;

    label {
      font-size: 1.7rem !important;
      font-family: "Roboto", sans-serif !important;
    }
  }
}

.room-stats {
  color: white
}
.v-container {
  padding: 0 !important;
}
</style>
