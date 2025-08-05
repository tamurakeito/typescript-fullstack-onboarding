output "instance_connection_name" {
  value = "${var.gcp_project}:${var.gcp_region}:${google_sql_database_instance.postgres_instance.name}"
}