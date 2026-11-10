import React from 'react';
import { ShieldAlert, Check, X, RefreshCw } from 'lucide-react';
import { ApprovalRequest, Locale } from '../types/companion';
import { translations } from '../data/i18n';

interface ApprovalModalProps {
  approvals: ApprovalRequest[];
  locale: Locale;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (req: ApprovalRequest, simulateTimeout?: boolean) => void;
  onReject: (req: ApprovalRequest) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  approvals,
  locale,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!isOpen) return null;
  const t = translations[locale].ai;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.approvalsTab}
    >
      <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl max-h-[85vh] flex flex-col">
        <div className="sm:hidden w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3" />
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {t.approvalsTab} ({approvals.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {approvals.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
              {t.noApprovals}
            </p>
          ) : (
            approvals.map((req) => (
              <div
                key={req.approvalId}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                    {req.tool}
                  </span>
                  <span className="font-mono">{req.actionId}</span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {req.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {req.destination}
                  </p>
                </div>

                <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 text-sm text-slate-800 dark:text-slate-200">
                  {req.payloadPreview}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onApprove(req, false)}
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    {t.approve}
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject(req)}
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
                  >
                    <X className="w-4 h-4" />
                    {t.reject}
                  </button>
                  {req.canSimulateTimeout && (
                    <button
                      type="button"
                      onClick={() => onApprove(req, true)}
                      className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-medium hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {t.simulateTimeout}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
