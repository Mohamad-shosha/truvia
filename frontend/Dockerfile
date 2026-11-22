# Stage 1: build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Empty by default: the SPA calls the API on its own origin (/api), which nginx proxies to the backend.
# Same-origin requests keep the HttpOnly SameSite=Strict refresh cookie working without CORS.
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
