resource "random_id" "bucket_prefix" {
  byte_length = 8
}

resource "google_storage_bucket" "static_website" {
  name                          = "${random_id.bucket_prefix.hex}-static-website-bucket"
  location                      = var.gcp_region
  uniform_bucket_level_access = true
  force_destroy = true
  depends_on = [var.storage_api_dependency]
  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }
}

resource "google_storage_bucket_iam_member" "public_rule" {
  bucket = google_storage_bucket.static_website.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}
