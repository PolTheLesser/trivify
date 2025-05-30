FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Upgrade npm before installing dependencies
RUN npm install -g npm@11.4.1

# Install dependencies
RUN npm install

# Copy rest of the frontend code
COPY . .

# Build the React app
RUN npm run build

# Optional: expose port (if used in dev/server container)
EXPOSE 3000

# Start command (if relevant)
CMD ["npm", "start"]
