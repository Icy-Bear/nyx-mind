import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import React from "react";
import { usePageTitle } from "@/contexts/page-title-context";

export function SiteHeader() {
  const pathname = usePathname();
  const { title: customTitle } = usePageTitle();
  const parts = pathname.split("/").filter(Boolean);

  const toTitle = (str: string) =>
    str.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full flex-col gap-1 px-4 lg:px-6 py-2">
        <div className="flex items-center gap-1">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <h1 className="text-base font-medium">
            {parts.length > 0 && (
              <Breadcrumb>
                <BreadcrumbList className="text-xl font-semibold">
                  {" "}
                  {/* heading look */}
                  {parts.map((item, i) => {
                    const title = toTitle(item);
                    const href = "/" + parts.slice(0, i + 1).join("/");
                    const isLast = i === parts.length - 1;

                    return (
                      <React.Fragment key={i}>
                        <BreadcrumbItem>
                          {isLast ? (
                            // last item -> not clickable, bold heading
                            <span className="text-xl font-semibold text-primary">
                              {customTitle || title}
                            </span>
                          ) : (
                            <BreadcrumbLink
                              href={href}
                              className="text-muted-foreground"
                            >
                              {title}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>

                        {!isLast && <BreadcrumbSeparator />}
                      </React.Fragment>
                    );
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </h1>
        </div>
      </div>
    </header>
  );
}
