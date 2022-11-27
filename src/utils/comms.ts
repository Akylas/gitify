import { open } from '@tauri-apps/api/shell';
import { invoke } from '@tauri-apps/api';


export function openExternalLink(url: string): void {
  open(url);
}

export function setAutoLaunch(value: boolean): void {
  // app.setLoginItemSettings({
  //   openAtLogin: value,
  //   openAsHidden: value,
  // });
}

export function updateTrayIcon(notificationsLength = 0): void {
  invoke('update_tray_icon', {active:notificationsLength > 0});
  if (notificationsLength > 0) {
    // ipcRenderer.send('update-icon', 'TrayActive');
  } else {
    // ipcRenderer.send('update-icon');
  }
}

export function reOpenWindow(): void {
  // ipcRenderer.send('reopen-window');
}

export function restoreSetting(setting: string, value: string): void {
  // ipcRenderer.send(setting, value);
}
