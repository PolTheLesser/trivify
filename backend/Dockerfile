FROM openjdk:21-jdk-slim
WORKDIR /app
COPY target/*.jar app.jar
ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]