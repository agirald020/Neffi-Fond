FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY vite.config.ts tsconfig.json postcss.config.cjs tailwind.config.ts components.json ./
COPY client ./client
COPY shared ./shared

RUN npm ci
RUN npm run build

FROM nginx:1.27-alpine
ENV TZ=America/Bogota

RUN apk add --no-cache tzdata \
    && ln -snf /usr/share/zoneinfo/${TZ} /etc/localtime \
    && echo ${TZ} > /etc/timezone

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html

EXPOSE 5050
CMD ["nginx", "-g", "daemon off;"]
