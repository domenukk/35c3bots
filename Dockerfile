FROM tiangolo/uwsgi-nginx-flask:python3.7

# Latest node version
RUN apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_11.x | bash -
RUN apt-get -y install nodejs

RUN npm install -g ts-node typescript

COPY . /app
WORKDIR /app/weelang
RUN npm install
WORKDIR /app/pyserver
RUN pip3 install -r ./requirements.txt

# port BOTS
ENV LISTEN_PORT 8075
EXPOSE 8075
