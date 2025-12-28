import type { AlarmCreateInfo, AlarmInfo, ChromeAlarmsAPI } from "./types.ts";

function mapAlarm(alarm: chrome.alarms.Alarm): AlarmInfo {
  return {
    name: alarm.name,
    scheduledTime: alarm.scheduledTime,
    periodInMinutes: alarm.periodInMinutes,
  };
}

export function createChromeAlarms(): ChromeAlarmsAPI {
  return {
    create(name: string, alarmInfo: AlarmCreateInfo): void {
      chrome.alarms.create(name, alarmInfo);
    },

    async clear(name: string): Promise<boolean> {
      return chrome.alarms.clear(name);
    },

    onAlarm: {
      addListener(callback: (alarm: AlarmInfo) => void) {
        chrome.alarms.onAlarm.addListener((alarm) => {
          callback(mapAlarm(alarm));
        });
      },
      removeListener(callback: (alarm: AlarmInfo) => void) {
        chrome.alarms.onAlarm.removeListener(callback as (alarm: chrome.alarms.Alarm) => void);
      },
    },
  };
}
