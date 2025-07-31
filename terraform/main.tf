terraform { 
  required_providers { 
    google = { 
      source = "hashicorp/google" 
      version = "6.8.0" 
    } 
  } 
}

provider "google" { 
  project = "typescript-fullstack-onboard"
  region  = "us-central1"
  zone    = "us-central1-c"
}

resource "random_id" "bucket_prefix" {
  byte_length = 8
}

// GCSバケットを作成するブロック
resource "google_storage_bucket" "static_website" {
  name                          = "${random_id.bucket_prefix.hex}-static-website-bucket"
  location                      = "US"
  uniform_bucket_level_access = true
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

output "static_website_bucket_name" {
  description = "frontendアプリケーションのGCSバケット名"
  value       = google_storage_bucket.static_website.name
}