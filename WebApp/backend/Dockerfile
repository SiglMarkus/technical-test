# Stage 1: Compile and Build codebase

# Use official node image as the base image
FROM node:18.12.0-alpine3.16 as buildProduction

# Set the working directory
WORKDIR /usr/src/app

# copy necessary files for building and install
COPY package.json package-lock.json nest-cli.json ./

# Install all the dependencies
RUN npm ci && npm cache clean --force

# Add the source code to app
COPY ./ /usr/src/app/

# Generate the build of the application
RUN npm run build

# Stage 2: copy all necessary files to output container

FROM node:18.12.0-alpine3.16 as production

WORKDIR /usr/src/app

# setup typeorm globally
RUN npm i -g typeorm ts-node

# Copy the bundled code from the build stage to the production image
COPY --from=buildProduction /usr/src/app/node_modules ./node_modules
COPY --from=buildProduction /usr/src/app/dist ./dist

# Start the server using the build
CMD [ "node", "dist/main.js" ]
