import { auth, currentUser } from "@clerk/nextjs/server";
import { InlineAlert } from "@/components/feedback/InlineAlert";
import { PageHeader } from "@/components/layout/PageHeader";
import { AccountUsageWorkspace } from "@/components/usage/AccountUsageWorkspace";
import {
  getAccountUsageData,
  getEmptyAccountUsageData,
  type AccountProfile,
  type AccountUsageData,
} from "@/lib/usage/account-usage.service";

function initialsFromName(name: string, email: string): string {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return email.slice(0, 2).toUpperCase();
}

async function getAccountProfile(): Promise<AccountProfile> {
  const user = await currentUser();
  const email =
    user?.primaryEmailAddress?.emailAddress ?? "account@example.com";
  const name =
    user?.fullName ??
    user?.username ??
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ??
    "Account user";

  return {
    email,
    initials: initialsFromName(name, email),
    name,
  };
}

async function loadAccountUsageData(
  userId: string | null,
  profile: AccountProfile,
): Promise<{ data: AccountUsageData; error: string | null }> {
  if (!userId) {
    return {
      data: getEmptyAccountUsageData(profile),
      error: null,
    };
  }

  try {
    return {
      data: await getAccountUsageData(userId, profile),
      error: null,
    };
  } catch (error) {
    console.error("[account/load]", error);

    return {
      data: getEmptyAccountUsageData(profile),
      error:
        "We could not load account usage data. Check the Supabase server configuration and try again.",
    };
  }
}

export default async function AccountPage() {
  const [{ userId }, profile] = await Promise.all([
    auth(),
    getAccountProfile(),
  ]);
  const { data, error } = await loadAccountUsageData(userId, profile);

  return (
    <main className="flex-1 bg-background px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
        <PageHeader
          eyebrow="Account"
          title="Account and usage"
          description="Manage account settings, usage activity, and recent document work."
        />
        {error ? (
          <InlineAlert title="Account usage unavailable" variant="warning">
            {error}
          </InlineAlert>
        ) : null}
        <AccountUsageWorkspace data={data} />
      </div>
    </main>
  );
}
