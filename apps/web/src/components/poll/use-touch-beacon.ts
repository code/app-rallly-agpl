import { useMount } from "react-use";

import { usePoll } from "@/contexts/poll";
import { trpc } from "@/trpc/client";

/**
 * Touching a poll updates a column with the current date. This information is used to
 * find polls that haven't been accessed for some time so that they can be deleted by house keeping.
 */
export const useTouchBeacon = () => {
  const poll = usePoll();
  const touchMutation = trpc.polls.touch.useMutation({
    meta: { doNotInvalidate: true },
  });

  useMount(() => {
    touchMutation.mutate({ pollId: poll.id });
  });
};
