FROM node:latest

RUN mkdir -p /usr/src/bot

WORKDIR /usr/src/bot

COPY package.json /usr/src/bot

RUN npm install

COPY . /usr/src/bot

ENV DISCORD_TOKEN=OTU3MTMxNTAyMDkxNjU3Mjk2.Gjrmlx.Ih6M1Mw-CdgmeZaZkJgJK8ybP7KCDruQtiRzc0

CMD ["npm", "start"]
