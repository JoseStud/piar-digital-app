use std::path::Path;

fn normalized_extensions(extensions: Vec<String>, suggested_name: &str) -> Vec<String> {
  let normalized = extensions
    .into_iter()
    .map(|extension| extension.trim().trim_start_matches('.').to_ascii_lowercase())
    .filter(|extension| !extension.is_empty())
    .collect::<Vec<_>>();

  if !normalized.is_empty() {
    return normalized;
  }

  Path::new(suggested_name)
    .extension()
    .and_then(|extension| extension.to_str())
    .map(|extension| vec![extension.to_ascii_lowercase()])
    .unwrap_or_default()
}

#[tauri::command]
fn save_binary_file(
  bytes: Vec<u8>,
  suggested_name: String,
  file_type_label: String,
  extensions: Vec<String>,
) -> Result<bool, String> {
  let normalized_extensions = normalized_extensions(extensions, &suggested_name);
  let mut dialog = rfd::FileDialog::new().set_file_name(&suggested_name);

  if !normalized_extensions.is_empty() {
    let extension_refs = normalized_extensions
      .iter()
      .map(String::as_str)
      .collect::<Vec<_>>();
    dialog = dialog.add_filter(&file_type_label, &extension_refs);
  }

  let Some(path) = dialog.save_file() else {
    return Ok(false);
  };

  std::fs::write(&path, bytes)
    .map_err(|error| format!("Failed to write {}: {error}", path.display()))?;

  Ok(true)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![save_binary_file])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
