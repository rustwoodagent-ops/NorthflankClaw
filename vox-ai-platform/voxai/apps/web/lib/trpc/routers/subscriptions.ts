import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/trpc";
import { users } from "@/lib/db/schema";
import { SUBSCRIPTION_PLANS } from "@voxai/shared/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

const STRIPE_PRICE_IDS: Record<string, string> = {
  basic: process.env.STRIPE_BASIC_PRICE_ID!,
  pro: process.env.STRIPE_PRO_PRICE_ID!,
};

export const subscriptionsRouter = createTRPCRouter({
  getPlans: protectedProcedure.query(() => {
    return Object.values(SUBSCRIPTION_PLANS);
  }),

  createCheckout: protectedProcedure
    .input(z.object({ tier: z.enum(["basic", "pro"]) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id!;
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      // Get or create Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name || undefined,
          metadata: { userId },
        });
        customerId = customer.id;
        await ctx.db
          .update(users)
          .set({ stripeCustomerId: customerId })
          .where(eq(users.id, userId));
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: STRIPE_PRICE_IDS[input.tier],
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
        metadata: { userId, tier: input.tier },
        subscription_data: {
          metadata: { userId, tier: input.tier },
        },
      });

      return { url: session.url! };
    }),

  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id!;
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user?.stripeSubscriptionId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No active subscription",
      });
    }

    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    return { scheduled: true };
  }),

  getUsage: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id!;
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });

    const plan = SUBSCRIPTION_PLANS[user.subscriptionTier];
    return {
      tier: user.subscriptionTier,
      used: user.analysesUsedThisMonth,
      limit: plan.analysesPerMonth,
      remaining: Math.max(0, plan.analysesPerMonth - user.analysesUsedThisMonth),
      resetAt: user.analysesResetAt,
    };
  }),
});
