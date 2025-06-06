import { NewspaperIcon } from "lucide-react";
import Script from "next/script";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="w-full">
        <div className="mx-auto max-w-2xl space-y-12">
          {children}
          <div className="overflow-hidden rounded-md border bg-gray-200/50 backdrop-blur-sm">
            <div className="flex flex-col gap-x-4 gap-y-2 p-6 pb-0 sm:flex-row">
              <div>
                <NewspaperIcon className="size-6" />
              </div>
              <div>
                <div className="font-medium">Want to stay up to date?</div>
                <div className="text-gray-500 text-sm">
                  Subscribe to our newsletter to get updates on new features and
                  releases.
                </div>
              </div>
            </div>
            <div className="flex sm:ml-11">
              <div
                className="ml-embedded min-h-[88px] w-96 p-0"
                data-form="h9YecB"
              />
            </div>
          </div>
        </div>
        <Script id="mailerlite" src="/static/scripts/mailerlite.js" />
      </div>
    </div>
  );
}
