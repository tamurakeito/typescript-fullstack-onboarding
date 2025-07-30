import { organizationApiGetOptions } from "@/client/@tanstack/react-query.gen";
import { OrganizationProfile } from "@/features/users";
import { queryClient } from "@/lib/query-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/organizations/$organizationId/users/")({
  loader: async ({ params }) => {
    await queryClient.ensureQueryData(
      organizationApiGetOptions({
        path: {
          id: params.organizationId,
        },
      })
    );
  },
  component: () => {
    const { organizationId } = Route.useParams();
    const { data: organization } = useSuspenseQuery(
      organizationApiGetOptions({
        path: {
          id: organizationId,
        },
      })
    );
    return <OrganizationProfile organization={organization} />;
  },
});
