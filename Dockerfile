FROM gcr.io/distroless/nodejs20-debian12

WORKDIR /app

COPY dist ./dist
COPY server.js ./server.js

EXPOSE 8080

CMD ["server.js"]
