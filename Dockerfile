## STAGE 1: Build Angular Application ##
FROM node:8 as builder

COPY AngEl /AngEl

WORKDIR /AngEl

RUN npm install
RUN $(npm bin)/ng build

## STAGE 2: Run nginx to serve application ##
FROM nginx

COPY --from=builder /AngEl/dist/* /usr/share/nginx/html

EXPOSE 80