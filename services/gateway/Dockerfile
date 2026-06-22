FROM python:3.12-slim

WORKDIR /app
COPY services/common /app/services/common
COPY services/gateway /app/services/gateway
RUN pip install --no-cache-dir -r /app/services/gateway/requirements.txt

ENV PYTHONPATH=/app/services/common:/app/services/gateway
WORKDIR /app/services/gateway
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
