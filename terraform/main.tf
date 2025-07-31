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

// VPCネットワーク作成
resource "google_compute_network" "peering_network" {
  name                    = "private-network"
  auto_create_subnetworks = "false"
}

resource "google_compute_global_address" "private_ip_address" {
  name          = "private-ip-address"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.peering_network.id
}

resource "google_service_networking_connection" "default" {
  network                 = google_compute_network.peering_network.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address.name]
}

/* Cloud SQL */
resource "google_sql_database_instance" "default" {
  name             = "private-ip-sql-instance"
  database_version = "POSTGRES_14"
  depends_on = [google_service_networking_connection.default]
  settings {
    tier = "db-custom-2-7680"
    ip_configuration {
      ipv4_enabled    = "false" // パブリックIPを無効化
      private_network = google_compute_network.peering_network.id // プライベートIPを持たせる
    }
  }
}

/* Cloud Storage */
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