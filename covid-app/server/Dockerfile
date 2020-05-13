# Use a lighter version of Node as a parent image
FROM node:14.0.0-alpine AS alpine

# Set the working directory to /server
WORKDIR /usr/src/server

# copy package.json into the container at /server
COPY package*.json ./

# packages needed for bcrypt.js (https://github.com/kelektiv/node.bcrypt.js/wiki/Installation-Instructions)
RUN apk --no-cache add --virtual builds-deps build-base python

# install dependencies
RUN npm install

# force recompiling the bcrypt native addon (https://github.com/kelektiv/node.bcrypt.js/wiki/Installation-Instructions)
RUN npm rebuild bcrypt --build-from-source

# Copy the current directory contents into the container at /server
COPY . .

# Make port 3001 available to the world outside this container
EXPOSE 3001

# Run the app when the container launches
CMD npm run seed && npm run dev