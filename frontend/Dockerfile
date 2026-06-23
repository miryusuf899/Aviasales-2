FROM node:22-alpine

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./

ENV VITE_API_BASE_URL=http://localhost:8000/api
ENV VITE_USE_MOCK_FALLBACK=false

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
