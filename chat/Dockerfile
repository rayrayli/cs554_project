# Use Node parent image
FROM node:14.0.0-alpine AS alpine

# Set the working directory to /usr/src/chat
WORKDIR /usr/src/chat

# copy package.json into the container at /
COPY package*.json ./

# install dependencies
RUN npm install

# Copy the current directory contents into the container at /usr/src/chat
COPY . .

# Make port 7076 available to the world outside this container
EXPOSE 7076

# Run the react app when the container launches
CMD ["npm", "start"]