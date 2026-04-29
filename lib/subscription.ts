import { createClient } from "@supabase/supabase-js";

export type SubscriptionTier = "free" | "pro" | "student_pro" | "employer_featured" | "employer_unlimited";

export async function getSubscriptionTier(userId: string): Promise<SubscriptionTier> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return "free";

  const supabase = createClient(url, serviceKey);
  const { data } = await supabase
    .from("profiles")
    .select("subscription_status, subscription_tier")
    .eq("id", userId)
    .maybeSingle();

  if (!data || data.subscription_status !== "active") return "free";
  return (data.subscription_tier as SubscriptionTier) ?? "free";
}

export function canUseAI(tier: SubscriptionTier): boolean {
  return tier !== "free";
}

export function canApplyUnlimited(tier: SubscriptionTier): boolean {
  return tier === "pro" || tier === "student_pro";
}

export function canPostUnlimited(tier: SubscriptionTier): boolean {
  return tier === "employer_unlimited";
}
