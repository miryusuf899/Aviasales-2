FROM python:3.12-slim

WORKDIR /app
COPY services/common /app/services/common
COPY services/notification-service /app/services/notification-service
RUN pip install --no-cache-dir -r /app/services/notification-service/requirements.txt

ENV PYTHONPATH=/app/services/common:/app/services/notification-service
WORKDIR /app/services/notification-service
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8005"]
