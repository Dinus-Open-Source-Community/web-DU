FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 3000

ENV NEXT_PUBLIC_API_URL=http://backend:8080

CMD ["npm", "run", "dev"]

