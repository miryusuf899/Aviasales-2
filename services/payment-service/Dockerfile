FROM python:3.12-slim

WORKDIR /app
COPY services/common /app/services/common
COPY services/payment-service /app/services/payment-service
RUN pip install --no-cache-dir -r /app/services/payment-service/requirements.txt

ENV PYTHONPATH=/app/services/common:/app/services/payment-service
WORKDIR /app/services/payment-service
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8004"]
