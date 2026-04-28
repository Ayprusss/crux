# Deployment Strategy

This document outlines the planned deployment pipeline for the Crux application once local development is complete. To align with our goal of acquiring high-value, industry-standard skills (especially for backend and DevOps roles), we are avoiding "black-box" platforms and moving toward containerized cloud infrastructure.

## Phase 1: Containerization (Docker)
Before moving to the cloud, the application must be packaged into a standalone environment.

**Objectives:**
- Write a multi-stage `Dockerfile` optimized for Next.js production builds (to keep the image size minimal).
- Create a `.dockerignore` file to prevent pushing unnecessary files (like `node_modules` or local `.env` files) into the image.
- Successfully build and run the Next.js Docker container locally to verify functionality.

**Skills Gained:** Docker, Image Optimization, Containerization.

## Phase 2: Cloud Hosting (Google Cloud Run)
We will deploy the container to Google Cloud Run, a serverless container platform. This introduces us to real-world cloud provider ecosystems without the overhead of manually managing a Kubernetes cluster.

**Objectives:**
- Create a Google Cloud Platform (GCP) project.
- Push our compiled Docker image to the Google Artifact Registry.
- Deploy the container to Cloud Run, ensuring it can scale from zero.
- Securely configure our Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc.) within GCP Secret Manager so our container can access them at runtime.

**Skills Gained:** Cloud Infrastructure (GCP), Serverless Compute, Container Registries, Secret Management.

## Phase 3: CI/CD Pipeline (GitHub Actions)
To mimic a professional development environment, we will automate the deployment so that we don't have to manually build and push images from our local terminal.

**Objectives:**
- Create a `.github/workflows/deploy.yml` file.
- Authenticate GitHub Actions with Google Cloud securely (using Workload Identity Federation).
- Automate the pipeline: when code is merged into the `main` branch, automatically build the new Docker image, push it to the registry, and deploy the new revision to Cloud Run.

**Skills Gained:** Continuous Integration / Continuous Deployment (CI/CD), GitOps, GitHub Actions.
