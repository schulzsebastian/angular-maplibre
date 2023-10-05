FROM node:lts-slim
RUN apt-get update && apt-get install -y wget gnupg2
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo "deb http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list
RUN apt-get update && apt-get install -y google-chrome-stable xvfb
RUN npm install -g @angular/cli
COPY /serve.sh /usr/bin/serve
COPY /test.sh /usr/bin/test
RUN chmod +x /usr/bin/serve
RUN chmod +x /usr/bin/test
COPY ./angular-maplibre/package.json /angular-maplibre/package.json
WORKDIR /angular-maplibre
RUN npm i
COPY ./angular-maplibre /angular-maplibre
CMD ["serve"]