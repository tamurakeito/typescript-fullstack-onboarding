output "bucket_name" {
  value = google_storage_bucket.static_website.name
}

output "bucket" {
  value = google_storage_bucket.static_website
}