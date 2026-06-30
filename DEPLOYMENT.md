# CoreGrid ERP System - Production Deployment Guide

## Prerequisites
- Node.js 20.x or higher
- PostgreSQL 14.x or higher
- Ollama (for AI features)
- Domain name and SSL certificate

## Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/coregrid_production?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"

# AI/Ollama
OLLAMA_BASE_URL="http://ollama:11434"  # Or external Ollama service

# Optional: Email (for notifications)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-password"
SMTP_FROM="CoreGrid <noreply@yourdomain.com>"

# Optional: File Storage
UPLOAD_DIR="/app/uploads"
MAX_FILE_SIZE="10485760"  # 10MB in bytes
```

## Database Setup

1. **Create Production Database:**
```bash
createdb coregrid_production
```

2. **Run Migrations:**
```bash
npx prisma migrate deploy
```

3. **Seed Database (Optional):**
```bash
npx prisma db seed
```

## Build Process

1. **Install Dependencies:**
```bash
npm ci --production=false
```

2. **Generate Prisma Client:**
```bash
npx prisma generate
```

3. **Build Application:**
```bash
npm run build
```

4. **Start Production Server:**
```bash
npm start
```

## Docker Deployment

See `docker-compose.yml` for containerized deployment.

```bash
docker-compose up -d
```

## Performance Optimization

### Database Indexing
Ensure all Prisma indices are applied:
```bash
npx prisma migrate deploy
```

### Caching Strategy
- Enable Next.js static generation where possible
- Use Redis for session storage (optional)
- Configure CDN for static assets

### Environment Tuning
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096"

# Enable production mode
NODE_ENV="production"
```

## Security Checklist

- [ ] Change default admin password
- [ ] Enable HTTPS/SSL
- [ ] Set secure session cookies
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Enable audit logging
- [ ] Scan for vulnerabilities: `npm audit`
- [ ] Update dependencies regularly

## Monitoring

### Health Check Endpoint
```
GET /api/health
```

### Key Metrics to Monitor
- Database connection pool
- API response times
- Memory usage
- Disk space
- Failed login attempts
- Error rates

### Recommended Tools
- PM2 for process management
- Prometheus + Grafana for metrics
- Sentry for error tracking
- LogRocket for session replay

## Backup Strategy

### Database Backups
```bash
# Daily backup script
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### File System Backups
- Upload directory
- Configuration files
- SSL certificates

## Rollback Procedure

1. Stop the application
2. Restore database from backup
3. Deploy previous version
4. Restart services
5. Verify functionality

## Scaling Considerations

### Horizontal Scaling
- Deploy multiple instances behind load balancer
- Use external session store (Redis)
- Configure sticky sessions

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Enable connection pooling

## Support

For production issues:
- Check logs: `pm2 logs`
- Review error tracking: Sentry dashboard
- Database health: `SELECT * FROM pg_stat_activity;`

## Post-Deployment Verification

1. Access dashboard: `https://yourdomain.com`
2. Test user login
3. Verify database connectivity
4. Check AI service status
5. Test critical workflows
6. Monitor error logs
7. Validate email delivery (if configured)

## License

Proprietary - Internal Use Only
