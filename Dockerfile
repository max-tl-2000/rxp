FROM registry.corp.reva.tech/ubuntu-18.04:latest

EXPOSE 3535

ENTRYPOINT ["./start.sh"]

HEALTHCHECK --interval=15s --timeout=5s --retries=1 CMD curl -f http://localhost:3535/ping || exit 1

WORKDIR /rxp

COPY ./backend-dist /rxp

RUN ./configure.sh --production=true
