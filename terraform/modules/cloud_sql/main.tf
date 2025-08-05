resource "google_sql_database_instance" "postgres_instance" {
  name             = "private-ip-sql-instance"
  region           = var.gcp_region
  database_version = "POSTGRES_14"
  root_password    = var.root_password

  settings {
    tier = "db-f1-micro"
  }
  deletion_protection = false
  depends_on          = [var.sqladmin_api_dependency]
}
