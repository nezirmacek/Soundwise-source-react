FROM keymetrics/pm2:8-alpine

# create app folder and copy source files
RUN mkdir -p /usr/sounwise
COPY . /usr/soundwise

# install node modules
WORKDIR /usr/soundwise
RUN npm i

# build client bundle
RUN npm run build:staging

# expose port
EXPOSE 3000
