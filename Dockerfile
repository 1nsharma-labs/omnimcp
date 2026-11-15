FROM node:24-alpine
WORKDIR /app
COPY package.json ./
COPY core ./core
COPY ee ./ee
COPY ui ./ui
RUN npm link
EXPOSE 9090
ENTRYPOINT ["omnimcp"]
CMD ["serve", "9090"]
