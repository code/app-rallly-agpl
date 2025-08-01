import { prisma } from "@rallly/database";
import type { SpaceTier } from "@/features/space/schema";

export async function getSpaceSubscription(spaceId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: {
      spaceId,
    },
  });

  if (!subscription) {
    return null;
  }

  return {
    id: subscription.id,
    tier: (subscription.active ? "pro" : "hobby") as SpaceTier,
    quantity: subscription.quantity,
    subscriptionItemId: subscription.subscriptionItemId,
  };
}
