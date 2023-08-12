import dotenv from "dotenv";
import http from "http";
import app from "./app";
import prisma from "./lib/prisma.client";

dotenv.config();

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION ⛔️, Shutting down...");
  process.exit(1);
});

const PORT = process.env.PORT || 9000;

let server: http.Server;

prisma
  .$connect()
  .then(() => {
    console.log("Database Connection Successful");
    server = app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((error: any) => {
    console.error("Failed to connect to Database:", error);
  });

process.on("unhandledRejection", (err) => {
  console.log(err);
  console.log("UNHANDLED REJECTION ⛔️, Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
