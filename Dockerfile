FROM node:alpine
ENV DockerfileVersion 3

WORKDIR /home/sync-eventbrite-to-discord
COPY . .

RUN npm install --global ts-node @swc/core typescript
RUN npm install --ignore-scripts

COPY ./schedules/daily /etc/periodic/daily
RUN chmod +x /etc/periodic/daily/*

COPY ./schedules/weekly /etc/periodic/weekly
RUN chmod +x /etc/periodic/weekly/*

COPY ./schedules/hourly /etc/periodic/hourly
RUN chmod +x /etc/periodic/hourly/*

COPY ./schedules/15min /etc/periodic/15min
RUN chmod +x /etc/periodic/15min/*

CMD crond -f