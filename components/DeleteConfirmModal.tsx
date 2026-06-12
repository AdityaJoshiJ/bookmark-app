"use client";

import React, { useEffect, useRef } from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  message,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Basic focus management: focus the modal when it opens
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={!isLoading ? onCancel : undefined}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-md bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-900/20 overflow-hidden animate-in zoom-in-95 duration-200 focus:outline-none"
      >
        {/* Header decoration */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500"></div>

        <div className="p-8">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-rose-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>

          <h2
            id="modal-title"
            className="text-2xl font-black text-slate-900 mb-3"
          >
            {title}
          </h2>
          <p className="text-slate-600 font-medium leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-6 py-3.5 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-rose-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                "Delete Bookmark"
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-6 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
