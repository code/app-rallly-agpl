import { usePostHog } from "@rallly/posthog/client";
import { Button } from "@rallly/ui/button";
import { Icon } from "@rallly/ui/icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@rallly/ui/tooltip";
import { BellOffIcon, BellRingIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import type * as React from "react";

import { Skeleton } from "@/components/skeleton";
import { Trans } from "@/components/trans";
import { useUser } from "@/components/user-provider";
import { useTranslation } from "@/i18n/client";
import { trpc } from "@/trpc/client";

import { usePoll } from "../poll-context";

const NotificationsToggle: React.FunctionComponent = () => {
  const { poll } = usePoll();

  const { data: watchers } = trpc.polls.getWatchers.useQuery(
    {
      pollId: poll.id,
    },
    {
      staleTime: Number.POSITIVE_INFINITY,
    },
  );

  const { user } = useUser();

  const isWatching = watchers?.some(({ userId }) => userId === user?.id);

  const posthog = usePostHog();

  const queryClient = trpc.useUtils();

  const watch = trpc.polls.watch.useMutation({
    onSuccess: () => {
      // TODO (Luke Vella) [2023-04-08]: We should have a separate query for getting watchers
      posthog?.capture("turned notifications on", {
        pollId: poll.id,
        source: "notifications-toggle",
      });
      queryClient.polls.getWatchers.setData(
        { pollId: poll.id },
        (oldWatchers) => {
          if (!oldWatchers || !user) {
            return;
          }
          return [...oldWatchers, { userId: user.id }];
        },
      );
    },
  });

  const unwatch = trpc.polls.unwatch.useMutation({
    onSuccess: () => {
      posthog?.capture("turned notifications off", {
        pollId: poll.id,
        source: "notifications-toggle",
      });
      queryClient.polls.getWatchers.setData(
        { pollId: poll.id },
        (oldWatchers) => {
          if (!oldWatchers) {
            return;
          }
          return oldWatchers.filter(({ userId }) => userId !== user?.id);
        },
      );
    },
  });

  const { t } = useTranslation();

  if (!watchers) {
    return <Skeleton className="size-9" />;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          data-testid="notifications-toggle"
          variant="ghost"
          onClick={async () => {
            if (!user || user.isGuest) {
              signIn();
              return;
            }
            // toggle
            if (isWatching) {
              await unwatch.mutateAsync({ pollId: poll.id });
            } else {
              await watch.mutateAsync({ pollId: poll.id });
            }
          }}
        >
          {isWatching ? (
            <Icon>
              <BellRingIcon />
            </Icon>
          ) : (
            <Icon>
              <BellOffIcon />
            </Icon>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {!user || user.isGuest ? (
          <Trans
            i18nKey="notificationsGuestTooltip"
            defaults="Create an account or login to turn on notifications"
          />
        ) : (
          <Trans
            i18nKey="notificationsValue"
            defaults="Notifications: <b>{value}</b>"
            components={{
              b: <span className="font-semibold" />,
            }}
            values={{
              value: isWatching
                ? t("notificationsOn", {
                    defaultValue: "On",
                  })
                : t("notificationsOff", {
                    defaultValue: "Off",
                  }),
            }}
          />
        )}
      </TooltipContent>
    </Tooltip>
  );
};

export default NotificationsToggle;
