import { createTRPCRouter } from "@/lib/trpc/trpc";
import { recordingsRouter } from "./routers/recordings";
import { analysesRouter } from "./routers/analyses";
import { subscriptionsRouter } from "./routers/subscriptions";
import { usersRouter } from "./routers/users";

export const appRouter = createTRPCRouter({
  recordings: recordingsRouter,
  analyses: analysesRouter,
  subscriptions: subscriptionsRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
