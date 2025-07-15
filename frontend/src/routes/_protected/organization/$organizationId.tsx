import { OrganizationProfile } from "@/features/organization/profile";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/organization/$organizationId")({
  component: OrganizationProfile,
});
