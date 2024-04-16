# Use the official MongoDB image as the base image
FROM mongo:latest

# Copy the initialization script(s) into the Docker image
COPY ./infrastructure/db/ /docker-entrypoint-initdb.d/

# The CMD instruction provides defaults for an executing container
# In this case, it will run the mongod server
CMD ["mongod"]