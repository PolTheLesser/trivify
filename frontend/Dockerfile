FROM node:20-alpine AS build
RUN apt-get update && \
    apt-get install -y --no-install-recommends wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Upgrade npm before installing dependencies
RUN npm install -g npm@11.4.1

# Install dependencies
RUN npm install

# Copy rest of the frontend code
COPY . .

# hier Umgebungsvariable setzen
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ARG REACT_APP_MAIL
ENV REACT_APP_MAIL=$REACT_APP_MAIL

RUN npm run build

# Dann statisches Frontend in nginx packen
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
