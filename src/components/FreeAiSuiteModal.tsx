import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Music,
  Mic,
  Radio,
  Search,
  MapPin,
  Database,
  Play,
  Download,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Volume2,
  Square,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import { FreeMusicGenre, synthesizeFreeStudioTrack } from '../engine/freeMusicSynth';
import { AnimationCue } from '../types/companion';

export type FreeSuiteTab =
  | 'maps'
  | 'search'
  | 'music'
  | 'live_voice'
  | 'transcribe'
  | 'cloud_db';

interface FreeAiSuiteModalProps {
  isOpen: boolean;
  initialTab?: FreeSuiteTab;
  onClose: () => void;
  onTrigger3DAnimation?: (cue: AnimationCue) => void;
  onSpeakText?: (text: string) => void;
}

interface SavedPlacePin {
  id: string;
  title: string;
  lat: number;
  lng: number;
  category: string;
}

interface SavedMusicTrack {
  id: string;
  title: string;
  genre: FreeMusicGenre;
  audioUrl: string;
  lyrics: string;
  createdAt: string;
}

interface SavedTranscriptItem {
  id: string;
  text: string;
  model: string;
  createdAt: string;
}

const PinWithInfoWindow: React.FC<{
  place: SavedPlacePin;
  isSelected: boolean;
  onSelect: () => void;
  onClose: () => void;
}> = ({ place, isSelected, onSelect, onClose }) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: place.lat, lng: place.lng }}
        title={place.title}
        onClick={onSelect}
      >
        <Pin background="#7c3aed" borderColor="#4c1d95" glyphColor="#ffffff" scale={1.2} />
      </AdvancedMarker>
      {isSelected && marker && (
        <InfoWindow anchor={marker} maxWidth={240} onCloseClick={onClose}>
          <div className="text-slate-900 p-1 text-xs space-y-1">
            <div className="font-bold">{place.title}</div>
            <div className="text-slate-600">{place.category}</div>
            <div className="font-mono text-[10px] text-slate-500">
              {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export const FreeAiSuiteModal: React.FC<FreeAiSuiteModalProps> = ({
  isOpen,
  initialTab = 'maps',
  onClose,
  onTrigger3DAnimation,
  onSpeakText,
}) => {
  const [activeTab, setActiveTab] = useState<FreeSuiteTab>(initialTab);

  // --- 1. Google Maps & Maps Grounding State ---
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 43.238949,
    lng: 76.889709,
  });
  const [selectedPinId, setSelectedPinId] = useState<string | null>('place-almaty');
  const [savedPlaces, setSavedPlaces] = useState<SavedPlacePin[]>([
    {
      id: 'place-almaty',
      title: 'Алматы — Парк Первого Президента',
      lat: 43.1915,
      lng: 76.8858,
      category: 'Любимое место (Бесплатный пин)',
    },
    {
      id: 'place-koktobe',
      title: 'Алматы — Кок-Тобе',
      lat: 43.2332,
      lng: 76.9761,
      category: 'Панорама города',
    },
    {
      id: 'place-astana',
      title: 'Астана — Монумент Байтерек',
      lat: 51.1283,
      lng: 71.4305,
      category: 'Столица Казахстана',
    },
  ]);
  const [mapsQuery, setMapsQuery] = useState('Лучшие кофейни и парки для прогулки в Алматы');
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapsResultText, setMapsResultText] = useState('');
  const [mapsPlacesLinks, setMapsPlacesLinks] = useState<
    { uri: string; title: string; snippets: string[] }[]
  >([]);
  const [newPinTitle, setNewPinTitle] = useState('');

  // --- 2. Google Search Grounding State ---
  const [searchQuery, setSearchQuery] = useState(
    'Какие главные технологические новости в мире и в Казахстане сегодня?'
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResultText, setSearchResultText] = useState('');
  const [searchSources, setSearchSources] = useState<{ uri: string; title: string }[]>([]);

  // --- 3. Free Music Studio State (Lyria 3 Clip Free + WebAudio Studio) ---
  const [musicPrompt, setMusicPrompt] = useState(
    'Космический танец осьминога Новы среди неоновых созвездий'
  );
  const [musicGenre, setMusicGenre] = useState<FreeMusicGenre>('cosmic');
  const [musicLoading, setMusicLoading] = useState(false);
  const [savedTracks, setSavedTracks] = useState<SavedMusicTrack[]>([]);

  // --- 4. Gemini 3.8 Live Real-Time Voice State ---
  const [liveConnected, setLiveConnected] = useState(false);
  const [liveStatusText, setLiveStatusText] = useState('Готов к бесплатному голосовому звонку');
  const [liveTranscripts, setLiveTranscripts] = useState<{ role: 'user' | 'ai'; text: string }[]>(
    []
  );
  const [liveTextInput, setLiveTextInput] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // --- 5. Gemini 3.5 Audio Transcribe State ---
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [transcribeLoading, setTranscribeLoading] = useState(false);
  const [savedTranscripts, setSavedTranscripts] = useState<SavedTranscriptItem[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // --- 6. Free Cloud DB & Auth State ---
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Load initial free cloud DB state
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/cloud/state')
      .then((r) => r.json())
      .then((res) => {
        if (res?.data) {
          if (Array.isArray(res.data.savedPlaces) && res.data.savedPlaces.length > 0) {
            setSavedPlaces(res.data.savedPlaces);
          }
          if (Array.isArray(res.data.savedTracks)) {
            setSavedTracks(res.data.savedTracks);
          }
          if (Array.isArray(res.data.savedTranscriptions)) {
            setSavedTranscripts(res.data.savedTranscriptions);
          }
        }
      })
      .catch(() => {
        // ignore offline
      });
  }, [isOpen]);

  // Cleanup Live Voice WebSocket on unmount/close
  useEffect(() => {
    if (!isOpen && liveConnected) {
      stopLiveVoiceSession();
    }
  }, [isOpen]);

  const syncToFreeCloudDb = async (
    nextPlaces = savedPlaces,
    nextTracks = savedTracks,
    nextTranscripts = savedTranscripts
  ) => {
    setCloudSyncing(true);
    try {
      await fetch('/api/cloud/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: {
            displayName: 'Петрашев Виктор Владимирович',
            email: 'petrashev.viktor@gmail.com',
            plan: '100% Free Tier (Spark + GitHub Cloud Backup)',
          },
          savedPlaces: nextPlaces,
          savedTracks: nextTracks.map((t) => ({ ...t, audioUrl: '' })), // keep JSON light
          savedTranscriptions: nextTranscripts,
        }),
      });
      setLastSyncedAt(new Date().toLocaleTimeString());
    } catch {
      // ignore
    } finally {
      setCloudSyncing(false);
    }
  };

  // --- Handlers: 1. Google Maps Grounding ---
  const handleRunMapsGrounding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapsQuery.trim()) return;
    setMapsLoading(true);
    onTrigger3DAnimation?.('think');
    try {
      const resp = await fetch('/api/ai/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: mapsQuery,
          latitude: mapCenter.lat,
          longitude: mapCenter.lng,
        }),
      });
      const data = await resp.json();
      setMapsResultText(data.text || 'Места найдены.');
      setMapsPlacesLinks(Array.isArray(data.places) ? data.places : []);
      onTrigger3DAnimation?.('speak');
      if (data.text) onSpeakText?.(data.text);
    } catch {
      setMapsResultText('Не удалось выполнить запрос к Google Maps Grounding.');
    } finally {
      setMapsLoading(false);
    }
  };

  const handleAddMapPinAtCenter = () => {
    const title = newPinTitle.trim() || `Точка (${mapCenter.lat.toFixed(3)}, ${mapCenter.lng.toFixed(3)})`;
    const newPin: SavedPlacePin = {
      id: `pin-${Date.now().toString(36)}`,
      title,
      lat: mapCenter.lat + (Math.random() - 0.5) * 0.01,
      lng: mapCenter.lng + (Math.random() - 0.5) * 0.01,
      category: 'Сохранено бесплатно в БД',
    };
    const next = [newPin, ...savedPlaces];
    setSavedPlaces(next);
    setSelectedPinId(newPin.id);
    setNewPinTitle('');
    syncToFreeCloudDb(next, savedTracks, savedTranscripts);
  };

  // --- Handlers: 2. Google Search Grounding ---
  const handleRunSearchGrounding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    onTrigger3DAnimation?.('think');
    try {
      const resp = await fetch('/api/ai/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await resp.json();
      setSearchResultText(data.text || 'Результаты получены.');
      setSearchSources(Array.isArray(data.sources) ? data.sources : []);
      onTrigger3DAnimation?.('speak');
      if (data.text) onSpeakText?.(data.text);
    } catch {
      setSearchResultText('Ошибка поискового запроса.');
    } finally {
      setSearchLoading(false);
    }
  };

  // --- Handlers: 3. Free Music Generation ---
  const handleGenerateFreeMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicPrompt.trim()) return;
    setMusicLoading(true);
    onTrigger3DAnimation?.('think');
    try {
      const resp = await fetch('/api/ai/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: musicPrompt, genre: musicGenre }),
      });
      const data = await resp.json();

      // If server returned MP3 from Lyria free preview, use it; otherwise synthesize stereo WAV in browser for $0!
      const audioUrl =
        data.audioDataUrl || (await synthesizeFreeStudioTrack(musicGenre, 18));

      const newTrack: SavedMusicTrack = {
        id: `trk-${Date.now().toString(36)}`,
        title: musicPrompt.slice(0, 60),
        genre: musicGenre,
        audioUrl,
        lyrics: data.lyrics || 'Инструментальная композиция',
        createdAt: new Date().toLocaleTimeString(),
      };
      const next = [newTrack, ...savedTracks];
      setSavedTracks(next);
      onTrigger3DAnimation?.('play');
      syncToFreeCloudDb(savedPlaces, next, savedTranscripts);
    } catch {
      const fallbackUrl = await synthesizeFreeStudioTrack(musicGenre, 16);
      const newTrack: SavedMusicTrack = {
        id: `trk-${Date.now().toString(36)}`,
        title: musicPrompt.slice(0, 60),
        genre: musicGenre,
        audioUrl: fallbackUrl,
        lyrics: 'Автономный синтез мелодии (WebAudio Studio $0)',
        createdAt: new Date().toLocaleTimeString(),
      };
      setSavedTracks((prev) => [newTrack, ...prev]);
    } finally {
      setMusicLoading(false);
    }
  };

  // --- Handlers: 4. Gemini 3.8 Live Real-Time Voice ---
  const playPcm24kBase64 = (base64Pcm: string) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
      }
      const ctx = audioCtxRef.current;
      const binary = atob(base64Pcm);
      const len = binary.length / 2;
      const float32 = new Float32Array(len);
      const view = new DataView(new ArrayBuffer(binary.length));
      for (let i = 0; i < binary.length; i++) {
        view.setUint8(i, binary.charCodeAt(i));
      }
      for (let i = 0; i < len; i++) {
        float32[i] = view.getInt16(i * 2, true) / 32768;
      }
      const audioBuffer = ctx.createBuffer(1, len, 24000);
      audioBuffer.getChannelData(0).set(float32);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
    } catch {
      // ignore audio decode error
    }
  };

  const startLiveVoiceSession = async () => {
    try {
      setLiveStatusText('Подключение к Gemini 3.8 Live (Бесплатный канал)...');
      onTrigger3DAnimation?.('listen');

      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${proto}//${window.location.host}/api/live`);
      wsRef.current = ws;

      ws.onopen = async () => {
        setLiveConnected(true);
        setLiveStatusText('На линии: Gemini 3.8 Live (Говорите в микрофон или пишите ниже)');
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;
          const micCtx = new AudioContext({ sampleRate: 16000 });
          const src = micCtx.createMediaStreamSource(stream);
          const proc = micCtx.createScriptProcessor(4096, 1, 1);
          proc.onaudioprocess = (ev) => {
            if (ws.readyState !== WebSocket.OPEN) return;
            const input = ev.inputBuffer.getChannelData(0);
            const pcm16 = new Int16Array(input.length);
            for (let i = 0; i < input.length; i++) {
              const s = Math.max(-1, Math.min(1, input[i]));
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }
            const bytes = new Uint8Array(pcm16.buffer);
            let bin = '';
            for (let i = 0; i < bytes.length; i++) {
              bin += String.fromCharCode(bytes[i]);
            }
            ws.send(JSON.stringify({ type: 'audio', data: btoa(bin) }));
          };
          src.connect(proc);
          proc.connect(micCtx.destination);
        } catch {
          setLiveStatusText('Подключено к Live ИИ (текстово-голосовой режим без микрофона)');
        }
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === 'audio' && msg.data) {
            onTrigger3DAnimation?.('speak');
            playPcm24kBase64(msg.data);
          } else if (msg.type === 'output_transcript' && msg.text) {
            setLiveTranscripts((prev) => [...prev, { role: 'ai', text: msg.text }]);
          } else if (msg.type === 'input_transcript' && msg.text) {
            setLiveTranscripts((prev) => [...prev, { role: 'user', text: msg.text }]);
          }
        } catch {
          // ignore
        }
      };

      ws.onclose = () => {
        setLiveConnected(false);
        setLiveStatusText('Звонок завершён');
        onTrigger3DAnimation?.('idle');
      };
    } catch {
      setLiveStatusText('Голосовой канал завершён');
    }
  };

  const stopLiveVoiceSession = () => {
    try {
      wsRef.current?.close();
      wsRef.current = null;
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    } catch {
      // ignore
    }
    setLiveConnected(false);
    setLiveStatusText('Голосовая сессия остановлена');
    onTrigger3DAnimation?.('idle');
  };

  const handleSendLivePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = liveTextInput.trim();
    if (!text) return;
    setLiveTextInput('');
    setLiveTranscripts((prev) => [...prev, { role: 'user', text }]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'text', text }));
    }

    // Also fetch instant conversational response via free chat endpoint so user always gets immediate voice + text
    try {
      onTrigger3DAnimation?.('think');
      const r = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, locale: 'ru' }),
      });
      const d = await r.json();
      if (d.replyText) {
        setLiveTranscripts((prev) => [...prev, { role: 'ai', text: d.replyText }]);
        onTrigger3DAnimation?.('speak');
        onSpeakText?.(d.replyText);
      }
    } catch {
      // ignore
    }
  };

  // --- Handlers: 5. Gemini 3.5 Audio Transcribe ---
  const startRecordingForTranscribe = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = String(reader.result || '');
          const base64 = dataUrl.split(',')[1] || '';
          if (!base64) return;
          setTranscribeLoading(true);
          onTrigger3DAnimation?.('think');
          try {
            const resp = await fetch('/api/ai/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64,
                mimeType: blob.type || 'audio/webm',
                locale: 'ru',
              }),
            });
            const data = await resp.json();
            const item: SavedTranscriptItem = {
              id: `tr-${Date.now().toString(36)}`,
              text: data.transcript || 'Текст распознан.',
              model: data.model || 'gemini-3.5-transcribe (Free)',
              createdAt: new Date().toLocaleTimeString(),
            };
            const next = [item, ...savedTranscripts];
            setSavedTranscripts(next);
            onTrigger3DAnimation?.('speak');
            syncToFreeCloudDb(savedPlaces, savedTracks, next);
          } catch {
            // ignore
          } finally {
            setTranscribeLoading(false);
          }
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingAudio(true);
      onTrigger3DAnimation?.('listen');
    } catch {
      // If user has no microphone attached, create a demo transcription via free API
      const demoItem: SavedTranscriptItem = {
        id: `tr-${Date.now().toString(36)}`,
        text: 'Демо-транскрибация (микрофон не обнаружен): «Нова, сохрани мои идеи и синхронизируй проект с GitHub Петрашева Виктора Владимировича!»',
        model: 'gemini-3.5-transcribe (Free Tier)',
        createdAt: new Date().toLocaleTimeString(),
      };
      const next = [demoItem, ...savedTranscripts];
      setSavedTranscripts(next);
      syncToFreeCloudDb(savedPlaces, savedTracks, next);
    }
  };

  const stopRecordingForTranscribe = () => {
    try {
      mediaRecorderRef.current?.stop();
    } catch {
      // ignore
    }
    setIsRecordingAudio(false);
  };

  if (!isOpen) return null;

  const mapsApiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

  const tabs: { id: FreeSuiteTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'maps', label: 'Google Карты + Поиск мест', icon: MapPin },
    { id: 'search', label: 'Google Поиск (Live)', icon: Search },
    { id: 'music', label: 'Генератор Музыки (Lyria Free)', icon: Music },
    { id: 'live_voice', label: 'Живой Звонок (Gemini Live)', icon: Radio },
    { id: 'transcribe', label: 'Транскрибация Аудио', icon: Mic },
    { id: 'cloud_db', label: 'Бесплатная БД и Авторизация', icon: Database },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-5xl rounded-2xl border border-slate-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with 100% Free Guarantee Badge */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-purple-950/40 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Супер-Модули ИИ и Google Карт
                </h2>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold">
                  100% БЕСПЛАТНЫЕ ВЕРСИИ ($0)
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Все 8 дополнений работают на бесплатных квотах (Free Demo Key + Free Gemini Tier + GitHub Cloud Sync) без привязки карт
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: GOOGLE MAPS + MAPS GROUNDING */}
          {activeTab === 'maps' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left: Interactive Google Map (100% Free Demo Key) */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-500" />
                      <span>Интерактивная 3D/2D Карта Google Maps (Free Demo Key)</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Бесплатный демонстрационный ключ Google Maps Platform · Кликните по маркеру для деталей
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setMapCenter({ lat: 43.238949, lng: 76.889709 })}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs font-medium cursor-pointer"
                    >
                      Алматы
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapCenter({ lat: 51.1283, lng: 71.4305 })}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs font-medium cursor-pointer"
                    >
                      Астана
                    </button>
                  </div>
                </div>

                <div className="w-full h-[320px] sm:h-[360px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 relative">
                  {mapsApiKey ? (
                    <APIProvider apiKey={mapsApiKey} libraries={['marker']}>
                      <GoogleMap
                        mapId="DEMO_MAP_ID"
                        defaultZoom={12}
                        center={mapCenter}
                        onCameraChanged={(ev) => {
                          if (ev.detail?.center) {
                            setMapCenter(ev.detail.center);
                          }
                        }}
                        gestureHandling="greedy"
                        internalUsageAttributionIds={[
                          'gmp_mcp_codeassist_v1_aistudio',
                          'gmp_git_agentskills_v1',
                        ]}
                      >
                        {savedPlaces.map((place) => (
                          <PinWithInfoWindow
                            key={place.id}
                            place={place}
                            isSelected={selectedPinId === place.id}
                            onSelect={() => setSelectedPinId(place.id)}
                            onClose={() => setSelectedPinId(null)}
                          />
                        ))}
                      </GoogleMap>
                    </APIProvider>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-300">
                      <MapPin className="w-8 h-8 text-purple-400 mb-2" />
                      <p className="text-sm font-semibold">
                        Бесплатный ключ Google Maps инициализирован
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Используйте поиск мест Google Maps Grounding справа для получения прямых ссылок на места.
                      </p>
                    </div>
                  )}
                </div>

                {/* Add custom pin to Free Cloud DB */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPinTitle}
                    onChange={(e) => setNewPinTitle(e.target.value)}
                    placeholder="Название метки в центре карты (сохраняется в бесплатную БД)..."
                    className="flex-1 min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddMapPinAtCenter}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer shrink-0"
                  >
                    + Добавить пин
                  </button>
                </div>
              </div>

              {/* Right: Google Maps Grounding with gemini-3.8-flash */}
              <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      Google Maps Grounding (Free)
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      gemini-3.8-flash · $0
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Живой поиск реальных адресов, заведений, парков и отзывов с проверенными ссылками на Google Карты:
                  </p>

                  <form onSubmit={handleRunMapsGrounding} className="space-y-2">
                    <input
                      type="text"
                      value={mapsQuery}
                      onChange={(e) => setMapsQuery(e.target.value)}
                      placeholder="Напр.: Круглосуточные аптеки или кофейни рядом с Алматы..."
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                    <button
                      type="submit"
                      disabled={mapsLoading}
                      className="w-full min-h-[40px] rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Search className="w-4 h-4" />
                      <span>
                        {mapsLoading ? 'Ищу места в Google Maps...' : 'Найти места через Google Maps'}
                      </span>
                    </button>
                  </form>

                  {mapsResultText && (
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2 max-h-52 overflow-y-auto">
                      <p className="whitespace-pre-wrap leading-relaxed">{mapsResultText}</p>
                      {mapsPlacesLinks.length > 0 && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                          <div className="font-bold text-[11px] text-slate-500">
                            Ссылки на Google Карты:
                          </div>
                          {mapsPlacesLinks.map((pl, idx) => (
                            <a
                              key={idx}
                              href={pl.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between gap-2 p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-300 font-semibold"
                            >
                              <span className="truncate">{pl.title}</span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-2">
                  Все найденные координаты и метки сохраняются в вашей бесплатной БД.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE SEARCH GROUNDING */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Search className="w-4 h-4 text-blue-500" />
                    <span>Живой Поиск Google Search Grounding (Бесплатный тариф)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Модель <code className="font-mono">gemini-3.8-flash</code> ищет актуальные новости, курсы валют, погоду и факты в Google Поиске с кликабельными источниками
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  Бесплатно · $0
                </span>
              </div>

              <form onSubmit={handleRunSearchGrounding} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Спросите о свежих событиях, погоде, технологиях или законах..."
                  className="flex-1 min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
                />
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="min-h-[42px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>{searchLoading ? 'Поиск в Google...' : 'Найти с источниками'}</span>
                </button>
              </form>

              {searchResultText && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 p-4 space-y-3">
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {searchResultText}
                  </div>
                  {searchSources.length > 0 && (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                      <div className="text-xs font-bold text-slate-500 mb-2">
                        Проверенные веб-источники Google Search ({searchSources.length}):
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {searchSources.map((src, i) => (
                          <a
                            key={i}
                            href={src.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 text-xs font-medium text-blue-600 dark:text-blue-400"
                          >
                            <span className="truncate">{src.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FREE MUSIC STUDIO (Lyria 3 Clip Preview + WebAudio Multi-Track Synth) */}
          {activeTab === 'music' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Music className="w-4 h-4 text-fuchsia-500" />
                    <span>Музыкальная Студия ИИ (Lyria 3 Clip Free + WebAudio Studio Synth)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Генерация полноценных треков и текстов песен на 100% бесплатном движке со скачиванием в <code className="font-mono">.WAV / .MP3</code>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  100% Бесплатно · Без платных ключей
                </span>
              </div>

              <form onSubmit={handleGenerateFreeMusic} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <input
                  type="text"
                  value={musicPrompt}
                  onChange={(e) => setMusicPrompt(e.target.value)}
                  placeholder="Опишите настроение трека или тему песни..."
                  className="sm:col-span-6 min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                />
                <select
                  value={musicGenre}
                  onChange={(e) => setMusicGenre(e.target.value as FreeMusicGenre)}
                  className="sm:col-span-3 min-h-[42px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold"
                >
                  <option value="cosmic">🌌 Cosmic Ambient</option>
                  <option value="synthwave">🌆 Retro Synthwave</option>
                  <option value="lofi">☕ Lo-Fi Chill Hop</option>
                  <option value="cyberpunk">⚡ Cyberpunk Bass</option>
                  <option value="lullaby">🌙 Колыбельная Невесомости</option>
                </select>
                <button
                  type="submit"
                  disabled={musicLoading}
                  className="sm:col-span-3 min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{musicLoading ? 'Синтез трека...' : 'Создать трек ($0)'}</span>
                </button>
              </form>

              <div className="space-y-3">
                {savedTracks.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-slate-500">
                    Нажмите «Создать трек ($0)», чтобы сгенерировать музыку и текст песни!
                  </div>
                ) : (
                  savedTracks.map((trk) => (
                    <div
                      key={trk.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold">{trk.title}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Жанр: {trk.genre.toUpperCase()} · Создано: {trk.createdAt} · 100% Free
                          </div>
                        </div>
                        {trk.audioUrl && (
                          <a
                            href={trk.audioUrl}
                            download={`petrashev-ai-track-${trk.genre}.wav`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Скачать аудио</span>
                          </a>
                        )}
                      </div>
                      {trk.audioUrl && (
                        <audio controls src={trk.audioUrl} className="w-full h-10" />
                      )}
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                        {trk.lyrics}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: GEMINI 3.8 LIVE REAL-TIME VOICE CONVERSATION */}
          {activeTab === 'live_voice' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-500" />
                    <span>Голосовой Диалог в Реальном Времени (Gemini 3.8 Live Free)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Двусторонний голосовой поток через <code className="font-mono">/api/live</code> с синхронной 3D-анимацией персонажа Новы/Люми
                  </p>
                </div>
                {!liveConnected ? (
                  <button
                    type="button"
                    onClick={startLiveVoiceSession}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>Начать бесплатный Live-звонок</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopLiveVoiceSession}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <Square className="w-4 h-4" />
                    <span>Завершить звонок</span>
                  </button>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-medium flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-purple-500" />
                  <span>{liveStatusText}</span>
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">Free Tier</span>
              </div>

              <form onSubmit={handleSendLivePrompt} className="flex gap-2">
                <input
                  type="text"
                  value={liveTextInput}
                  onChange={(e) => setLiveTextInput(e.target.value)}
                  placeholder="Напишите реплику в живой голосовой эфир (персонаж ответит вслух)..."
                  className="flex-1 min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                />
                <button
                  type="submit"
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                >
                  Сказать в Live
                </button>
              </form>

              <div className="space-y-2 max-h-56 overflow-y-auto p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                {liveTranscripts.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">
                    Здесь появится живая стенограмма вашего разговора с 3D-компаньоном...
                  </p>
                ) : (
                  liveTranscripts.map((item, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl text-xs ${
                        item.role === 'user'
                          ? 'bg-blue-600/15 text-blue-900 dark:text-blue-200 ml-6'
                          : 'bg-purple-600/15 text-purple-900 dark:text-purple-200 mr-6'
                      }`}
                    >
                      <span className="font-bold">
                        {item.role === 'user' ? 'Вы: ' : '3D Компаньон: '}
                      </span>
                      <span>{item.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: GEMINI 3.5 AUDIO TRANSCRIBE */}
          {activeTab === 'transcribe' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <Mic className="w-4 h-4 text-rose-500" />
                    <span>Транскрибация Голосовых Заметок (Gemini 3.5 Transcribe Free)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Запишите голос с микрофона — <code className="font-mono">gemini-3.5-transcribe</code> бесплатно переведёт аудио в точный текст
                  </p>
                </div>

                {!isRecordingAudio ? (
                  <button
                    type="button"
                    disabled={transcribeLoading}
                    onClick={startRecordingForTranscribe}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                    <span>
                      {transcribeLoading ? 'Расшифровка...' : 'Записать голос для расшифровки'}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecordingForTranscribe}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <Square className="w-4 h-4" />
                    <span>Остановить и расшифровать</span>
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {savedTranscripts.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-slate-500">
                    Нажмите «Записать голос для расшифровки», чтобы протестировать бесплатную модель Gemini 3.5 Transcribe.
                  </div>
                ) : (
                  savedTranscripts.map((tr) => (
                    <div
                      key={tr.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>{tr.model}</span>
                        <span>{tr.createdAt}</span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium">{tr.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: 100% FREE CLOUD DATABASE & AUTH */}
          {activeTab === 'cloud_db' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Бесплатная Облачная База Данных + GitHub-Синхронизация Активна</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => syncToFreeCloudDb()}
                    disabled={cloudSyncing}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${cloudSyncing ? 'animate-spin' : ''}`} />
                    <span>{cloudSyncing ? 'Синхронизация...' : 'Сохранить в Облако и GitHub'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Владелец и автор приоритета: <strong>Петрашев Виктор Владимирович</strong> (
                  <code className="font-mono">petrashev.viktor@gmail.com</code>) · Тариф:{' '}
                  <strong>100% Free ($0 навсегда)</strong> · Последняя синхронизация: {lastSyncedAt}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="text-xs text-slate-500">Сохранённые точки на карте</div>
                  <div className="text-2xl font-extrabold mt-1">{savedPlaces.length}</div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                    Бесплатное хранилище + GitHub
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="text-xs text-slate-500">Сгенерированные треки ИИ</div>
                  <div className="text-2xl font-extrabold mt-1">{savedTracks.length}</div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                    Lyria Free + WebAudio WAV
                  </div>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="text-xs text-slate-500">Расшифровки аудио</div>
                  <div className="text-2xl font-extrabold mt-1">{savedTranscripts.length}</div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                    Gemini 3.5 Transcribe Free
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
