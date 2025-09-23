/* exported getMyPreference, saveMyPreferenceByKey, deepSanitizeFrontend */

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
  const myPreferenceString = localStorage.getItem('preference');
  if (myPreferenceString && myPreferenceString !== '') {
    try {
      myPreference = JSON.parse(myPreferenceString);
      myPreference = deepSanitizeFrontend(myPreference);
    } catch(ignore) {}
  }
  return myPreference;
}

function saveMyPreferenceByKey(key, value) {
  let myPreference = {};
  const myPreferenceString = localStorage.getItem('preference');

  if (myPreferenceString && myPreferenceString !== '') {
    try {
      myPreference = JSON.parse(myPreferenceString);
    } catch (ignore) {
      myPreference = {};
    }
  }

  // Update or add the key/value
  myPreference[key] = value;

  try {
    localStorage.setItem('preference', JSON.stringify(myPreference));
  } catch (ignore) {
    // Optional: handle quota exceeded or storage errors
  }
}
