resource "google_compute_global_address" "default" {
  name       = "lb-ipv4-1"
  ip_version = "IPV4"
  depends_on = [var.compute_api_dependency]
}

resource "google_certificate_manager_certificate" "default" {
  name    = "managed-cert"
  managed {
    domains = [var.domain_name]
  }
  labels = {
    "terraform" : true
  }
  depends_on = [var.certificatemanager_api_dependency]
}

resource "google_certificate_manager_certificate_map" "default" {
  name = "managed-cert-map"
  labels = {
    "terraform" : true
  }
}

resource "google_certificate_manager_certificate_map_entry" "default" {
  name         = "managed-cert-map-entry"
  map          = google_certificate_manager_certificate_map.default.name
  labels = {
    "terraform" : true
  }
  certificates = [google_certificate_manager_certificate.default.id]
  hostname     = var.domain_name
}

resource "google_compute_backend_bucket" "gcs_backend" {
  name        = "gcs-frontend-backend"
  bucket_name = var.bucket_name
  enable_cdn  = true
}

resource "google_compute_region_network_endpoint_group" "cloudrun_neg" {
  name                  = "cloudrun-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.gcp_region
  depends_on = [var.compute_api_dependency]

  cloud_run {
    service = var.cloudrun_service_name
  }
}

resource "google_compute_backend_service" "cloudrun_backend" {
  name                  = "cloudrun-api-backend"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  protocol              = "HTTP"
  enable_cdn            = true
  depends_on = [var.cloudrun_service_dependency]

  backend {
    group = google_compute_region_network_endpoint_group.cloudrun_neg.id
  }
}

resource "google_compute_url_map" "default" {
  name            = "lb-url-map"
  default_service = google_compute_backend_bucket.gcs_backend.id

  host_rule {
    hosts        = [var.domain_name]
    path_matcher = "allpaths"
  }

  path_matcher {
    name            = "allpaths"
    default_service = google_compute_backend_bucket.gcs_backend.id

    path_rule {
      paths   = ["/api/*"]
      service = google_compute_backend_service.cloudrun_backend.id
    }
  }
}

resource "google_compute_target_https_proxy" "default" {
  name             = "https-lb-proxy"
  url_map          = google_compute_url_map.default.id
  certificate_map = "//certificatemanager.googleapis.com/${google_certificate_manager_certificate_map.default.id}"
}

resource "google_compute_global_forwarding_rule" "default" {
  name                  = "https-content-rule"
  ip_protocol           = "TCP"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  port_range            = "443"
  target                = google_compute_target_https_proxy.default.id
  ip_address            = google_compute_global_address.default.address
}
