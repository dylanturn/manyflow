# ManyFlow

ManyFlow is a modern, feature-rich Airflow management system designed to provide data engineers with a unified interface for managing multiple Airflow clusters. Built with Next.js 13+ and TypeScript, it offers a sleek, responsive UI for monitoring and managing your Airflow deployments.

## Features

- **Multi-Cluster Management**
  - View and manage multiple Airflow clusters from a single dashboard
  - Real-time cluster health monitoring
  - Easy endpoint configuration and management

- **DAG Management**
  - View all DAGs across clusters
  - Monitor DAG status and run history
  - View DAG and task metrics
  - Access DAG and task logs
  - Pause/unpause DAGs

- **Monitoring & Metrics**
  - Real-time cluster health status
  - DAG processor logs and metrics
  - Task instance metrics
  - Event trigger logs
  - Cluster component logs

- **Modern UI/UX**
  - Clean, intuitive dashboard
  - Real-time updates
  - Responsive design
  - Dark mode support

## Tech Stack

- **Frontend**
  - Next.js 13+
  - TypeScript
  - TailwindCSS
  - shadcn/ui components
  - Lucide React icons
  - TanStack Query for data fetching

- **Backend**
  - Next.js API routes
  - SQLite database
  - Airflow REST API integration

## Getting Started

1. **Prerequisites**
   - Node.js 16+
   - Access to one or more Airflow instances

2. **Installation**
   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/manyflow.git
   cd manyflow

   # Install dependencies
   npm install

   # Start the development server
   npm run dev
   ```

3. **Configuration**
   - Navigate to the Admin page
   - Add your Airflow endpoints with the required credentials
   - Start monitoring your Airflow clusters

## Authentication

ManyFlow supports multiple authentication methods:
- Basic username/password
- LDAP
- SAML
- OIDC