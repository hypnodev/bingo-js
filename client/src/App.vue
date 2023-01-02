<template>
  <v-app class="mb-9">
    <v-app-bar title="Bingo" class="bg-light-blue-darken-2 mb-9" density="compact" v-if="notInRoom">
      <v-dialog v-model="loginDialog" v-if="!token">
        <template v-slot:activator="{ props }">
          <v-btn  color="primary" variant="elevated" v-bind="props">Login</v-btn>
        </template>

        <v-card>
          <v-card-text>
            <v-form>
              <v-container>
                <v-row>
                  <v-col cols="12" md="4">
                    <v-text-field v-model="username" label="Username" required></v-text-field>
                  </v-col>

                  <v-col cols="12" md="4" >
                    <v-text-field v-model="password" type="password" label="Password" required></v-text-field>
                  </v-col>

                  <v-col cols="12" md="4" >
                    <v-btn color="primary" block @click="login">Login</v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" block @click="loginDialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="registerDialog" v-if="!token">
        <template v-slot:activator="{ props }">
          <v-btn  color="primary" variant="elevated" v-bind="props">Register</v-btn>
        </template>

        <v-card>
          <v-card-text>
            <v-form>
              <v-container>
                <v-row>
                  <v-col cols="12" md="4">
                    <v-text-field v-model="username" label="Username" required></v-text-field>
                  </v-col>

                  <v-col cols="12" md="4" >
                    <v-text-field v-model="password" type="password" label="Password" required></v-text-field>
                  </v-col>

                  <v-col cols="12" md="4" >
                    <v-btn color="primary" block @click="register">Register</v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" block @click="registerDialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-label v-if="token && user">{{ user?.username }}</v-label>
      <v-btn color="primary" variant="elevated" v-if="token && user" @click="logout">Logout</v-btn>
    </v-app-bar>

    <v-main class="app">
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { inject, ref, watch } from "vue";
import { useCookies } from "vue3-cookies";
import { useAuth } from "@/store/auth";
import { useSocket } from "@/store/socket";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";

// Store
const auth = useAuth();
const { user } = storeToRefs(auth);
const socket = useSocket();
const { cookies } = useCookies();
const route = useRoute();

// Services
const services = inject('services');

// Data
const loginDialog = ref(false);
const registerDialog = ref(false);
const username = ref(null);
const password = ref(null);
const token = ref(null);
const notInRoom = ref(true);

// Methods
async function login() {
  const loginResponse = await services?.authService.login(username.value, password.value);
  if (!loginResponse.data.access_token) {
    alert('Login failed');
    return;
  }

  alert('Welcome!');
  token.value = loginResponse.data.access_token;
  cookies.set('token', token.value);
  auth.setUser(loginResponse.data.user);
  loginDialog.value = false;
  window.location.reload();
}

async function register() {
  const registerResponse = await services?.authService.register(username.value, password.value);
  if (!registerResponse.data.access_token) {
    alert('Login failed');
    return;
  }

  alert('Welcome!');
  token.value = registerResponse.data.access_token;
  cookies.set('token', token.value);
  auth.setUser(registerResponse.data.user);
  registerDialog.value = false;
  window.location.reload();
}

async function logout() {
  cookies.remove('token');
  auth.setUser(null);
  token.value = null;
}

if (cookies.get('token')) {
  token.value = cookies.get('token');

  services?.authService.me()
    .then(({ data }) => {
      auth.setUser(data)
      socket.connect(`${process.env.VUE_APP_API_URL || 'http://localhost:3000'}`, token.value);
    });
}

watch(
  () => route.path,
  async path => {
    notInRoom.value = !path.includes('/rooms/')
  }
)
</script>

<style lang="scss">
.app {
  margin: 0 !important;
  padding: 0 !important;
}
.app, table {
  background: #425dff;
}
</style>
