# Solo CRM's UI on Cloud Run: Vite builds the static app, nginx serves it on $PORT (8080).
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# The API the UI talks to, and optionally the copilot (Copilot.tsx has the Cloud Run URL as default)
ARG VITE_API_BASE=https://solocrm-amber.vercel.app
ARG VITE_COPILOT_URL
ENV VITE_API_BASE=$VITE_API_BASE VITE_COPILOT_URL=$VITE_COPILOT_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
