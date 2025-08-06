output "load_balancer_ip_address" {
  description = "グローバル外部HTTPSロードバランサーのパブリックIPアドレス"
  value       = module.load_balancer.load_balancer_ip_address
}

output "static_website_bucket_name" {
  description = "GCSバケット名"
  value       = module.cloud_storage.bucket_name
}

output "cloudbuild_service_account_id" {
  description = "Cloud BuildサービスアカウントのID"
  value       = google_service_account.cloudbuild_service_account.id
} 