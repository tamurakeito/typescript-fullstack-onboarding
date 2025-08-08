output "instance_connection_name" {
  value = "${var.gcp_project}:${var.gcp_region}:${google_sql_database_instance.postgres_instance.name}"
}

output "db_migration_user" {
  value = var.db_migration_user
}

output "db_migration_password" {
  value = var.db_migration_password
}