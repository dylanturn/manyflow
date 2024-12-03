# ManyFlow

ManyFlow is a modern, feature-rich Airflow management system designed to provide data engineers with a unified interface for managing multiple Airflow clusters. Built with Next.js 13+ and TypeScript, it offers a sleek, responsive UI for monitoring and managing your Airflow deployments.

The Airflow API specification can be found [here](v1.yaml).

# UX/UI Style Guidelines

**Important:** When being asked to implement a new feature, please consider how the user will interact with the tool.

1. Use Tailwind CSS for styling, lucide-react for icons, and shadcn/ui for components.
2. Ensure that the UI is responsive and accessible for all users.
3. Provide clear and concise instructions for users to navigate the tool.
4. Use a color scheme that is visually appealing and easy to distinguish from the background.
5. Use a consistent color scheme across the entire application.
6. Use a consistent font across the entire application.
7. Use a consistent spacing and layout across the entire application.
8. Use a consistent UI theme across the entire application.

## Documentation Guidelines

When documenting the codebase, please ensure that the following guidelines are followed:
- **IMPORTANT:** The single most important piece of information to convey to the user is the purpose of the code.
- Documentation must be written in a clear and concise manner.

- All other documentation must be written in markdown.

## Coding Guidelines

When making changes to the codebase, please ensure that the following guidelines are followed:
- **Important:** Only the minimum necessary changes should be made to the codebase.
- Add semantic `data-kind` attributes to all top-level HTML elements for clarity and testability.
- When making files, please consider the following modern React architecture principles:
   1. Split into feature-based modules:
      - Core logic
      - State management (actions/reducers)
      - Event handlers
      - Types/interfaces

   2. Implement clean architecture:
      - Separate UI from business logic
      - Use custom hooks for reusability
      - Add proper TypeScript types
      - Follow Redux Toolkit patterns
      - Use consistent naming   

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