# VinaCarbon — Vietnam Carbon Stock Monitoring Support System

VinaCarbon is a digital platform designed to support monitoring, learning, and early-stage analysis for carbon and biomass projects in Vietnam. The system reduces technical and informational barriers for organizations and stakeholders who want to participate in the emerging carbon market.

The platform combines satellite-based biomass estimation, an AI-powered knowledge assistant, a centralized policy and methodology knowledge base, and a collaboration community module into a unified ecosystem.

## Overview

VinaCarbon provides four core capabilities:

* Centralized carbon market knowledge base
* AI assistant for carbon market and MRV learning support
* Satellite-based biomass estimation using deep learning
* Community module for coordination and collaboration

The system is designed to complement official MRV and regulatory processes by offering early-stage insights, learning tools, and coordination support.


## Key Features

### Knowledge Base & Search

* Centralized document repository
* Indexed policy and technical documents
* Semantic and keyword search
* Designed to reduce fragmented information access

### AI Assistant

* Domain-focused AI assistant
* Retrieval-augmented responses from curated documents
* Interactive Q&A on carbon markets, MRV, and methodologies

### Biomass Estimation Module

* Satellite-based above-ground biomass estimation
* Multi-sensor data fusion (Sentinel-1 + Sentinel-2 + DEM)
* GEDI-based supervised training labels
* Fully convolutional neural network architecture
* Patch-based prediction workflow

### Community Module

* Community posts and discussions
* Collaboration and cooperative formation support
* Knowledge sharing between stakeholders


## Getting Started

### Prerequisites

* **Microsoft Azure Services**
  * **Azure Blob Storage** for file storages (biomass preliminary estimations, documents, user images, ...)
  * **Azure AI Search** indexing documents from **Azure Blob Storage**
  * **Microsoft Foundry** for developing AI assistant
  * **Azure Cosmos DB** as NoSQL database
* **Google Cloud Services**
  * **Google Auth Platform** for user authentication
  * **Google Earth Engine** for up-to-date satillite imagery


### Installation & Deployment

```bash
git clone https://github.com/Huycuong03/VinaCarbon.git vinacarbon
cd vinacarbon
docker compose up --build
```