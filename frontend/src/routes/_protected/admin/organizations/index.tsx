import { organizationApiGetListOptions } from "@/client/@tanstack/react-query.gen";
import { Organization } from "@/features/organization";
import { queryClient } from "@/lib/query-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/admin/organizations/")({
  loader: async () => {
    await queryClient.ensureQueryData(organizationApiGetListOptions());
  },
  component: () => {
    const { data: organizationList } = useSuspenseQuery(organizationApiGetListOptions());
    return <Organization organizationList={organizationList} />;
  },
});
