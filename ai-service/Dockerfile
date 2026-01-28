FROM amazoncorretto:21-alpine

WORKDIR /app

COPY target/ai-service-0.0.1-SNAPSHOT.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
