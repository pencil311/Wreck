import type { Metadata } from "next";
import { getViewer } from "@/lib/data";
import { Page, PageHeader } from "@/components/app/page-header";
import { SettingsClient } from "@/components/settings/settings-client";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { user, data } = await getViewer();
  return (
    <Page>
      <PageHeader eyebrow={user.email} title="Settings" />
      <div className="mt-8">
        <SettingsClient initial={data.settings} />
      </div>
    </Page>
  );
}
