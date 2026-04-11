FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=7860

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user (Hugging Face Spaces UID 1000 requirement)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR /app

# Copy dependency definition and install
COPY --chown=user:user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy API service source code
COPY --chown=user:user main.py .
COPY --chown=user:user routes/ ./routes/

# Copy precomputed ML JSON artifacts
COPY --chown=user:user artifacts/ /app/artifacts/
COPY --chown=user:user artifacts/ /app/ml/artifacts/

# Expose port for Hugging Face Spaces
EXPOSE 7860

# Start FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
