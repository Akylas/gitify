import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ArrowLeftIcon } from '@primer/octicons-react';

import { AppContext } from '../context/App';
import { Appearance } from '../types';
import { FieldCheckbox } from '../components/fields/Checkbox';
import { FieldRadioGroup } from '../components/fields/RadioGroup';
import { IconAddAccount } from '../icons/AddAccount';
import { IconLogOut } from '../icons/Logout';
import { IconQuit } from '../icons/Quit';
import { updateTrayIcon } from '../utils/comms';
import { setAppearance } from '../utils/appearance';
import { platform } from '@tauri-apps/api/os';
import { exit } from '@tauri-apps/api/process';
import { getVersion } from '@tauri-apps/api/app';


export const SettingsRoute: React.FC = () => {
  const { settings, updateSetting, logout } = useContext(AppContext);
  const [isLinux, setIsLinux] = useState(false);
  const [appVersion, setAppVersion] = useState(null as unknown as string);
  const history = useHistory();
  const version = 

  useEffect(() => {
    async function getIsLinux() {
        const value = (await platform()) === 'linux';
        setIsLinux(value);
    }
    getIsLinux();
 }, [])
  useEffect(() => {
    async function requestAppVersion() {
      setAppVersion(await getVersion());
    }
    requestAppVersion();
 }, [])
  //TODO: fix
  // ipcRenderer.on('update-native-theme', (_, updatedAppearance: Appearance) => {
  //   if (settings.appearance === Appearance.SYSTEM) {
  //     setAppearance(updatedAppearance);
  //   }
  // });

  const logoutUser = useCallback(() => {
    logout?.();
    history.goBack();
    updateTrayIcon();
  }, []);

  const quitApp = useCallback(() => {
    exit();
  }, []);

  const goToEnterprise = useCallback(() => {
    return history.replace('/login-enterprise');
  }, []);

  const footerButtonClass =
    'hover:text-gray-500 py-1 px-2 my-1 mx-2 focus:outline-none';
  
  return (
    <div className="flex flex-1 flex-col dark:bg-gray-dark dark:text-white">
      <div className="flex justify-between items-center mt-4 py-2 mx-8">
        <button
          className="focus:outline-none"
          aria-label="Go Back"
          onClick={() => history.goBack()}
        >
          <ArrowLeftIcon size={20} className="hover:text-gray-400" />
        </button>

        <h3 className="text-lg font-semibold">Settings</h3>
      </div>

      <div className="flex-1 px-8">
        <FieldRadioGroup
          name="appearance"
          label="Appearance"
          value={settings?.appearance ?? Appearance.SYSTEM}
          options={[
            { label: 'System', value: Appearance.SYSTEM },
            { label: 'Light', value: Appearance.LIGHT },
            { label: 'Dark', value: Appearance.DARK },
          ]}
          onChange={(evt) => {
            updateSetting?.('appearance', evt.target.value);
          }}
        />

        <FieldCheckbox
          name="showOnlyParticipating"
          label="Show only participating"
          checked={settings?.participating ?? false}
          onChange={(evt: { target: { checked: any; }; }) => updateSetting?.('participating', evt.target.checked)}
        />
        <FieldCheckbox
          name="playSound"
          label="Play sound"
          checked={settings?.playSound ?? false}
          onChange={(evt: { target: { checked: any; }; }) => updateSetting?.('playSound', evt.target.checked)}
        />
        <FieldCheckbox
          name="showNotifications"
          label="Show notifications"
          checked={settings?.showNotifications ?? false}
          onChange={(evt: { target: { checked: any; }; }) =>
            updateSetting?.('showNotifications', evt.target.checked)
          }
        />
        <FieldCheckbox
          name="onClickMarkAsRead"
          label="On Click, Mark as Read"
          checked={settings?.markOnClick ?? false}
          onChange={(evt: { target: { checked: any; }; }) => updateSetting?.('markOnClick', evt.target.checked)}
        />
        {!isLinux && (
          <FieldCheckbox
            name="openAtStartUp"
            label="Open at startup"
            checked={settings?.openAtStartup ?? false}
            onChange={(evt: { target: { checked: any; }; }) =>
              updateSetting?.('openAtStartup', evt.target.checked)
            }
          />
        )}
      </div>

      <div className="flex justify-between items-center bg-gray-200 dark:bg-gray-darker py-4 px-8">
        <small className="font-semibold">
          Gitify v{appVersion}
        </small>

        <div>
          <button
            className={footerButtonClass}
            aria-label="Login with GitHub Enterprise"
            onClick={goToEnterprise}
          >
            <IconAddAccount className="w-5 h-5" />
          </button>

          <button
            className={footerButtonClass}
            aria-label="Logout"
            onClick={logoutUser}
          >
            <IconLogOut className="w-5 h-5" />
          </button>

          <button
            className={`${footerButtonClass} mr-0`}
            aria-label="Quit Gitify"
            onClick={quitApp}
          >
            <IconQuit className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
