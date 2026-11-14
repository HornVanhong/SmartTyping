# ==============================================================================
# TypeMaster Backend - Multi-stage Production Dockerfile
# Base: Eclipse Temurin OpenJDK 21 on Alpine Linux
# Targeted for: AWS App Runner / AWS ECS Fargate / AWS EC2
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build & Package
# ------------------------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Cache Maven dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code
COPY src ./src

# Build production jar skipping tests (tests ran in CI)
RUN mvn clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Stage 2: Production Runtime
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runner

# Install curl for container health checks
RUN apk add --no-cache curl tzdata

# Set timezone to UTC
ENV TZ=UTC

# Run as non-root user for container security compliance
RUN addgroup -S -g 10001 typemaster && \
    adduser -S -u 10001 -G typemaster typemaster

WORKDIR /app

# Copy executable jar from builder stage
COPY --from=builder --chown=typemaster:typemaster /build/target/typemaster-api-*.jar app.jar

USER typemaster

# Expose HTTP / WebSocket port
EXPOSE 8081

# Container-optimized JVM memory and garbage collection flags
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0 -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"

# Healthcheck for AWS container orchestrators (ALB / ECS / App Runner)
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8081/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar --spring.profiles.active=prod"]
