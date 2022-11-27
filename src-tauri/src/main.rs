#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{
    window::WindowBuilder, CustomMenuItem, GlobalShortcutManager, Manager, SystemTray,
    SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem, WindowEvent, WindowUrl,
};
use tauri_plugin_positioner::{on_tray_event, Position, WindowExt};
use tauri_plugin_store::PluginBuilder;

mod menu;

#[tauri::command]
async fn login(window: tauri::Window) -> String {
    let window_ = window.clone();
    let port = tauri_plugin_oauth::start(
        Some(
            "<html><head></head><body>You can close this tab and return to the app.</body></html>",
        ),
        move |url| {
            println!("login done {}", url);
            window_.emit_all("auth_url", url);
        },
    )
    .unwrap();
    println!("login {}", port);
    return format!("http://127.0.0.1:{}/", port);
}

#[tauri::command]
fn update_tray_icon(window: tauri::Window, active: bool) {
    if (active) {
        window
            .app_handle()
            .tray_handle()
            .set_icon(tauri::Icon::Raw(
                include_bytes!("../icons/tray-active.png").to_vec(),
            ))
            .unwrap();
    } else {
        window
            .app_handle()
            .tray_handle()
            .set_icon(tauri::Icon::Raw(
                include_bytes!("../icons/tray-idleTemplate.png").to_vec(),
            ))
            .unwrap();
    }
}

// fn getMainWindow(app: tauri::Manager) {
//     let window = app.get_window("main").unwrap();
//     if (window ) {
//         window = WindowBuilder::new(app, "main", WindowUrl::default())
//         .inner_size(500., 400.)
//         .resizable(false)
//         .transparent(false)
//         .decorations(false)
//         .skip_taskbar(true)
//         .always_on_top(true)
//         .min_inner_size(500., 400.).build()?;
//     }
//     return window;
// }

fn toggle_window(app: &tauri::AppHandle) {
    let window = app.get_window("main").unwrap();
    let new_title = if window.is_visible().unwrap() {
        window.hide().unwrap();
        "Show"
    } else {
        let _ = window.move_window(Position::BottomRight);
        window.show().unwrap();
        let _ = window.unminimize();
        let _ = window.set_focus();
        //let _ = window.center();
        "Hide"
    };
    let _ = app.tray_handle().get_item("toggle").set_title(new_title);
}

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let toggle = CustomMenuItem::new("toggle".to_string(), "Show");
    // let home = CustomMenuItem::new("home".to_string(), "Home");
    let tray_menu = SystemTrayMenu::new()
        .add_item(toggle)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    let system_tray = SystemTray::new().with_menu(tray_menu);
    tauri::Builder::default()
        .plugin(PluginBuilder::default().build())
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_oauth::init())
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            println!("tauri_plugin_single_instance");
        }))
        .setup(|app| {
            let window = WindowBuilder::new(app, "main", WindowUrl::default())
                .title(" API Validation")
                .inner_size(500., 400.)
                .resizable(false)
                .transparent(false)
                .decorations(false)
                .skip_taskbar(true)
                .always_on_top(true)
                .min_inner_size(500., 400.)
                .build()?;
            #[allow(unused_mut)]
            let _ = window.move_window(Position::BottomRight);
            window.hide();
            // let _ = window_shadows::set_shadow(&window, true);
            // let _ = window_vibrancy::apply_blur(&window, Some((0, 0, 0, 0)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![login, update_tray_icon])
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                println!("left cllick");
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
                window.set_focus().unwrap();
            }
            SystemTrayEvent::MenuItemClick { id, .. } => {
                let item_handle = app.tray_handle().get_item(&id);
                match id.as_str() {
                    "toggle" => {
                        // Todo
                    }
                    "quit" => {
                        std::process::exit(0);
                    }
                    "hide" => {
                        let window = app.get_window("main").unwrap();
                        let new_title = if window.is_visible().unwrap() {
                            window.hide().unwrap();
                            "Show"
                        } else {
                            window.show().unwrap();
                            "Hide"
                        };
                        item_handle.set_title(new_title).unwrap();
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .on_window_event(|event| match event.event() {
            WindowEvent::Focused(f) if !f => {
                let window = event.window().get_window("main").unwrap();
                window.hide().unwrap();
                let _ = event
                    .window()
                    .app_handle()
                    .tray_handle()
                    .get_item("toggle")
                    .set_title("Show");
            }
            _ => {}
        })
        .on_system_tray_event(|app, event| {
            on_tray_event(app, &event);
            match event {
                SystemTrayEvent::LeftClick {
                    position: _,
                    size: _,
                    ..
                } => {
                    toggle_window(app);
                }
                /* SystemTrayEvent::RightClick {
                  position: _,
                  size: _,
                  ..
                } => {
                  println!("system tray received a right click");
                } */
                /* SystemTrayEvent::DoubleClick {
                  position: _,
                  size: _,
                  ..
                } => {
                  println!("system tray received a double click");
                } */
                SystemTrayEvent::MenuItemClick { id, .. } => {
                    // let item_handle = app.tray_handle().get_item(&id);
                    match id.as_str() {
                        "quit" => {
                            // std::process::exit(0);
                            //the below command can also be used (taken from example code)
                            app.exit(0);
                        }
                        "toggle" => {
                            toggle_window(app);
                        }
                        _ => {}
                    }
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// #[cfg(target_os = "macos")]
// use cocoa::appkit::{NSWindow, NSWindowStyleMask, NSWindowTitleVisibility};

// pub trait WindowExt {
//     #[cfg(target_os = "macos")]
//     fn set_transparent_titlebar(&self, title_transparent: bool, remove_toolbar: bool);
// }

// impl<R: Runtime> WindowExt for Window<R> {
//     #[cfg(target_os = "macos")]
//     fn set_transparent_titlebar(&self, title_transparent: bool, remove_tool_bar: bool) {
//         unsafe {
//             let id = self.ns_window().unwrap() as cocoa::base::id;
//             NSWindow::setTitlebarAppearsTransparent_(id, cocoa::base::YES);
//             let mut style_mask = id.styleMask();
//             style_mask.set(
//                 NSWindowStyleMask::NSFullSizeContentViewWindowMask,
//                 title_transparent,
//             );

//             if remove_tool_bar {
//                 style_mask.remove(
//                     NSWindowStyleMask::NSClosableWindowMask
//                         | NSWindowStyleMask::NSMiniaturizableWindowMask
//                         | NSWindowStyleMask::NSResizableWindowMask,
//                 );
//             }

//             id.setStyleMask_(style_mask);

//             id.setTitleVisibility_(if title_transparent {
//                 NSWindowTitleVisibility::NSWindowTitleHidden
//             } else {
//                 NSWindowTitleVisibility::NSWindowTitleVisible
//             });

//             id.setTitlebarAppearsTransparent_(if title_transparent {
//                 cocoa::base::YES
//             } else {
//                 cocoa::base::NO
//             });
//         }
//     }
// }
