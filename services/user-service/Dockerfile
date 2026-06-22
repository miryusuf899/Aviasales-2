FROM python:3.12-slim

WORKDIR /app
COPY services/common /app/services/common
COPY services/user-service /app/services/user-service
RUN pip install --no-cache-dir -r /app/services/user-service/requirements.txt

ENV PYTHONPATH=/app/services/common:/app/services/user-service
WORKDIR /app/services/user-service
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
