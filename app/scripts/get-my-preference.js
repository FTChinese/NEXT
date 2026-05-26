/* exported getMyPreference, savePreference, saveMyPreferenceByKey, syncPreferencesWithServer, checkPreferencesFromServer, clearAllPreferences, deepSanitizeFrontend, decodeHTMLEntitiesFrontend, isMyFTInterestPreferenceMode, clearLegacyMyFTFollowStorage */
/* global updateNavigation */

const preferenceInterestKeys = ['My Interests', 'My Custom Interests'];
const myFTInterestSchemaVersionKey = 'myft_interest_schema_version';
const myFTInterestPreferenceModeKey = 'myft_interest_preference_mode';
const legacyMyFTFollowStorageKeys = ['my-ft-follow', 'my-ft-follow-ftc', 'last_sync_time'];

function isSuspiciousValue(value) {
    if (typeof value !== 'string') {
        return false;
    }
    const lower = value.toLowerCase();
    return (
        /[<>"]/.test(value) ||
        /javascript\s*:/.test(lower) ||
        /onerror=/.test(lower)
    );
}

function decodeHTMLEntitiesFrontend(value) {
    if (typeof value !== 'string' || value.indexOf('&') === -1) {
        return value;
    }

    if (typeof document === 'object' && document.createElement) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = value;
        return textarea.value;
    }

    return value
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&#x27;/g, '\'')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

function normalizeInterestItem(item) {
    if (!item || typeof item !== 'object') {
        return item;
    }
    const normalizedItem = {...item};
    for (const key of ['key', 'display', 'type']) {
        if (typeof normalizedItem[key] === 'string') {
            normalizedItem[key] = decodeHTMLEntitiesFrontend(normalizedItem[key]);
        }
    }
    return normalizedItem;
}

function normalizePreferenceEntities(preference) {
    if (!preference || typeof preference !== 'object') {
        return {};
    }
    for (const preferenceKey of preferenceInterestKeys) {
        if (!Array.isArray(preference[preferenceKey])) {
            continue;
        }
        const seen = new Set();
        preference[preferenceKey] = preference[preferenceKey]
            .map(normalizeInterestItem)
            .filter(item => {
                if (!item || typeof item !== 'object') {
                    return true;
                }
                const name = item.key || '';
                if (name === '') {
                    return true;
                }
                const itemKey = `${item.type || ''}\u0000${name}`;
                if (seen.has(itemKey)) {
                    return false;
                }
                seen.add(itemKey);
                return true;
            });
    }
    return preference;
}

function getMyFTInterestSchemaVersion(preference) {
    const version = Number(preference?.[myFTInterestSchemaVersionKey] || 0);
    return Number.isFinite(version) ? version : 0;
}

function isMyFTInterestPreferenceMode(preference) {
    if (!preference || typeof preference !== 'object') {
        preference = getMyPreference();
    }
    return preference?.[myFTInterestPreferenceModeKey] === true || getMyFTInterestSchemaVersion(preference) > 0;
}

function clearLegacyMyFTFollowStorage() {
    if (typeof localStorage !== 'object') {
        return;
    }
    try {
        for (const storageKey of legacyMyFTFollowStorageKeys) {
            localStorage.removeItem(storageKey);
        }
    } catch (err) {
        console.warn('Failed to clear legacy MyFT follow storage:', err);
    }
}

function deepSanitizeFrontend(obj) {
    if (Array.isArray(obj)) {
        return obj
            .map(deepSanitizeFrontend)
            .filter(item => {
                if (typeof item === 'object' && item !== null) {
                    return !Object.values(item).some(isSuspiciousValue);
                }
                return !isSuspiciousValue(item);
            });
    } else if (typeof obj === 'object' && obj !== null) {
        const sanitized = {};
        for (const key in obj) {
            sanitized[key] = deepSanitizeFrontend(obj[key]);
        }
        return sanitized;
    } else {
        return obj;
    }
}

function getMyPreference() {
  let myPreference = {};
  if (typeof localStorage !== 'object') {
    return myPreference;
  }
  const myPreferenceString = localStorage.getItem('preference');
  if (myPreferenceString && myPreferenceString !== '') {
    try {
      myPreference = JSON.parse(myPreferenceString);
      myPreference = normalizePreferenceEntities(myPreference);
      myPreference = deepSanitizeFrontend(myPreference);
    } catch(ignore) {}
  }
  return myPreference;
}

function clonePreference(preference) {
  if (!preference || typeof preference !== 'object') {
    return {};
  }
  try {
    return JSON.parse(JSON.stringify(preference));
  } catch (ignore) {
    return {};
  }
}

function writePreferenceToLocalStorage(preference) {
  if (typeof localStorage !== 'object') {
    return;
  }
  try {
    localStorage.setItem('preference', JSON.stringify(preference));
  } catch (err) {
    console.error('Failed to save preference locally: ', err);
  }
}

function notifyPreferenceUpdated() {
  if (typeof updateNavigation !== 'function') {
    return;
  }
  try {
    const result = updateNavigation();
    if (result && typeof result.catch === 'function') {
      result.catch(error => {
        console.error('Failed to updateNavigation: ', error);
      });
    }
  } catch (err) {
    console.error('Failed to updateNavigation: ', err);
  }
}

function debouncePreferenceSync(func, delay) {
  let debounceTimer;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
}

async function syncPreferencesWithServer(preference) {
  if (typeof fetch !== 'function') {
    return false;
  }
  try {
    const response = await fetch('/save_preference', {
      method: 'POST',
      keepalive: true,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    });
    if (!response.ok) {
      if (response.status !== 401 && response.status !== 403) {
        console.warn('Failed to sync preferences with the server: ', response.status);
      }
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to sync preferences with the server: ', error);
    return false;
  }
}

const debouncedSyncPreferences = debouncePreferenceSync(syncPreferencesWithServer, 5000);

async function savePreference(myPreference, options) {
  const opts = options || {};
  let preference = clonePreference(myPreference);
  preference = normalizePreferenceEntities(preference);
  preference = deepSanitizeFrontend(preference);
  preference.time = new Date();

  writePreferenceToLocalStorage(preference);
  notifyPreferenceUpdated();

  if (opts.sync === false) {
    return preference;
  }

  if (opts.immediate === true) {
    await syncPreferencesWithServer(preference);
    return preference;
  }

  debouncedSyncPreferences(preference);
  return preference;
}

function saveMyPreferenceByKey(key, value) {
  const myPreference = getMyPreference();
  myPreference[key] = value;
  savePreference(myPreference);
}

async function clearAllPreferences() {
  try {
    if (typeof localStorage === 'object') {
      localStorage.removeItem('preference');
    }
    notifyPreferenceUpdated();
    if (typeof fetch !== 'function') {
      return false;
    }
    const response = await fetch('/delete_preference', {
      method: 'DELETE',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch(err) {
    console.error('clearAllPreferences error: ');
    console.log(err);
    return false;
  }
}

async function checkPreferencesFromServer() {
  if (typeof fetch !== 'function') {
    return false;
  }
  try {
    const response = await fetch('/check_preference', {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      return false;
    }
    const results = await response.json();
    if (results?.status !== 'OK' || !results?.preference) {
      return false;
    }

    const serverPreference = deepSanitizeFrontend(normalizePreferenceEntities(results.preference));
    const localPreference = getMyPreference();
    const defaultTime = '2000-01-01 00:00:00';
    const serverTime = new Date(serverPreference?.time ?? defaultTime).getTime();
    const localTime = new Date(localPreference?.time ?? defaultTime).getTime();
    const serverSchemaVersion = getMyFTInterestSchemaVersion(serverPreference);
    const localSchemaVersion = getMyFTInterestSchemaVersion(localPreference);

    if (serverSchemaVersion > localSchemaVersion || serverTime > localTime) {
      writePreferenceToLocalStorage(serverPreference);
      if (isMyFTInterestPreferenceMode(serverPreference)) {
        clearLegacyMyFTFollowStorage();
      }
      notifyPreferenceUpdated();
      return true;
    }

    if (serverTime < localTime) {
      await syncPreferencesWithServer(localPreference);
      if (isMyFTInterestPreferenceMode(localPreference)) {
        clearLegacyMyFTFollowStorage();
      }
      return true;
    }

    if (isMyFTInterestPreferenceMode(serverPreference)) {
      clearLegacyMyFTFollowStorage();
    }

    return true;
  } catch(err) {
    console.error('checkPreferencesFromServer error: ');
    console.log(err);
    return false;
  }
}
