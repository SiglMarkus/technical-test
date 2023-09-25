ARG CONFIGURATION='prod'
# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM node:18.12.0-alpine3.16 as buildProduction
# Set the working directory
WORKDIR /usr/local/app

# copy package json
COPY package*.json ./
RUN npm install

# Add the source code to app
COPY ./ /usr/local/app/

# Generate the build of the application
RUN npm run build -- --configuration=$CONFIGURATION --output-path=dist --output-hashing=all

# Stage 2: Serve app with httpd server

# Use official nginx image as the base image
FROM nginx:latest as production

COPY /nginx.conf  /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy the build output to replace the default nginx content
COPY --from=buildProduction /usr/local/app/dist/ .

# set environment variables and start nginx server
CMD ["/bin/sh",  "-c",  "exec nginx -g 'daemon off;'"]
