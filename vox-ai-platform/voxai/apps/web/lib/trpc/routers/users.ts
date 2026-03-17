import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/trpc";
import { users } from "@/lib/db/schema";

export const usersRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id!;
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    return user;
  }),
});
