## Build stage
FROM node:22-alpine AS build
WORKDIR /app

# OG images are rasterised at build time by Resvg using *system* fonts. Alpine
# ships none, and Resvg draws missing fonts as nothing rather than failing — so
# without this the build succeeds and every social card comes out blank.
RUN apk add --no-cache font-dejavu

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

## Serve stage
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
