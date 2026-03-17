import "server-only";
import { createCallerFactory, createTRPCRouter } from "./trpc";
import { appRouter } from "./root";
import { createTRPCContext } from "./trpc";
import { cache } from "react";

const createCaller = createCallerFactory(appRouter);

export const createCaller2 = cache(async () => {
  // For server components, we create a context without a real request
  const ctx = await createTRPCContext({
    req: new Request("http://localhost"),
  });
  return createCaller(ctx);
});

export { api as serverApi } from "./provider";
