FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -pl event-service -am -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/event-service/target/event-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT [ "java", "-Djava.security.egd=file:/dev/./urandom", "-XX:TieredStopAtLevel=1", "-noverify", "-jar", "/app/app.jar" ]
