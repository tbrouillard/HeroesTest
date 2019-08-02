## STAGE 1: Build Angular Application ##
FROM node:10.16 as builder

COPY AngEl /AngEl

WORKDIR /AngEl

RUN npm install
RUN $(npm bin)/ng build

## STAGE 2: Run nginx to serve application ##
FROM nginx

RUN apt-get update && apt-get install -y curl && apt-get clean

COPY --from=builder /AngEl/dist/* /usr/share/nginx/html

EXPOSE 80