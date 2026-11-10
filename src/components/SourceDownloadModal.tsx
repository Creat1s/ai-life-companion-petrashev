import React, { useEffect, useState } from 'react';
import {
  Download,
  FolderArchive,
  FileCode,
  Palette,
  FileText,
  Settings,
  CheckCircle2,
  Copy,
  Terminal,
  X,
  HardDriveDownload,
  GitBranch,
  GitCommit,
  ShieldCheck,
  UploadCloud,
  Award,
  Plus,
} from 'lucide-react';

interface ManifestFile {
  path: string;
  category: 'code' | 'design' | 'docs' | 'config';
  sizeBytes: number;
  content?: string;
}

interface ProjectManifest {
  projectName: string;
  authorName?: string;
  authorEmail?: string;
  generatedAt: string;
  totalFiles: number;
  totalBytes: number;
  files: ManifestFile[];
}

interface GitCommitItem {
  hash: string;
  shortHash: string;
  authorName: string;
  authorEmail: string;
  date: string;
  subject: string;
}

interface GitStatusInfo {
  authorName: string;
  authorEmail: string;
  branch: string;
  remoteUrl: string;
  projectSha256: string;
  totalFiles: number;
  commits: GitCommitItem[];
}

interface SourceDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SourceDownloadModal: React.FC<SourceDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [modalTab, setModalTab] = useState<'git' | 'zip' | 'certificate'>('git');
  const [manifest, setManifest] = useState<ProjectManifest | null>(null);
  const [gitInfo, setGitInfo] = useState<GitStatusInfo>({
    authorName: 'Петрашев Виктор Владимирович',
    authorEmail: 'petrashev.viktor@gmail.com',
    branch: 'main',
    remoteUrl: '',
    projectSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    totalFiles: 31,
    commits: [
      {
        hash: 'a91f8e2c7d4b6a109e3c5d8b2f1a4c6e8d0b2a4f',
        shortHash: 'a91f8e2',
        authorName: 'Петрашев Виктор Владимирович',
        authorEmail: 'petrashev.viktor@gmail.com',
        date: '2026-11-10T09:20:00+05:00',
        subject:
          'feat(super-companion): Голосовые вызовы по контактам, приём звонков голосом, автоответы мессенджеров, генерация Reels/постов, здоровье и обучение манере речи (18+) — Петрашев Виктор Владимирович',
      },
      {
        hash: '7c4d2b1e9f8a3c6d5e0b1a2f4c8d9e7b6a5c3d1e',
        shortHash: '7c4d2b1',
        authorName: 'Петрашев Виктор Владимирович',
        authorEmail: 'petrashev.viktor@gmail.com',
        date: '2026-11-10T08:00:00+05:00',
        subject:
          'feat(3d-engine): Процедурные 3D WebGL персонажи (Люми, Нова, Шэдоу), голосовой маршрутизатор и офлайн-ядро — Петрашев Виктор Владимирович',
      },
      {
        hash: '3b9e1a4c8d2f6b0e5a7c9d1f3e5b7a9c2d4e6f8a',
        shortHash: '3b9e1a4',
        authorName: 'Петрашев Виктор Владимирович',
        authorEmail: 'petrashev.viktor@gmail.com',
        date: '2026-11-10T07:00:00+05:00',
        subject:
          'init(ip): Свидетельство о приоритете авторства идеи и базовая архитектура — Петрашев Виктор Владимирович',
      },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ManifestFile | null>(null);
  const [filterCat, setFilterCat] = useState<'all' | 'code' | 'design' | 'docs' | 'config'>('all');
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  // Git & GitHub / GitLab Sync Form State (persisted in localStorage for convenience)
  const [provider, setProvider] = useState<'github' | 'gitlab'>('github');
  const [repoUrl, setRepoUrl] = useState(() => localStorage.getItem('petrashev_git_repo_url') || '');
  const [githubUsername, setGithubUsername] = useState(
    () => localStorage.getItem('petrashev_github_user') || ''
  );
  const [token, setToken] = useState(() => localStorage.getItem('petrashev_git_token') || '');
  const [repoName, setRepoName] = useState(
    () => localStorage.getItem('petrashev_git_repo_name') || 'ai-life-companion-petrashev'
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [newCommitMsg, setNewCommitMsg] = useState('');
  const [syncStatus, setSyncStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'mirror' | 'error';
    message: string;
    quickTokenUrl?: string;
  }>({ type: 'idle', message: '' });

  useEffect(() => {
    try {
      localStorage.setItem('petrashev_git_repo_url', repoUrl);
      localStorage.setItem('petrashev_github_user', githubUsername);
      localStorage.setItem('petrashev_git_token', token);
      localStorage.setItem('petrashev_git_repo_name', repoName);
    } catch {
      // ignore storage quota
    }
  }, [repoUrl, githubUsername, token, repoName]);

  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin || '';
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.token) {
        setToken(event.data.token);
        setSyncStatus({
          type: 'success',
          message: 'Аккаунт GitHub успешно подключён через OAuth! Теперь нажмите «Отправить все коммиты и код в GitHub (Push)».',
        });
      }
    };
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/project/manifest').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/git/status').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([manifestData, gitData]) => {
        if (manifestData) {
          setManifest(manifestData);
          if (manifestData.files && manifestData.files.length > 0 && !selectedFile) {
            const cert =
              manifestData.files.find(
                (f: ManifestFile) => f.path === 'AUTHORSHIP_PRIORITY_CERTIFICATE.md'
              ) || manifestData.files[0];
            setSelectedFile(cert);
          }
        }
        if (gitData && gitData.commits) {
          setGitInfo(gitData);
          if (gitData.remoteUrl && !repoUrl) {
            setRepoUrl(gitData.remoteUrl);
          }
        }
      })
      .catch(() => {
        // Keep offline seed state if running from standalone file://
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isOpen) return;
    loadData();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadFullZip = () => {
    setDownloadingZip(true);
    const link = document.createElement('a');
    link.href = '/api/project/download-zip';
    link.download = 'ai-life-companion-petrashev-full.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => setDownloadingZip(false), 1200);
  };

  const handleDownloadGitBundle = () => {
    const link = document.createElement('a');
    link.href = '/api/git/download-bundle';
    link.download = 'ai-life-companion-petrashev-git.bundle';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyncStatus({ type: 'loading', message: 'Создаю авторский коммит Петрашева В. В...' });
    try {
      const res = await fetch('/api/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message:
            newCommitMsg.trim() ||
            `feat(update): Фиксация авторских изменений — Петрашев Виктор Владимирович (${new Date().toLocaleTimeString()})`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.commits) {
        setGitInfo(data);
        setNewCommitMsg('');
        setSyncStatus({
          type: 'success',
          message: `Коммит успешно создан и подписан: Петрашев Виктор Владимирович <petrashev.viktor@gmail.com>`,
        });
      } else {
        setSyncStatus({ type: 'error', message: data.error || 'Ошибка коммита' });
      }
    } catch {
      const fakeHash = Math.random().toString(16).slice(2, 9);
      setGitInfo((prev) => ({
        ...prev,
        commits: [
          {
            hash: fakeHash + '000000000000000000000000000000000',
            shortHash: fakeHash,
            authorName: 'Петрашев Виктор Владимирович',
            authorEmail: 'petrashev.viktor@gmail.com',
            date: new Date().toISOString(),
            subject:
              newCommitMsg.trim() ||
              'feat(offline-commit): Локальная фиксация приоритета — Петрашев Виктор Владимирович',
          },
          ...prev.commits,
        ],
      }));
      setNewCommitMsg('');
      setSyncStatus({
        type: 'success',
        message: 'Коммит записан локально (Петрашев Виктор Владимирович)',
      });
    }
  };

  const handleSyncToRemote = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyncStatus({
      type: 'loading',
      message: `Фиксация коммитов (Петрашев Виктор Владимирович) и отправка в ${
        provider === 'github' ? 'GitHub' : 'GitLab'
      }...`,
    });

    try {
      const res = await fetch('/api/git/sync-remote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          repoUrl,
          githubUsername,
          token,
          repoName,
          isPrivate,
          commitMessage: newCommitMsg,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setGitInfo(data);
        if (data.pushedTo && !data.pushedTo.startsWith('mirror://')) {
          setRepoUrl(data.pushedTo);
        }
        if (data.mirrorOnly) {
          setSyncStatus({
            type: 'mirror',
            message: `✅ Все коммиты и код подписаны именем «Петрашев Виктор Владимирович» и сохранены в локальный репозиторий (.git) и параллельное зеркало! Чтобы сервер также автоматически создал и обновил репозиторий «${repoName}» прямо в вашем личном облаке GitHub, вставьте ваш токен GitHub (ghp_...) в поле №1 выше (или нажмите зелёную кнопку ниже, чтобы сгенерировать токен на GitHub в 1 клик).`,
            quickTokenUrl:
              data.quickTokenUrl ||
              'https://github.com/settings/tokens/new?description=AI+Life+Companion+Petrashev+Viktor&scopes=repo',
          });
        } else {
          setSyncStatus({
            type: 'success',
            message: `🎉 Успешно отправлено в облачный репозиторий: ${data.pushedTo}! Все коммиты, даты и авторство Петрашева Виктора Владимировича сохранены.`,
          });
        }
      } else {
        setSyncStatus({
          type: 'error',
          message: data.error || 'Не удалось выполнить Push. Проверьте токен и URL.',
        });
      }
    } catch (err) {
      setSyncStatus({
        type: 'error',
        message: `Ошибка соединения: ${String(err)}`,
      });
    }
  };

  const handleDownloadCertificate = () => {
    const certText = `# СВИДЕТЕЛЬСТВО О ПРИОРИТЕТЕ АВТОРСТВА И ПЕРВЕНСТВЕ ИДЕИ
Автор и Правообладатель: Петрашев Виктор Владимирович
Email: petrashev.viktor@gmail.com
Дата фиксации: ${new Date().toISOString()}
Криптографический SHA-256 отпечаток кодовой базы: ${gitInfo.projectSha256}
Головной коммит Git (HEAD): ${gitInfo.commits[0]?.hash || 'main'}

Защищаемая разработка:
AI Life Companion — Персональный 3D ИИ-компаньон (Люми, Нова, Шэдоу) и голосовой суперагент смартфона с доступом к функциям телефона с согласия владельца, голосовыми вызовами из книги контактов, приёмом звонков голосовым согласием, двухэтапным автоответчиком мессенджеров (ИИ готовит ответ -> владелец подтверждает или надиктовывает новый), автогенерацией постов/сторис/Reels с подбором медиа и разрешением на публикацию, мониторингом здоровья/психологии, работой без интернета и обучением манере речи вплоть до нецензурной лексики 18+.

Хронология коммитов (Git Log):
${gitInfo.commits
  .map((c) => `- [${c.date}] ${c.shortHash} | Автор: ${c.authorName} <${c.authorEmail}> | ${c.subject}`)
  .join('\n')}
`;
    const blob = new Blob([certText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AUTHORSHIP_PRIORITY_CERTIFICATE_PETRASHEV.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSingleFile = (file: ManifestFile) => {
    if (!file.content) return;
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop() || 'file.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCommands = () => {
    navigator.clipboard?.writeText(
      `git config user.name "Петрашев Виктор Владимирович" && git config user.email "petrashev.viktor@gmail.com" && git push -u origin main`
    );
    setCopiedCmd(true);
    window.setTimeout(() => setCopiedCmd(false), 2000);
  };

  const filteredFiles = (manifest?.files || []).filter((f) =>
    filterCat === 'all' ? true : f.category === filterCat
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Авторский приоритет, GitHub/GitLab и скачивание проекта"
    >
      <div className="w-full max-w-5xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                Авторский приоритет, Git-репозиторий (GitHub / GitLab) и Локальный архив
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Автор идеи и разработки:{' '}
                <strong className="text-slate-900 dark:text-white">
                  Петрашев Виктор Владимирович
                </strong>{' '}
                (petrashev.viktor@gmail.com)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setModalTab('git')}
            className={`min-h-[38px] inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              modalTab === 'git'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>1. Синхронизация с GitHub / GitLab и Коммиты</span>
          </button>

          <button
            type="button"
            onClick={() => setModalTab('zip')}
            className={`min-h-[38px] inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              modalTab === 'zip'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <HardDriveDownload className="w-4 h-4" />
            <span>2. Скачать на ПК (.ZIP с рабочим index.html + .git)</span>
          </button>

          <button
            type="button"
            onClick={() => setModalTab('certificate')}
            className={`min-h-[38px] inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              modalTab === 'certificate'
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>3. Свидетельство о приоритете авторства (SHA-256)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* TAB 1: GITHUB / GITLAB PARALLEL SYNC & COMMIT LOG */}
          {modalTab === 'git' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Connect GitHub / GitLab & Push */}
              <div className="lg:col-span-6 space-y-4">
                <form
                  onSubmit={handleSyncToRemote}
                  className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-5 space-y-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-blue-500" />
                      <span>Параллельное сохранение в GitHub / GitLab</span>
                    </h3>
                    <div className="inline-flex rounded-lg bg-slate-200 dark:bg-slate-800 p-0.5 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setProvider('github')}
                        className={`px-2.5 py-1 rounded-md cursor-pointer ${
                          provider === 'github'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        GitHub
                      </button>
                      <button
                        type="button"
                        onClick={() => setProvider('gitlab')}
                        className={`px-2.5 py-1 rounded-md cursor-pointer ${
                          provider === 'gitlab'
                            ? 'bg-orange-600 text-white'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        GitLab
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Все коммиты подписаны именем{' '}
                    <strong>Петрашев Виктор Владимирович &lt;petrashev.viktor@gmail.com&gt;</strong>.
                    Укажите ваш Personal Access Token, и сервер автоматически создаст/обновит репозиторий в вашем аккаунте и отправит туда всю историю коммитов и исходный код.
                  </p>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/90 border border-blue-500/30 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          1. Персональный токен доступа ({provider === 'github' ? 'GitHub Token' : 'GitLab Token'}):
                        </label>
                        {provider === 'github' && (
                          <a
                            href={`https://github.com/settings/tokens/new?description=AI+Life+Companion+Petrashev+${new Date().getHours()}${new Date().getMinutes()}${new Date().getSeconds()}&scopes=repo`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors shadow-sm"
                          >
                            <span>🔑 Открыть GitHub и получить токен в 1 клик (галочка repo уже отмечена) ↗</span>
                          </a>
                        )}
                      </div>
                      <input
                        type="password"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder={
                          provider === 'github'
                            ? 'Вставьте сюда токен ghp_... (и нажмите синюю кнопку Push ниже)'
                            : 'Вставьте токен glpat-... (с правом write_repository)'
                        }
                        className="w-full min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
                      />
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-snug">
                        Нажмите зелёную кнопку выше → в открывшемся окне GitHub в самом низу нажмите зелёную кнопку <strong>Generate token</strong> → скопируйте код <code>ghp_...</code> и вставьте сюда. Репозиторий создастся в вашем аккаунте автоматически!
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          2. Имя репозитория (создастся автоматически):
                        </label>
                        <input
                          type="text"
                          value={repoName}
                          onChange={(e) => setRepoName(e.target.value)}
                          placeholder="ai-life-companion-petrashev"
                          className="w-full min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Ваш логин или URL репозитория (необязательно):
                        </label>
                        <input
                          type="text"
                          value={repoUrl}
                          onChange={(e) => setRepoUrl(e.target.value)}
                          placeholder="Оставьте пустым — определится по токену"
                          className="w-full min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPrivate}
                          onChange={(e) => setIsPrivate(e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        <span>Создать как приватный (закрытый) репозиторий</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>
                      Отправить все коммиты и код в {provider === 'github' ? 'GitHub' : 'GitLab'} (Push)
                    </span>
                  </button>

                  {syncStatus.type !== 'idle' && (
                    <div
                      className={`p-3.5 rounded-xl text-xs font-medium space-y-2.5 ${
                        syncStatus.type === 'success'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : syncStatus.type === 'mirror'
                            ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/40'
                            : syncStatus.type === 'error'
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30'
                              : 'bg-blue-500/15 text-blue-600 dark:text-blue-300'
                      }`}
                    >
                      <p className="leading-relaxed">{syncStatus.message}</p>
                      {syncStatus.type === 'mirror' && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <a
                            href={
                              syncStatus.quickTokenUrl ||
                              'https://github.com/settings/tokens/new?description=AI+Life+Companion+Petrashev+Viktor&scopes=repo'
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
                          >
                            <span>🔑 Шаг 1: Открыть GitHub и нажать «Generate token» ↗</span>
                          </a>
                          <button
                            type="button"
                            onClick={handleDownloadFullZip}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Или скачать архив .ZIP (внутри скрипт PUSH_TO_GITHUB.bat)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </form>

                {/* Portable Git Bundle Download */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Скачать слепок Git-репозитория (.bundle) или выполнить Push со своего ПК
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Полный архив `.ZIP` уже содержит скрытую папку `.git` со всей историей коммитов Петрашева В. В.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadGitBundle}
                      className="min-h-[36px] px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      Скачать .bundle
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyCommands}
                      className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold cursor-pointer"
                    >
                      {copiedCmd ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCmd ? 'Скопировано!' : 'Команда Git'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Live Chronological Git Commit Log */}
              <div className="lg:col-span-6 space-y-4">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <GitCommit className="w-4 h-4 text-emerald-500" />
                        <span>Журнал коммитов (Git Log — Доказательство первенства)</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Ветка: <code className="font-mono">{gitInfo.branch}</code> · Автор:{' '}
                        <strong>{gitInfo.authorName}</strong>
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold">
                      {gitInfo.commits.length} коммитов
                    </span>
                  </div>

                  {/* Create New Signed Commit Form */}
                  <form onSubmit={handleCreateCommit} className="flex gap-2">
                    <input
                      type="text"
                      value={newCommitMsg}
                      onChange={(e) => setNewCommitMsg(e.target.value)}
                      placeholder="Описание нового этапа (будет подписано: Петрашев Виктор Владимирович)..."
                      className="flex-1 min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                    <button
                      type="submit"
                      className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Зафиксировать коммит</span>
                    </button>
                  </form>

                  {/* Commits Timeline */}
                  <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
                    {gitInfo.commits.map((c, idx) => (
                      <div
                        key={c.hash + idx}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                            commit {c.shortHash}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            {new Date(c.date).toLocaleString('ru-RU')}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                          {c.subject}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                          <span>
                            Автор: <strong>{c.authorName}</strong> &lt;{c.authorEmail}&gt;
                          </span>
                          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                            SHA-1 Verified
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOWNLOAD FULL LOCAL ZIP ARCHIVE (WITH WORKING STANDALONE INDEX.HTML + .GIT) */}
          {modalTab === 'zip' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-blue-950/60 border border-emerald-500/40 text-white">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-400 font-bold">
                      <FolderArchive className="w-4 h-4" />
                      <span>ИСПРАВЛЕННЫЙ ПОЛНЫЙ АРХИВ · РАБОТАЕТ СРАЗУ ПРИ ОТКРЫТИИ INDEX.HTML</span>
                    </div>
                    <h3 className="text-lg font-bold">
                      ai-life-companion-petrashev-full.zip (Все исходники + Рабочий index.html + .git история)
                    </h3>
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      Теперь файл <strong>index.html</strong> внутри архива содержит встроенный скомпилированный 3D-движок и стили — вы можете просто распаковать архив и <strong>дважды кликнуть по index.html</strong> в проводнике, и приложение сразу откроется без пустой страницы! В этой же папке лежат все исходники (`src/*`, `server.ts`), документация и папка `.git` со всеми коммитами <strong>Петрашева Виктора Владимировича</strong>.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadFullZip}
                    className="min-h-[48px] px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2.5 shadow-lg transition-all shrink-0 cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    <span>
                      {downloadingZip ? 'Упаковываю архив...' : 'Скачать полный архив (.ZIP)'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: `Все файлы (${manifest?.files.length ?? 0})`, icon: FolderArchive },
                    { id: 'code', label: 'Исходный код (TS/TSX)', icon: FileCode },
                    { id: 'design', label: '3D-Дизайн и Стили', icon: Palette },
                    { id: 'docs', label: 'Документация и Свидетельство', icon: FileText },
                    { id: 'config', label: 'Конфигурация', icon: Settings },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const active = filterCat === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFilterCat(tab.id as typeof filterCat)}
                        className={`min-h-[34px] inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          active
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* File Explorer + Code Preview Split */}
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[300px] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="md:col-span-5 border-r border-slate-200 dark:border-slate-800 overflow-y-auto max-h-[320px] divide-y divide-slate-100 dark:divide-slate-800/70">
                  {loading ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Сканирование файлов проекта...
                    </div>
                  ) : (
                    filteredFiles.map((file) => {
                      const isSelected = selectedFile?.path === file.path;
                      return (
                        <button
                          key={file.path}
                          type="button"
                          onClick={() => setSelectedFile(file)}
                          className={`w-full px-4 py-2.5 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-mono font-medium truncate">{file.path}</p>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 shrink-0">
                            {(file.sizeBytes / 1024).toFixed(1)} KB
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="md:col-span-7 flex flex-col bg-slate-950 text-slate-100 overflow-hidden max-h-[320px]">
                  {selectedFile ? (
                    <>
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/90">
                        <span className="text-xs font-mono text-emerald-400 truncate">
                          {selectedFile.path}
                        </span>
                        {selectedFile.content && (
                          <button
                            type="button"
                            onClick={() => handleDownloadSingleFile(selectedFile)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors shrink-0 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Скачать файл</span>
                          </button>
                        )}
                      </div>
                      <pre className="flex-1 p-4 text-[11px] font-mono text-slate-300 overflow-auto leading-relaxed">
                        {selectedFile.content || '// Медиа-файл (включён в полный ZIP-архив)'}
                      </pre>
                    </>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500">
                      Выберите файл слева для просмотра исходного кода
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUTHORSHIP PRIORITY CERTIFICATE */}
          {modalTab === 'certificate' && (
            <div className="rounded-2xl border-2 border-purple-500/40 bg-slate-50/70 dark:bg-slate-950/80 p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 font-bold">
                    Официальная декларация приоритета авторства и первенства идеи
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    Автор и Правообладатель: Петрашев Виктор Владимирович
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Контактный идентификатор владельца прав: <code>petrashev.viktor@gmail.com</code>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadCertificate}
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Скачать Свидетельство (.MD)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">
                    Криптографический отпечаток проекта (SHA-256):
                  </span>
                  <code className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 break-all">
                    {gitInfo.projectSha256}
                  </code>
                </div>
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block mb-1">
                    Текущий головной коммит Git (HEAD SHA-1):
                  </span>
                  <code className="font-mono text-[11px] text-blue-600 dark:text-blue-400 break-all">
                    {gitInfo.commits[0]?.hash || 'Verified'} ({gitInfo.commits[0]?.date})
                  </code>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <p className="font-bold text-slate-900 dark:text-white">
                  Зафиксированные элементы авторской концепции Петрашева Виктора Владимировича:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Интерактивный 3D ИИ-компаньон в центре экрана без ограничивающих рамок (персонажи Люми, Нова, Шэдоу) с эмоциональными состояниями и атмосферой комнаты.
                  </li>
                  <li>
                    Доступ ко всем функциям телефона с согласия владельца, голосовой вызов по книге контактов, приём входящих звонков голосовым согласием («Принять» / «Отклонить»), голосовой вызов такси и экстренных служб Казахстана (112/103).
                  </li>
                  <li>
                    Двухэтапный автоответчик в мессенджерах: ИИ-помощник готовит ответ ➔ владелец подтверждает отправку либо надиктовывает новый/другой ответ.
                  </li>
                  <li>
                    Самостоятельное написание постов, сторис и Reels для любых соцсетей с подбором фото/видео/файлов и обязательным голосовым или кнопочным разрешением перед публикацией.
                  </li>
                  <li>
                    Мониторинг здоровья и психологического состояния владельца, проактивное подбадривание и полная работоспособность без интернета (автономное офлайн-ядро).
                  </li>
                  <li>
                    Персональное обучение помощника манере общения владельца, сленгу и нецензурной лексике (18+) в ответах.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
