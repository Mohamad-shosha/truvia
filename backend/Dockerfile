FROM eclipse-temurin:21-jre
RUN useradd --system --uid 10001 nextrisk
WORKDIR /app
COPY target/nextrisk-backend-*.jar app.jar
USER nextrisk
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
