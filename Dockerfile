FROM node:18

WORKDIR /myApp

COPY . /myApp

RUN npm install


EXPOSE 5173

CMD ["npm", "run" , "dev"]