FROM python:3.11-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1

RUN pip install --no-cache-dir uv

COPY pyproject.toml /app/pyproject.toml
RUN uv pip compile /app/pyproject.toml -o /app/requirements.txt  && uv pip install --system -r /app/requirements.txt

COPY app /app/app

EXPOSE 8081
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8081"]
