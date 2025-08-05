output "cloudrun_service_name" {
  value = google_cloud_run_v2_service.default.name
}

output "cloudrun_service" {
  value = google_cloud_run_v2_service.default
}