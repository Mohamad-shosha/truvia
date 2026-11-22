# Stage 1: build the Spring Boot application
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Resolve dependencies in their own layer so code-only changes rebuild quickly.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q clean package -DskipTests

# Stage 2: run the application
FROM eclipse-temurin:21-jre
RUN useradd --system --uid 10001 nextrisk
WORKDIR /app
COPY --from=build /build/target/nextrisk-backend-*.jar app.jar
USER nextrisk
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
