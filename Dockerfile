FROM node:16-buster-slim
RUN apt-get update --fix-missing \
&& apt-get install -y ffmpeg graphicsmagick libreoffice libsm6 libxi6 libxext6 imagemagick

WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "./"]
# ENV GENERATE_SOURCEMAP=false
RUN yarn install
COPY . .
RUN yarn run buildServer
EXPOSE 4066
CMD [ "npm", "run","start:prod" ]


# FROM ubuntu:18.04
# RUN apt-get update --fix-missing \
#  && apt-get install -y curl \
#  && curl -sL https://deb.nodesource.com/setup_12.x | bash - \
#  && apt-get install -y nodejs
# RUN apt-get install -y ffmpeg libsm6 libxext6
# RUN npm install -g yarn

# WORKDIR /usr/src/app
# COPY ["package.json", "package-lock.json*", "./"]
# RUN yarn install
# COPY . .
# RUN yarn run buildServer
# EXPOSE 3000
# CMD [ "npm", "run","start:prod" ]
