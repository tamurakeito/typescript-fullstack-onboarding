output "migration_repo_name" {
  value = google_artifact_registry_repository.migration_repo.name
}

output "backend_repo_name" {
  value = google_artifact_registry_repository.backend_repo.name
}