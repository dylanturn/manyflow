interface Config {
  database: {
    path: string
  }
  redis: {
    url: string
  }
  auth: {
    jwtSecret: string
    jwtExpiresIn: string
  }
  server: {
    rateLimit: {
      max: number
      windowMs: number
    }
  }
  elasticsearch: {
    node: string
    auth: {
      username: string
      password: string
    }
    indices: {
      logs: string
      dags: string
      tasks: string
    }
  }
}

const config: Config = {
  database: {
    path: process.env.DATABASE_PATH || './data.db'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  server: {
    rateLimit: {
      max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000')
    }
  },
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    auth: {
      username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
      password: process.env.ELASTICSEARCH_PASSWORD || 'changeme'
    },
    indices: {
      logs: 'airflow-logs',
      dags: 'airflow-dags',
      tasks: 'airflow-tasks'
    }
  }
}

export default config
