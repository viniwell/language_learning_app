#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::File;
use std::io::{Write};
use dirs::download_dir;

#[tauri::command]
fn create_file_in_downloads(filename: &str, content: &str) -> Result<(), String> {
    // Get the home directory
    if let Some(home) = download_dir() {
        // Construct the path to the Downloads folder
        let downloads_path = home.join("Downloads").join(filename);

        // Create or open the file
        let mut file;
        match File::create(downloads_path){
            Ok(f) => file = f,
            Err(e) => return Err(e.to_string()),
        }

        // Write content to the file
        match file.write_all(content.as_bytes()) {
            Ok(_) => (),
            Err(e) => return Err(e.to_string()),
        }


        println!("File created successfully in the Downloads folder.");
        Ok(())
    } else {
        Err("Home directory not found".to_string())
    }
}


fn main() {
  tauri::Builder::default()
      .invoke_handler(tauri::generate_handler![create_file_in_downloads])
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
}