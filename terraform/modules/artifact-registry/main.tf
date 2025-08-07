resource "google_artifact_registry_repository" "migration_repo" {
  provider      = google
  location      = var.gcp_region
  repository_id = "migration-repo"
  description   = "マイグレーション用Dockerイメージリポジトリ"
  format        = "DOCKER"

  cleanup_policies {
    id     = "delete-untagged-images"
    action = "DELETE"
    condition {
      tag_state    = "UNTAGGED"
      older_than   = "604800s"
    }
  }

  depends_on = [var.artifactregistry_api_dependency]
}