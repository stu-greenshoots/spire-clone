import Fastify from "fastify";
import cors from "@fastify/cors";
import { tripRoutes } from "./routes/trips.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
app.get("/health", async () => ({ ok: true }));
await app.register(tripRoutes);

const port = Number(process.env.PORT ?? 3001);
app
  .listen({ port, host: "0.0.0.0" })
  .then(() => app.log.info(`Cabinwise API on http://localhost:${port}`))
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
