FROM node:18-alpine

WORKDIR /app

# Copy package.json
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the application
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "src/index.js"] 