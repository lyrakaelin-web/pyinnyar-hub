import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapApp } from '@capacitor/app';

let isNativeInitialized = false;
let globalBackListener: PluginListenerHandle | null = null;
let activeBackHandler: (() => boolean) | null = null;

/**
 * Initializes native Capacitor plugins on Android & iOS mobile runtimes once.
 * Gracefully degrades to a no-op in standard web browser environments.
 */
export const initCapacitorApp = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform() || isNativeInitialized) {
    return;
  }
  isNativeInitialized = true;

  try {
    // 1. Set Native Status Bar appearance
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#14243A' });
    }
  } catch (err) {
    console.debug('StatusBar setup notice:', err);
  }

  try {
    // 2. Hide Splash Screen smoothly once UI has mounted
    await SplashScreen.hide();
  } catch (err) {
    console.debug('SplashScreen hide notice:', err);
  }

  // 3. Register exactly ONE persistent listener for the Android hardware back button
  try {
    globalBackListener = await CapApp.addListener('backButton', ({ canGoBack }) => {
      // First check if the active React screen has registered a custom back behavior
      if (activeBackHandler && activeBackHandler()) {
        return;
      }
      if (canGoBack) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });
  } catch (err) {
    console.debug('App back button listener notice:', err);
  }
};

/**
 * Registers the active view's back button navigation logic.
 * Returns a cleanup function that safely unsets the handler when the view unmounts or changes.
 * Guarantees zero duplicate listeners and zero memory leaks.
 */
export const registerBackButtonHandler = (handler: () => boolean): (() => void) => {
  activeBackHandler = handler;
  return () => {
    if (activeBackHandler === handler) {
      activeBackHandler = null;
    }
  };
};
