import { NextResponse } from "next/server";
import stripe from "stripe";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const runtime = "nodejs";

type CheckoutBody = {
  priceId?: string;
  userId?: string;
};

export async function POST(request: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = rateLimit(`checkout:${ip}`, 10, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many checkout attempts. Please try again later." },
        { status: 429, headers: rateLimitHeaders(rl.remaining, rl.resetAt) },
      );
    }
    if (!stripeSecretKey) {
      console.error("[api/checkout] missing STRIPE_SECRET_KEY");
      return NextResponse.json(
        { error: "Stripe is not configured." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as CheckoutBody;
    const priceId = body.priceId?.trim();
    const userId = body.userId?.trim();
    console.log("[api/checkout] request received", {
      hasPriceId: Boolean(priceId),
      userId,
    });

    if (!priceId || !userId) {
      console.warn("[api/checkout] validation failed", { priceId, userId });
      return NextResponse.json(
        { error: "priceId and userId are required" },
        { status: 400 },
      );
    }

    const origin =
      request.headers.get("origin") ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      "http://localhost:3000";
    console.log("[api/checkout] creating session", { origin, priceId, userId });

    const stripeClient = new stripe(stripeSecretKey);

    const session = await stripeClient.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId },
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/pricing`,
    });
    console.log("[api/checkout] session created", {
      sessionId: session.id,
      hasUrl: Boolean(session.url),
    });

    if (!session.url) {
      console.error("[api/checkout] session URL is null", { sessionId: session.id });
      return NextResponse.json({ error: "Checkout session created but no URL returned." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    console.error("[api/checkout] error", message, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
