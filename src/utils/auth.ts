
import { apiRequest, apiRequestAuth } from '../utils/api-requests';
import { AuthResponse, AuthState, AuthTokenResponse } from '../types';
import { Constants } from '../utils/constants';
import { User } from '../typesGithub';
import { open } from '@tauri-apps/api/shell';
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event'

export const authGitHub = (
  authOptions = Constants.DEFAULT_AUTH_OPTIONS
): Promise<AuthResponse> => {
  return new Promise(async (resolve, reject) => {
    // Build the OAuth consent page URL
    // const authWindow = new BrowserWindow({
    //   width: 800,
    //   height: 600,
    //   show: true,
    // });

    const redirect_uri = await invoke('login');
    const githubUrl = `https://${authOptions.hostname}/login/oauth/authorize`;
    const authUrl = `${githubUrl}?client_id=${authOptions.clientId}&scope=${Constants.AUTH_SCOPE}&redirect_uri=${redirect_uri}`;
    console.log('authGitHub', authUrl)
    function onAuth(event: any) {
      unlisten()
      const url = event.payload;
      console.log('onAuth', url)
      const raw_code = /code=([^&]*)/.exec(url) || null;
      const authCode = raw_code && raw_code.length > 1 ? raw_code[1] : null;
      const error = /\?error=(.+)$/.exec(url);

      // If there is a code, proceed to get token from github
      if (authCode) {
        resolve({ authCode, authOptions });
      } else if (error) {
        reject(
          "Oops! Something went wrong and we couldn't " +
            'log you in using Github. Please try again.'
        );
      }
    }

    const unlisten = await listen('auth_url', onAuth);
    open(authUrl)
    // const session = authWindow.webContents.session;
    // session.clearStorageData();

    // authWindow.loadURL(authUrl);

    // const handleCallback = (url: string) => {
    //   const raw_code = /code=([^&]*)/.exec(url) || null;
    //   const authCode = raw_code && raw_code.length > 1 ? raw_code[1] : null;
    //   const error = /\?error=(.+)$/.exec(url);
    //   if (authCode || error) {
    //     // Close the browser if code found or error
    //     authWindow.destroy();
    //   }
    //   // If there is a code, proceed to get token from github
    //   if (authCode) {
    //     resolve({ authCode, authOptions });
    //   } else if (error) {
    //     reject(
    //       "Oops! Something went wrong and we couldn't " +
    //         'log you in using Github. Please try again.'
    //     );
    //   }
    // };

    // // If "Done" button is pressed, hide "Loading"
    // authWindow.on('close', () => {
    //   authWindow.destroy();
    // });

    // authWindow.webContents.on(
    //   'did-fail-load',
    //   (event: any, errorCode: any, errorDescription: any, validatedURL: string | string[]) => {
    //     if (validatedURL.includes(authOptions.hostname)) {
    //       authWindow.destroy();
    //       reject(
    //         `Invalid Hostname. Could not load https://${authOptions.hostname}/.`
    //       );
    //     }
    //   }
    // );

    // authWindow.webContents.on('will-redirect', (event: { preventDefault: () => void; }, url: string) => {
    //   event.preventDefault();
    //   handleCallback(url);
    // });

    // authWindow.webContents.on('will-navigate', (event: { preventDefault: () => void; }, url: string) => {
    //   event.preventDefault();
    //   handleCallback(url);
    // });
  });
};

export const getUserData = async (
  token: string,
  hostname: string
): Promise<User> => {
  const response = await apiRequestAuth(
    `https://api.${hostname}/user`,
    'GET',
    token
  );

  return {
    id: response.data.id,
    login: response.data.login,
    name: response.data.name,
  };
};

export const getToken = async (
  authCode: string,
  authOptions = Constants.DEFAULT_AUTH_OPTIONS
): Promise<AuthTokenResponse> => {
  const url = `https://${authOptions.hostname}/login/oauth/access_token`;
  console.log('getToken', url)
  const data = {
    client_id: authOptions.clientId,
    client_secret: authOptions.clientSecret,
    code: authCode,
  };

  const response = await apiRequest(url, 'POST', data);
  console.log('getToken done', response)
  return {
    hostname: authOptions.hostname,
    token: response.data.access_token,
  };
};

export const addAccount = (
  accounts: AuthState,
  token: string,
  hostname: string,
  user?: User
): AuthState => {
  if (hostname === Constants.DEFAULT_AUTH_OPTIONS.hostname) {
    return {
      ...accounts,
      token,
      user: user ?? null,
    };
  }

  return {
    ...accounts,
    enterpriseAccounts: [
      ...accounts.enterpriseAccounts,
      {
        token,
        hostname: hostname,
      },
    ],
  };
};
