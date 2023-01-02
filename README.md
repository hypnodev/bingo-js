# Bingo

A fully-working bingo game built in 4 days using [NestJS](https://nestjs.com/), [Vue3](https://vuejs.org/), [SocketIO](https://socket.io/) and [Vuetify](https://next.vuetifyjs.com/en/).

## Installation

```bash
$ npm install
```

## Running the app (Dev)

This repo include a docker-compose to have a temporary MySQL container (at every creation all data inside will be erased),
then copy `.env.example` to `.env` and configure it with your own credentials (btw, if you just copy/paste the config are ready to be used).

Now open your terminal and run 
```shell 
$ docker-compose up -d
$ npm run start:dev
```

And in another terminal you need to run vue frontend:
```shell
$ cd client
$ npm run serve
# $ VUE_APP_API_URL=http://localhost:3000 npm run serve # If you want to change the API_URL 
```

## How to play
#### Host
Go to http://localhost:8080, register/login through the button on top right, then create a room.

Start a match using the red **Housekeeping** button on the bottom left, now volume on and enjoy your match.

Play/pause the match with the violet button on the bottom left.

*Keep in mind*: This game was built to be usable with physical tombola card.
So the right setup is to be in a room with at least 10 people, put how many tombola cards were sold and, put your volume to max, listen the number and pause when someone do BINGO!

With some small changes same thing can be done but without physical cards :) 

## Contribute
Feel free to push any changes, improve anything and fix stuff.  

## Stay in touch
- Author - [Cristian Cosenza](https://linkedin.com/in/cristiancosenza)
