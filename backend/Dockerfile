# Stage 1: Build the Spring Boot application

FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /build

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# Stage 2: Run the application

FROM eclipse-temurin:21-jre

RUN useradd --system --uid 10001 nextrisk

WORKDIR /app

COPY --from=build /build/target/nextrisk-backend-*.jar app.jar

USER nextrisk

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
