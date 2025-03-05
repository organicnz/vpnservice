# VPN Service Blueprint

This document outlines the architectural vision, technical decisions, and future roadmap for the VPN Subscription Service.

## System Architecture

```
┌─────────────────────────────────────┐
│           Client Interfaces         │
│  ┌─────────┐  ┌─────────┐  ┌─────┐  │
│  │ Web App │  │Telegram │  │ API │  │
│  │(Next.js)│  │  Bot    │  │Clients│
│  └────┬────┘  └────┬────┘  └───┬─┘  │
└───────┼─────────────┼──────────┼────┘
         │             │          │     
┌────────┼─────────────┼──────────┼────┐
│      ┌─┴─────────────┴──────────┴─┐  │
│      │        API Gateway         │  │
│      └─┬─────────────┬────────────┘  │
│        │             │               │
│  ┌─────┴──────┐ ┌────┴─────────┐    │
│  │  Auth API  │ │ Subscription │    │
│  │            │ │     API      │    │
│  └─────┬──────┘ └────┬─────────┘    │
│        │             │              │
│  ┌─────┴──────┐ ┌────┴─────────┐    │
│  │  Supabase  │ │   Payment    │    │
│  │(Auth & DB) │ │  Provider    │    │
│  └────────────┘ └──────────────┘    │
└─────────────────────────────────────┘
                   │                    
┌──────────────────┼──────────────────┐
│  ┌───────────────┴───────────────┐  │
│  │         VPN Servers           │  │
│  │  ┌─────────┐   ┌─────────┐    │  │
│  │  │ Server 1│...│ Server n│    │  │
│  │  └─────────┘   └─────────┘    │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Core Components

1. **Client Interfaces**
   - Web application built with Next.js
   - Telegram bot for user interactions
   - API clients for third-party integrations

2. **Backend Services**
   - Auth API: Manages authentication and authorization
   - Subscription API: Handles subscription lifecycle and billing
   - VPN Management API: Provisions and manages VPN credentials

3. **Data Storage**
   - Supabase for user data, authentication, and subscriptions
   - Dedicated storage for VPN configurations and logs

4. **VPN Infrastructure**
   - Multiple VPN servers across different regions
   - Load balancing and failover mechanisms

## Database Schema

### Users Table
```
id              UUID PRIMARY KEY
email           TEXT UNIQUE
full_name       TEXT
created_at      TIMESTAMP
last_login      TIMESTAMP
status          ENUM (active, suspended, deleted)
```

### Subscriptions Table
```
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
plan_id         UUID REFERENCES plans(id)
status          ENUM (active, cancelled, expired)
start_date      TIMESTAMP
end_date        TIMESTAMP
recurring       BOOLEAN
payment_method  TEXT
```

### Plans Table
```
id              UUID PRIMARY KEY
name            TEXT
description     TEXT
price           DECIMAL
duration_days   INTEGER
data_limit_gb   INTEGER
concurrent_connections INTEGER
features        JSONB
```

### VPNCredentials Table
```
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
subscription_id UUID REFERENCES subscriptions(id)
server_id       UUID REFERENCES vpn_servers(id)
username        TEXT
password        TEXT ENCRYPTED
config          TEXT ENCRYPTED
created_at      TIMESTAMP
expires_at      TIMESTAMP
```

### Payments Table
```
id              UUID PRIMARY KEY
user_id         UUID REFERENCES users(id)
subscription_id UUID REFERENCES subscriptions(id)
amount          DECIMAL
currency        TEXT
status          ENUM (pending, completed, failed, refunded)
provider        TEXT
provider_id     TEXT
created_at      TIMESTAMP
```

## Technology Stack

### Frontend
- **Framework**: Next.js
- **State Management**: React Query, Context API
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **API Documentation**: OpenAPI/Swagger
- **Authentication**: JWT, Supabase Auth

### Database
- **Primary Database**: PostgreSQL (via Supabase)
- **Caching**: Redis

### DevOps
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus, Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

## Security Considerations

1. **Authentication & Authorization**
   - JWT tokens with appropriate expiration
   - Role-based access control
   - Two-factor authentication for admin access

2. **Data Protection**
   - Encryption at rest for sensitive data
   - TLS for all communications
   - Regular security audits

3. **VPN Security**
   - Modern encryption protocols (WireGuard/OpenVPN)
   - Perfect forward secrecy
   - No-logs policy

## Scaling Strategy

### Horizontal Scaling
- Stateless backend services for easy replication
- Load balancing across multiple API instances
- Read replicas for database scaling

### Vertical Scaling
- Resource optimization for CPU and memory-intensive components
- Database query optimization and indexing

### Geographic Distribution
- CDN for static assets
- Regional VPN endpoints for improved latency
- Database sharding by region (future consideration)

## Future Roadmap

### Phase 1: Core Functionality (Current)
- User authentication and basic subscription management
- VPN credential provisioning
- Admin dashboard for user management

### Phase 2: Enhanced Features
- Multiple payment providers
- Subscription plan management
- Usage analytics and reporting
- Improved admin dashboard with real-time monitoring

### Phase 3: Advanced Capabilities
- Traffic optimization and routing
- Ad and malware blocking features
- Multi-device synchronization
- Mobile applications (iOS/Android)

### Phase 4: Enterprise Features
- Team/organization accounts
- Custom branding options
- API access for enterprise customers
- Compliance reporting and audit logs

## Development Guidelines

- Follow [contributing guidelines](CONTRIBUTING.md) for all development work
- Adhere to the code structure and naming conventions
- Maintain comprehensive test coverage
- Document all APIs using OpenAPI specification

## Deployment Strategy

### Environments
- **Development**: For active development and testing
- **Staging**: Mirrors production for final testing
- **Production**: Live customer-facing environment

### Deployment Process
1. Automated testing in CI pipeline
2. Build and tag Docker images
3. Deploy to staging environment
4. Run integration tests
5. Manual approval for production deployment
6. Blue/green deployment to production

### Monitoring and Alerts
- System health metrics
- Error rate monitoring
- User activity and conversion tracking
- Automated alerts for critical issues 