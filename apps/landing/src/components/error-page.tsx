"use client";

import { Button } from "@rallly/ui/button";
import { FileSearchIcon } from "lucide-react";
import Link from "next/link";
import type * as React from "react";

import { useTranslation } from "@/i18n/client/use-translation";

export interface ComponentProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

const ErrorPage: React.FunctionComponent<ComponentProps> = ({
  icon,
  title,
  description,
}) => {
  const { t } = useTranslation();
  return (
    <div className="inset-0 flex h-full w-full items-center justify-center lg:absolute">
      <div className="space-y-8">
        <div className="space-y-4 text-center">
          {icon || (
            <FileSearchIcon className="mb-4 inline-block size-24 text-gray-400" />
          )}
          <div className="mb-2 font-bold text-3xl text-primary-600">
            {title}
          </div>
          <p className="text-gray-600">{description}</p>
        </div>
        <div className="flex justify-center space-x-3">
          <Button variant="primary" asChild>
            <Link href="/">{t("goToHome")}</Link>
          </Button>
          <Button asChild>
            <Link href="https://support.rallly.co" passHref={true}>
              {t("support")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
