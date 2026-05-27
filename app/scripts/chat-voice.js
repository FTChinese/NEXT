/* jshint ignore:start */
(function() {
  const MAX_RECORDING_SECONDS = 30;
  const MIN_RECORDING_MS = 1000;
  const VOICE_ENDPOINT = '/api/chat/voice';
  const POWER_TRANSLATE_VOICE_ENDPOINT = '/api/chat/voice';
  const FRONTEND_TEST_ENDPOINT = '/api/page/chat_voice.json';
  const SUPPORTED_MIME_TYPES = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
    'audio/mpeg'
  ];

  let voiceButton;
  let voiceStatus;
  let voiceStatusText;
  let voiceProgress;
  let recorder;
  let mediaStream;
  let chunks = [];
  let recordingStartedAt = 0;
  let recordingTimer;
  let hardStopTimer;
  let hideStatusTimer;
  let voiceEligible = false;
  let voiceMode = 'idle';
  let currentVoiceId = '';
  let startRequestId = 0;

  function getVoiceTestMode() {
    return isFrontendTest || /(?:[?#&])voiceTest=1(?:$|&)/.test(location.href);
  }

  function getCookieValue(name) {
    if (typeof GetCookie === 'function') {
      return GetCookie(name);
    }
    return null;
  }

  function hasB2BValue(value) {
    return /b2b/i.test(`${value || ''}`);
  }

  function hasCurrentExpire(expireValue) {
    const expire = parseInt(expireValue || '', 10);
    if (!expire) {
      return true;
    }
    return new Date().getTime() / 1000 <= expire;
  }

  function isPremiumPaywallValue(value) {
    return value === 'premium' || value === 'vip';
  }

  function isStaffVoiceRole(value) {
    return ['admin', 'dev', 'editor', 'edit', 'marketing'].indexOf(`${value || ''}`.trim().toLowerCase()) >= 0;
  }

  function isPremiumB2BPayorder(data = {}) {
    const membership = data.membership || {};
    const premium = data.premium === 1 ||
      isPremiumPaywallValue(data.paywall) ||
      isPremiumPaywallValue(data.tier) ||
      isPremiumPaywallValue(data.webPrivilegeTier) ||
      isPremiumPaywallValue(membership.tier) ||
      isPremiumPaywallValue(membership.webPrivilegeTier) ||
      data.vip === true ||
      membership.vip === true;
    if (!premium) {
      return false;
    }

    return hasB2BValue(data.source) ||
      hasB2BValue(data.payMethod) ||
      hasB2BValue(data.normalizedPayMethod) ||
      hasB2BValue(data.paymentMethod) ||
      hasB2BValue(data.payorder) ||
      hasB2BValue(membership.payMethod) ||
      hasB2BValue(membership.normalizedPayMethod) ||
      Boolean(data.b2bLicenceId || data.b2bLicenseId || membership.b2bLicenceId || membership.b2bLicenseId);
  }

  function hasVoicePermission(data = {}) {
    const membership = data.membership || {};
    return data.voiceInput === 1 ||
      data.voiceInput === true ||
      isStaffVoiceRole(data.staffRole) ||
      isStaffVoiceRole(data.role) ||
      isStaffVoiceRole(membership.staffRole) ||
      isStaffVoiceRole(membership.role) ||
      isPremiumB2BPayorder(data);
  }

  function getNativeEligibilitySnapshot() {
    const membership = window.androidUserInfo?.membership;
    if (!membership) {
      return null;
    }
    return {
      premium: membership.tier === 'premium' || membership.tier === 'vip' || membership.webPrivilegeTier === 'premium' || membership.vip === true ? 1 : 0,
      membership
    };
  }

  function getCookieEligibilitySnapshot() {
    const paywall = getCookieValue('paywall');
    const expire = getCookieValue('expire') || getCookieValue('paywall_expire');
    return {
      paywall,
      source: getCookieValue('paywall_source'),
      role: getCookieValue('userRole'),
      expire
    };
  }

  async function fetchPaywallEligibility() {
    try {
      const response = await fetch('/index.php/jsapi/paywall', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      });
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data.paywall === 0 && hasVoicePermission(data);
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async function checkVoiceEligibility() {
    if (getVoiceTestMode()) {
      return true;
    }

    const paywallEligibility = await fetchPaywallEligibility();
    if (paywallEligibility !== null) {
      return paywallEligibility;
    }

    const nativeSnapshot = getNativeEligibilitySnapshot();
    if (nativeSnapshot && hasVoicePermission(nativeSnapshot)) {
      return true;
    }

    const cookieSnapshot = getCookieEligibilitySnapshot();
    if (
      hasVoicePermission(cookieSnapshot) &&
      hasCurrentExpire(cookieSnapshot.expire)
    ) {
      return true;
    }

    return false;
  }

  function getPreferredMimeType() {
    if (!window.MediaRecorder || typeof MediaRecorder.isTypeSupported !== 'function') {
      return '';
    }
    for (const mimeType of SUPPORTED_MIME_TYPES) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }
    return '';
  }

  function getVoiceEndpoint() {
    if (window.chatVoiceEndpoint) {
      return window.chatVoiceEndpoint;
    }
    if (getVoiceTestMode() && !isPowerTranslate) {
      return FRONTEND_TEST_ENDPOINT;
    }
    return isPowerTranslate ? POWER_TRANSLATE_VOICE_ENDPOINT : VOICE_ENDPOINT;
  }

  function generateVoiceId() {
    if (window.crypto && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    if (typeof guid === 'function') {
      return guid();
    }
    return generateRequestId();
  }

  function getAudioExtension(blobType) {
    if (/mp4|aac/.test(blobType)) {
      return 'm4a';
    }
    if (/mpeg|mp3/.test(blobType)) {
      return 'mp3';
    }
    if (/wav/.test(blobType)) {
      return 'wav';
    }
    return 'webm';
  }

  function setVoiceStatus(text, progress) {
    if (!voiceStatus || !voiceStatusText || !voiceProgress) {
      return;
    }
    voiceStatusText.innerHTML = text || '';
    voiceProgress.style.width = `${Math.max(0, Math.min(100, progress || 0))}%`;
  }

  function showVoiceStatus() {
    clearTimeout(hideStatusTimer);
    hideStatusTimer = null;
    if (voiceStatus) {
      voiceStatus.classList.add('on');
    }
  }

  function hideVoiceStatus(delay = 0) {
    clearTimeout(hideStatusTimer);
    const hide = function() {
      if (voiceStatus) {
        voiceStatus.classList.remove('on');
      }
      setVoiceStatus('', 0);
      hideStatusTimer = null;
    };
    if (delay > 0) {
      hideStatusTimer = setTimeout(hide, delay);
      return;
    }
    hide();
  }

  function setVoiceMode(mode) {
    voiceMode = mode || 'idle';
    const chatInput = voiceButton?.closest('.chat-input');
    if (!voiceButton || !chatInput) {
      return;
    }
    chatInput.classList.remove('voice-recording', 'voice-processing');
    voiceButton.classList.remove('recording', 'processing');
    voiceButton.removeAttribute('disabled');
    if (mode === 'recording') {
      chatInput.classList.add('voice-recording');
      voiceButton.classList.add('recording');
      voiceButton.setAttribute('aria-label', localize('chatVoiceStop'));
      voiceButton.setAttribute('title', localize('chatVoiceStop'));
    } else if (mode === 'processing') {
      chatInput.classList.add('voice-processing');
      voiceButton.classList.add('processing');
      voiceButton.setAttribute('disabled', true);
      voiceButton.setAttribute('aria-label', localize('chatVoiceProcessing'));
      voiceButton.setAttribute('title', localize('chatVoiceProcessing'));
    } else if (mode === 'starting') {
      voiceButton.setAttribute('disabled', true);
      voiceButton.setAttribute('aria-label', localize('chatVoiceInput'));
      voiceButton.setAttribute('title', localize('chatVoiceInput'));
    } else {
      voiceButton.setAttribute('aria-label', localize('chatVoiceInput'));
      voiceButton.setAttribute('title', localize('chatVoiceInput'));
    }
  }

  function cleanupRecording() {
    clearInterval(recordingTimer);
    clearTimeout(hardStopTimer);
    recordingTimer = null;
    hardStopTimer = null;
    if (mediaStream) {
      for (const track of mediaStream.getTracks()) {
        track.stop();
      }
      mediaStream = null;
    }
    recorder = null;
    chunks = [];
  }

  function updateRecordingStatus() {
    const elapsedMs = new Date().getTime() - recordingStartedAt;
    const elapsedSeconds = Math.min(MAX_RECORDING_SECONDS, Math.ceil(elapsedMs / 1000));
    const progress = elapsedMs / (MAX_RECORDING_SECONDS * 1000) * 100;
    setVoiceStatus(localize('chatVoiceRecording', '', {seconds: elapsedSeconds}), progress);
  }

  async function startRecording() {
    if (voiceMode !== 'idle') {
      return;
    }
    if (!voiceEligible) {
      showError(localize('chatVoiceEligibilityRequired'));
      return;
    }
    if (botStatus === 'pending') {
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
      showError(localize('chatVoiceNotSupported'));
      return;
    }

    try {
      const requestId = startRequestId + 1;
      startRequestId = requestId;
      setVoiceMode('starting');
      hideVoiceStatus();
      currentVoiceId = generateVoiceId();
      const mimeType = getPreferredMimeType();
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (requestId !== startRequestId || voiceMode !== 'starting') {
        for (const track of mediaStream.getTracks()) {
          track.stop();
        }
        mediaStream = null;
        return;
      }
      chunks = [];
      recorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : undefined);
      recorder.ondataavailable = function(event) {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      recorder.onstop = handleRecorderStop;
      recordingStartedAt = new Date().getTime();
      recorder.start();
      setVoiceMode('recording');
      showVoiceStatus();
      updateRecordingStatus();
      recordingTimer = setInterval(updateRecordingStatus, 200);
      hardStopTimer = setTimeout(stopRecording, MAX_RECORDING_SECONDS * 1000);
      trackVoiceEvent('record_start');
    } catch (err) {
      cleanupRecording();
      setVoiceMode('idle');
      hideVoiceStatus();
      console.log(err);
      showError(localize('chatVoicePermissionDenied'));
    }
  }

  function stopRecording() {
    if (!recorder || recorder.state === 'inactive') {
      return;
    }
    if (typeof recorder.requestData === 'function' && recorder.state === 'recording') {
      try {
        recorder.requestData();
      } catch (err) {}
    }
    recorder.stop();
  }

  async function handleRecorderStop() {
    const durationMs = new Date().getTime() - recordingStartedAt;
    const mimeType = recorder?.mimeType || getPreferredMimeType() || 'audio/webm';
    const blob = new Blob(chunks, { type: mimeType });
    cleanupRecording();

    if (durationMs < MIN_RECORDING_MS || blob.size === 0) {
      setVoiceMode('idle');
      hideVoiceStatus();
      showError(localize('chatVoiceTooShort'));
      return;
    }

    setVoiceMode('processing');
    showVoiceStatus();
    setVoiceStatus(localize('chatVoiceProcessing'), 100);
    let keepStatusVisible = false;
    try {
      const result = await transcribeVoice(blob, durationMs, currentVoiceId);
      if (result.status === 'success' && result.text) {
        insertTranscript(result.text);
        setVoiceStatus(localize('chatVoiceReady'), 100);
        hideVoiceStatus(1200);
        keepStatusVisible = true;
        trackVoiceEvent('transcribe_success');
      } else if (result.status === 'PermissionRequired') {
        showError(localize('chatVoiceEligibilityRequired'));
      } else {
        showError(getVoiceErrorMessage(result));
      }
    } catch (err) {
      console.log(err);
      showError(localize('chatVoiceTranscriptionFailed'));
    } finally {
      setVoiceMode('idle');
      if (!keepStatusVisible) {
        hideVoiceStatus();
      }
    }
  }

  function getVoiceErrorMessage(result = {}) {
    if (result.error === 'duration_too_short' || result.error === 'too_short') {
      return localize('chatVoiceTooShort');
    }
    if (result.error === 'transcription_failed' || result.message === 'Voice transcription failed.') {
      return localize('chatVoiceTranscriptionFailed');
    }
    return result.message || localize('chatVoiceTranscriptionFailed');
  }

  async function transcribeVoice(blob, durationMs, voiceId) {
    const endpoint = getVoiceEndpoint();
    if (endpoint === FRONTEND_TEST_ENDPOINT) {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.json();
    }

    const extension = getAudioExtension(blob.type);
    const formData = new FormData();
    formData.append('voice_id', voiceId);
    formData.append('audio', blob, `${voiceId}.${extension}`);
    formData.append('duration_ms', `${Math.min(durationMs, MAX_RECORDING_SECONDS * 1000)}`);
    formData.append('max_duration_seconds', `${MAX_RECORDING_SECONDS}`);
    formData.append('language', preferredLanguage || navigator.language || '');
    formData.append('intention', window.intention || intention || '');
    formData.append('ftid', typeof getCurrentArticleFTId === 'function' ? getCurrentArticleFTId() : '');
    formData.append('page_url', location.href);
    formData.append('delete_audio_after_transcription', '1');

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin'
    });
    const result = await response.json();
    if (!response.ok && result && !result.status) {
      result.status = 'failed';
    }
    return result;
  }

  function insertTranscript(text) {
    const transcript = `${text || ''}`.trim();
    if (transcript === '') {
      return;
    }

    userInput.focus();
    const currentValue = userInput.value || '';
    const start = typeof userInput.selectionStart === 'number' ? userInput.selectionStart : currentValue.length;
    const end = typeof userInput.selectionEnd === 'number' ? userInput.selectionEnd : currentValue.length;
    const prefix = currentValue.slice(0, start);
    const suffix = currentValue.slice(end);
    const separatorBefore = prefix !== '' && !/[\s\n]$/.test(prefix) ? ' ' : '';
    const separatorAfter = suffix !== '' && !/^[\s\n]/.test(suffix) ? ' ' : '';
    userInput.value = `${prefix}${separatorBefore}${transcript}${separatorAfter}${suffix}`;
    const cursorPosition = `${prefix}${separatorBefore}${transcript}`.length;
    userInput.setSelectionRange(cursorPosition, cursorPosition);
    userInput.style.height = 'auto';
    userInput.style.height = userInput.scrollHeight + 'px';
  }

  function trackVoiceEvent(action) {
    try {
      if (typeof trackEvent === 'function') {
        trackEvent(action, 'chatbot_voice');
      }
    } catch (err) {}
  }

  function buildVoiceStatus() {
    const chatInput = voiceButton?.closest('.chat-input');
    if (!chatInput || document.getElementById('chat-voice-status')) {
      voiceStatus = document.getElementById('chat-voice-status');
      voiceStatusText = document.getElementById('chat-voice-status-text');
      voiceProgress = document.getElementById('chat-voice-progress-bar');
      return;
    }
    voiceStatus = document.createElement('div');
    voiceStatus.className = 'chat-voice-status';
    voiceStatus.id = 'chat-voice-status';
    voiceStatus.innerHTML = [
      '<span class="chat-voice-dot"></span>',
      '<span class="chat-voice-status-text" id="chat-voice-status-text"></span>',
      '<span class="chat-voice-progress"><span id="chat-voice-progress-bar"></span></span>'
    ].join('');
    chatInput.appendChild(voiceStatus);
    voiceStatusText = document.getElementById('chat-voice-status-text');
    voiceProgress = document.getElementById('chat-voice-progress-bar');
  }

  async function initChatVoiceInput() {
    voiceButton = document.getElementById('chat-voice-input');
    if (!voiceButton) {
      return;
    }
    buildVoiceStatus();
    voiceButton.addEventListener('click', function() {
      if (voiceMode === 'starting' || voiceMode === 'processing') {
        return;
      }
      if (recorder && recorder.state === 'recording') {
        stopRecording();
        return;
      }
      startRecording();
    });

    voiceEligible = await checkVoiceEligibility();
    if (!voiceEligible) {
      voiceButton.classList.add('hide');
      return;
    }
    const chatInput = voiceButton.closest('.chat-input');
    if (chatInput) {
      chatInput.classList.add('voice-enabled');
    }
    voiceButton.classList.remove('hide');
    setVoiceMode('idle');
  }

  initChatVoiceInput();
})();
/* jshint ignore:end */
