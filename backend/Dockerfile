# Use official node js runtime as parent image
FROM node:22-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
# '.' refers to the /app in docker
COPY package.json .
COPY package-lock.json .
COPY prisma ./prisma

# Install the dependencies (that are already in the package.json)
RUN npm install && npx prisma generate

# Copy the rest of the application code (copies from the chapter_4 folder to the /app in docker)
COPY . . 

# Expose the port that the app runs on 
EXPOSE 1322

# Define the command to run the application
CMD ["node", "./src/server.js"]