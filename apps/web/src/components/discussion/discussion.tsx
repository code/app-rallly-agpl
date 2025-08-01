"use client";
import { usePostHog } from "@rallly/posthog/client";
import { cn } from "@rallly/ui";
import { Badge } from "@rallly/ui/badge";
import { Button } from "@rallly/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@rallly/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@rallly/ui/dropdown-menu";
import { Icon } from "@rallly/ui/icon";
import { Input } from "@rallly/ui/input";
import { toast } from "@rallly/ui/sonner";
import { Textarea } from "@rallly/ui/textarea";
import dayjs from "dayjs";
import {
  MessageSquareOffIcon,
  MoreHorizontalIcon,
  TrashIcon,
} from "lucide-react";
import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { OptimizedAvatarImage } from "@/components/optimized-avatar-image";
import { Participant, ParticipantName } from "@/components/participant";
import { useParticipants } from "@/components/participants-provider";
import { Trans } from "@/components/trans";
import { usePoll } from "@/contexts/poll";
import { useRole } from "@/contexts/role";
import { useTranslation } from "@/i18n/client";
import { trpc } from "@/trpc/client";
import { requiredString } from "../../utils/form-validation";
import TruncatedLinkify from "../poll/truncated-linkify";
import { useUser } from "../user-provider";

interface CommentForm {
  authorName: string;
  content: string;
}

function NewCommentForm({
  onSubmit,
  onCancel,
}: {
  onSubmit?: () => void;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const poll = usePoll();
  const { user, createGuestIfNeeded } = useUser();
  const { participants } = useParticipants();

  const authorName = React.useMemo(() => {
    if (user) {
      if (!user.isGuest) {
        return user.name;
      }
      const participant = participants.find((p) => p.userId === user.id);
      return participant?.name ?? "";
    }
    return "";
  }, [user, participants]);

  const pollId = poll.id;

  const posthog = usePostHog();

  const { register, reset, control, handleSubmit, formState } =
    useForm<CommentForm>({
      defaultValues: {
        authorName,
        content: "",
      },
    });

  const addComment = trpc.polls.comments.add.useMutation({
    onSuccess: () => {
      posthog?.capture("created comment");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  return (
    <form
      className="w-full space-y-2.5"
      onSubmit={handleSubmit(async ({ authorName, content }) => {
        await createGuestIfNeeded();
        await addComment.mutateAsync({ authorName, content, pollId });
        reset({ authorName, content: "" });
        onSubmit?.();
      })}
    >
      <div>
        <Textarea
          id="comment"
          className="w-full"
          autoFocus={true}
          placeholder={t("commentPlaceholder")}
          {...register("content", { validate: requiredString })}
        />
      </div>
      <div
        className={cn("mb-2", {
          hidden: user && !user.isGuest,
        })}
      >
        <Controller
          name="authorName"
          key={user?.id}
          control={control}
          rules={{ validate: requiredString }}
          render={({ field }) => (
            <Input
              placeholder={t("yourName")}
              className="lg:w-48"
              data-1p-ignore="true"
              error={!!formState.errors.authorName}
              {...field}
            />
          )}
        />
      </div>
      <div className="flex gap-2.5">
        <Button
          type="submit"
          variant="primary"
          loading={formState.isSubmitting}
        >
          <Trans defaults="Add Comment" i18nKey="addComment" />
        </Button>
        <Button
          onClick={() => {
            reset();
            onCancel?.();
          }}
        >
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}

function DiscussionInner() {
  const { t } = useTranslation();
  const poll = usePoll();

  const pollId = poll.id;

  const { data: comments } = trpc.polls.comments.list.useQuery({ pollId });
  const posthog = usePostHog();

  const queryClient = trpc.useUtils();

  const deleteComment = trpc.polls.comments.delete.useMutation({
    onMutate: ({ commentId }) => {
      queryClient.polls.comments.list.setData(
        { pollId },
        (existingComments = []) => {
          return [...existingComments].filter(({ id }) => id !== commentId);
        },
      );
    },
    onSuccess: () => {
      posthog?.capture("deleted comment");
    },
  });

  const session = useUser();

  const [isWriting, setIsWriting] = React.useState(false);
  const role = useRole();

  if (!comments) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t("comments")}
          <Badge>{comments.length}</Badge>
        </CardTitle>
      </CardHeader>
      {comments.length ? (
        <CardContent className="border-b">
          <div className="space-y-4">
            {comments.map((comment) => {
              const canDelete = role === "admin" || session.ownsObject(comment);

              return (
                <div className="" key={comment.id}>
                  <div data-testid="comment">
                    <div className="mb-1 flex items-center space-x-2">
                      <Participant>
                        <OptimizedAvatarImage
                          name={comment.authorName}
                          size="sm"
                        />
                        <ParticipantName>{comment.authorName}</ParticipantName>
                        {session.ownsObject(comment) ? (
                          <Badge>
                            <Trans i18nKey="you" />
                          </Badge>
                        ) : null}
                      </Participant>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="text-gray-500">
                          {dayjs(comment.createdAt).fromNow()}
                        </div>
                        {canDelete && (
                          <DropdownMenu>
                            <DropdownMenuTrigger className="text-gray-500 hover:text-foreground">
                              <MoreHorizontalIcon className="size-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  deleteComment.mutate({
                                    commentId: comment.id,
                                  });
                                }}
                              >
                                <TrashIcon className="size-4" />
                                <Trans i18nKey="delete" />
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    <div className="w-fit whitespace-pre-wrap pl-7 text-sm leading-relaxed">
                      <TruncatedLinkify>{comment.content}</TruncatedLinkify>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      ) : null}
      {!poll.event ? (
        <CardFooter className="border-t-0">
          {isWriting ? (
            <NewCommentForm
              onSubmit={() => {
                setIsWriting(false);
              }}
              onCancel={() => {
                setIsWriting(false);
              }}
            />
          ) : (
            <button
              type="button"
              className="flex w-full rounded border border-input bg-transparent px-2 py-2 text-left text-muted-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
              onClick={() => setIsWriting(true)}
            >
              <Trans
                i18nKey="commentPlaceholder"
                defaults="Leave a comment on this poll (visible to everyone)"
              />
            </button>
          )}
        </CardFooter>
      ) : null}
    </Card>
  );
}

export default function Discussion() {
  const poll = usePoll();
  if (poll.disableComments) {
    return (
      <p className="rounded-lg bg-gray-100 p-4 text-center text-muted-foreground text-sm">
        <Icon>
          <MessageSquareOffIcon className="mr-2 inline-block" />
        </Icon>
        <Trans
          i18nKey="commentsDisabled"
          defaults="Comments have been disabled"
        />
      </p>
    );
  }
  return <DiscussionInner />;
}
