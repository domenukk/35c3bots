FROM ubuntu:18.04
RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get -y install python3 python3-pip curl

# Latest node version
RUN curl -sL https://deb.nodesource.com/setup_11.x | bash -
RUN apt-get -y install nodejs

RUN npm install -g ts-node typescript

COPY . /challenge
WORKDIR /challenge/weelang
RUN npm install
WORKDIR /challenge/pyserver
RUN pip3 install -r ./requirements.txt

# port BOTS
EXPOSE 8075

ENTRYPOINT python3 ./server.py

