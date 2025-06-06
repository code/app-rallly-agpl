import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@rallly/ui/dropdown-menu";
import {
  BugIcon,
  LifeBuoyIcon,
  LightbulbIcon,
  MegaphoneIcon,
  SmileIcon,
} from "lucide-react";
import Link from "next/link";

import { Trans } from "@/components/trans";

const FeedbackButton = () => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="fixed right-6 bottom-8 z-20 hidden size-12 items-center justify-center rounded-full bg-gray-800 shadow-huge hover:bg-gray-700 active:shadow-none sm:inline-flex">
        <MegaphoneIcon className="h-5 text-white" />
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={10} align="end">
        <DropdownMenuLabel>
          <Trans i18nKey="menu" />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={"https://feedback.rallly.co/?b=feedback"}
            target={"_blank"}
          >
            <SmileIcon className="mr-2 size-4" />
            <Trans i18nKey="sendFeedback" defaults="Send Feedback" />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={"https://feedback.rallly.co/?b=feature-request"}
            target={"_blank"}
          >
            <LightbulbIcon className="mr-2 size-4" />
            <Trans i18nKey={"featureRequest"} defaults={"Request a Feature"} />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={"https://feedback.rallly.co/?b=bug-reports"}
            target={"_blank"}
          >
            <BugIcon className="mr-2 size-4" />
            <Trans i18nKey={"bugReport"} defaults={"Report an Issue"} />
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={"https://support.rallly.co"} target={"_blank"}>
            <LifeBuoyIcon className="mr-2 size-4" />
            <Trans i18nKey={"getSupport"} defaults={"Get Support"} />
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FeedbackButton;
