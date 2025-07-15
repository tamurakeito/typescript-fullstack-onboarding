import { organizationApiGetOptions } from "@/client/@tanstack/react-query.gen";
import { OrganizationProfile } from "@/features/organization/profile";
import { QueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/organization/$organizationId")({
  loader: async ({ params }) => {
    const queryClient = new QueryClient();
    await queryClient.ensureQueryData(
      organizationApiGetOptions({
        path: {
          id: params.organizationId,
        },
      })
    );
    return {
      queryClient,
    };
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
