FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libexpat1 \
    libgdal-dev \
    gdal-bin \
    && rm -rf /var/lib/apt/lists/*

ENV GDAL_DATA=/usr/share/gdal
ENV PROJ_LIB=/usr/share/proj

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]