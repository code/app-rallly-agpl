import { zodResolver } from "@hookform/resolvers/zod";
import { usePostHog } from "@rallly/posthog/client";
import { Button } from "@rallly/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@rallly/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIconLabel,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@rallly/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@rallly/ui/form";
import { Input } from "@rallly/ui/input";
import { PencilIcon, TagIcon, TrashIcon } from "lucide-react";
import React from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useMount } from "react-use";
import { z } from "zod";

import { useDeleteParticipantMutation } from "@/components/poll/mutations";
import { Trans } from "@/components/trans";
import { useTranslation } from "@/i18n/client";
import { trpc } from "@/trpc/client";
import { useFormValidation } from "@/utils/form-validation";

export const ParticipantDropdown = ({
  participant,
  onEdit,
  children,
  disabled,
  align,
}: {
  disabled?: boolean;
  participant: {
    name: string;
    userId?: string;
    email?: string;
    id: string;
  };
  align?: "start" | "end";
  onEdit: () => void;
  children: React.ReactNode;
}) => {
  const [isChangeNameModalVisible, setIsChangeNameModalVisible] =
    React.useState(false);
  const [isDeleteParticipantModalVisible, setIsDeleteParticipantModalVisible] =
    React.useState(false);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          disabled={disabled}
          asChild={true}
          data-testid="participant-menu"
        >
          {children}
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align}>
          <DropdownMenuLabel>
            <div className="grid gap-0.5">
              <div className="font-medium text-foreground">
                {participant.name}
              </div>
              {participant.email ? (
                <div className="font-normal text-muted-foreground text-xs">
                  {participant.email}
                </div>
              ) : null}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onEdit}>
            <DropdownMenuItemIconLabel icon={PencilIcon}>
              <Trans i18nKey="editVotes" />
            </DropdownMenuItemIconLabel>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsChangeNameModalVisible(true)}>
            <DropdownMenuItemIconLabel icon={TagIcon}>
              <Trans i18nKey="changeName" />
            </DropdownMenuItemIconLabel>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setIsDeleteParticipantModalVisible(true)}
          >
            <TrashIcon className="size-4" />
            <Trans i18nKey="delete" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangeNameModal
        open={isChangeNameModalVisible}
        onOpenChange={setIsChangeNameModalVisible}
        oldName={participant.name}
        participantId={participant.id}
      />
      <DeleteParticipantModal
        open={isDeleteParticipantModalVisible}
        onOpenChange={setIsDeleteParticipantModalVisible}
        participantId={participant.id}
        participantName={participant.name}
      />
    </>
  );
};

const DeleteParticipantModal = ({
  open,
  onOpenChange,
  participantId,
  participantName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participantId: string;
  participantName: string;
}) => {
  const deleteParticipant = useDeleteParticipantMutation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Trans
              i18nKey="deleteParticipant"
              values={{ name: participantName }}
            />
          </DialogTitle>
          <DialogDescription>
            <Trans i18nKey="deleteParticipantDescription" />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={() => {
              onOpenChange(false);
            }}
          >
            <Trans i18nKey="cancel" />
          </Button>
          <Button
            loading={deleteParticipant.isPending}
            variant="destructive"
            onClick={async () => {
              deleteParticipant.mutate({
                participantId,
              });
              onOpenChange(false);
            }}
          >
            <Trans i18nKey="delete" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

type ChangeNameForm = {
  name: string;
};

const changeNameSchema = z.object({
  name: z.string().trim().min(1),
});

const ChangeNameModal = (props: {
  oldName: string;
  participantId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const posthog = usePostHog();
  const changeName = trpc.polls.participants.rename.useMutation({
    onSuccess: (_, { participantId, newName }) => {
      posthog?.capture("changed name", {
        participantId,
        oldName: props.oldName,
        newName,
      });
    },
  });
  const form = useForm<ChangeNameForm>({
    defaultValues: {
      name: props.oldName,
    },
    resolver: zodResolver(changeNameSchema),
  });

  const { control, reset, handleSubmit, setFocus, formState } = form;

  useMount(() => {
    setFocus("name", {
      shouldSelect: true,
    });
  });

  const handler = React.useCallback<SubmitHandler<ChangeNameForm>>(
    async ({ name }) => {
      if (formState.isDirty) {
        // change name
        await changeName.mutateAsync({
          participantId: props.participantId,
          newName: name,
        });
      }
      props.onOpenChange(false);
    },
    [changeName, formState.isDirty, props],
  );

  const { requiredString } = useFormValidation();
  const formName = `change-name-${props.participantId}`;
  const { t } = useTranslation();
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("changeName")}</DialogTitle>
          <DialogDescription>{t("changeNameDescription")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id={formName} onSubmit={handleSubmit(handler)}>
            <FormField
              control={control}
              name="name"
              rules={{
                validate: requiredString(t("name")),
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      {...field}
                      disabled={formState.isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>{t("changeNameInfo")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button
            disabled={formState.isSubmitting}
            onClick={() => {
              reset();
              props.onOpenChange(false);
            }}
          >
            {t("cancel")}
          </Button>
          <Button
            form={formName}
            loading={formState.isSubmitting}
            type="submit"
            variant="primary"
          >
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
