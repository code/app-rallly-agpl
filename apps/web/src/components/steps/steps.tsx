import { cn } from "@rallly/ui";
import type React from "react";

import { useTranslation } from "@/i18n/client";

export interface StepsProps {
  current: number;
  total: number;
  className?: string;
}

const Steps: React.FunctionComponent<StepsProps> = ({
  current,
  total,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <div className="font-medium text-sm tracking-tight">
        {t("stepSummary", {
          current: current + 1,
          total,
        })}
      </div>
      <div className="flex items-center gap-2">
        {[...Array(total)].map((_, i) => {
          return (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: Fix this later
              key={i}
              className={cn("h-2 w-2 rounded-full transition-all", {
                "bg-primary-400": i <= current,
                "bg-gray-300": i > current,
                "animate-pulse ring-4 ring-primary-200": i === current,
              })}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Steps;
