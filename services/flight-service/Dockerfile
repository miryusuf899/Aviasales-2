FROM python:3.12-slim

WORKDIR /app
COPY services/common /app/services/common
COPY services/flight-service /app/services/flight-service
RUN pip install --no-cache-dir -r /app/services/flight-service/requirements.txt

ENV PYTHONPATH=/app/services/common:/app/services/flight-service
WORKDIR /app/services/flight-service
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
