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

resource "google_sql_database" "app_database" {
  name     = var.db_name
  instance = google_sql_database_instance.postgres_instance.name
  project  = google_sql_database_instance.postgres_instance.project
}

resource "google_sql_user" "migration_user" {
  name     = var.db_migration_user
  instance = google_sql_database_instance.postgres_instance.name
  password = var.db_migration_password
  project  = google_sql_database_instance.postgres_instance.project
}

resource "google_sql_user" "app_user" {
  name     = var.db_app_user
  instance = google_sql_database_instance.postgres_instance.name
  password = var.db_app_password
  project  = google_sql_database_instance.postgres_instance.project
}