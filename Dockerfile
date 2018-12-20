FROM tiangolo/uwsgi-nginx-flask:python3.7

# Latest node version
RUN apt-get -y update && apt-get -y upgrade
RUN apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_11.x | bash -
RUN apt-get -y install nodejs

RUN npm install -g ts-node typescript

# puppeteer/chrome
RUN apt-get install -y libgconf-2-4 wget --no-install-recommends
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge --auto-remove -y curl \
    && rm -rf /src/*.deb

COPY . /app
WORKDIR /app/weelang
RUN npm install
# run puppeteer installer one more time - didn't always do it (?)
RUN npm install puppeteer

WORKDIR /app/pyserver
RUN pip3 install -r ./requirements.txt


# port BOTS
ENV LISTEN_PORT 8075
EXPOSE 8075
