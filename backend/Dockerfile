FROM openjdk:21-jdk-slim
RUN apt-get update && \
    apt-get install -y --no-install-recommends wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY target/*.jar app.jar
ENV JAVA_OPTS=""
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]