import { getDefaultSpace } from "@/features/spaces/queries";
import { prisma } from "@rallly/database";
import { posthog } from "@rallly/posthog/server";
import * as Sentry from "@sentry/nextjs";

export const mergeGuestsIntoUser = async (
  userId: string,
  guestIds: string[],
) => {
  const space = await getDefaultSpace({ ownerId: userId });

  if (!space) {
    console.warn(`User ${userId} not found`);
    return;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await Promise.all([
        tx.poll.updateMany({
          where: {
            guestId: {
              in: guestIds,
            },
          },
          data: {
            guestId: null,
            userId: userId,
            spaceId: space.id,
          },
        }),

        tx.participant.updateMany({
          where: {
            guestId: {
              in: guestIds,
            },
          },
          data: {
            guestId: null,
            userId: userId,
          },
        }),

        tx.comment.updateMany({
          where: {
            guestId: {
              in: guestIds,
            },
          },
          data: {
            guestId: null,
            userId: userId,
          },
        }),
      ]);
    });
    posthog?.alias({ distinctId: userId, alias: guestIds[0] });
  } catch (error) {
    Sentry.captureException(error);
  }
};
