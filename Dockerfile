FROM node:18-alpine

WORKDIR /sandbox

RUN apk add --no-cache dumb-init

COPY package.json* ./

RUN npm install --omit=dev 2>/dev/null || true

ENV NODE_OPTIONS="--max-old-space-size=512"

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node"]


