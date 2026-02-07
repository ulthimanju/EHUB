FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /home/app
COPY src /home/app/src
COPY pom.xml /home/app
RUN mvn -f /home/app/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jdk-alpine
COPY --from=build /home/app/target/*.jar app.jar
EXPOSE 8084
ENTRYPOINT ["java","-jar","/app.jar"]
