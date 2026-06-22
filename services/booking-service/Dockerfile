FROM python:3.12-slim

WORKDIR /app
COPY services/common /app/services/common
COPY services/booking-service /app/services/booking-service
RUN pip install --no-cache-dir -r /app/services/booking-service/requirements.txt

ENV PYTHONPATH=/app/services/common:/app/services/booking-service
WORKDIR /app/services/booking-service
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8003"]
