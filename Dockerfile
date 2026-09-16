# Step 1: Build the application
FROM oven/bun:1.4.2 AS builder

# Set the working directory in the container
WORKDIR /app

# Copy lockfile + manifest first so `bun install` is cached across builds
# whenever only source files change.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Step 2: Create a smaller image for running the application
FROM oven/bun:1.4.2-slim

WORKDIR /app

# Copy only the necessary files from the builder image to the final image
COPY --from=builder /app/build .

# Expose the port the application will run on
EXPOSE 3000

#Start the BUN server
CMD ["bun", "run", "start"]