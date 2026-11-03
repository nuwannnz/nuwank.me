import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

/** Page title in the reading column, with an optional back link in the margin. */
export function PageHead({
  title,
  dek,
  back,
}: {
  title: ReactNode;
  dek?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="page-head grid">
      <div className="margin">
        {back && (
          <Link className="back" href={back.href}>
            <Icon name="arrow-left" />
            {back.label}
          </Link>
        )}
      </div>
      <div className="main">
        <h1>{title}</h1>
        {dek && <p className="dek">{dek}</p>}
      </div>
    </div>
  );
}
