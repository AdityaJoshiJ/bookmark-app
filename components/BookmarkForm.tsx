"use client";

import React, { useState, useMemo } from "react";

interface BookmarkFormProps {
  initialData?: {
    title: string;
    url: string;
    is_public: boolean;
  };
  onSubmit: (data: { title: string; url: string; is_public: boolean }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const BookmarkForm: React.FC<BookmarkFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    url: initialData?.url || "",
    is_public: initialData?.is_public ?? false,
  });

  const hasChanges = useMemo(() => {
    if (!initialData) return true; // Always allow submission for new bookmarks
    return (
      formData.title !== initialData.title ||
      formData.url !== initialData.url ||
      formData.is_public !== initialData.is_public
    );
  }, [formData, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-semibold text-slate-700 mb-1"
        >
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="My Awesome Bookmark"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-black placeholder:text-slate-400"
        />
      </div>

      <div>
        <label
          htmlFor="url"
          className="block text-sm font-semibold text-slate-700 mb-1"
        >
          URL
        </label>
        <input
          id="url"
          name="url"
          type="url"
          value={formData.url}
          onChange={handleChange}
          required
          placeholder="https://example.com"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-black placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center space-x-3 py-1">
        <input
          id="is_public"
          name="is_public"
          type="checkbox"
          checked={formData.is_public}
          onChange={handleChange}
          className="w-5 h-5 text-indigo-600 border-slate-300 rounded-lg focus:ring-indigo-500 cursor-pointer"
        />
        <label
          htmlFor="is_public"
          className="text-sm font-semibold text-slate-700 cursor-pointer"
        >
          Make this bookmark public
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading || !hasChanges}
        className="w-full px-4 py-3 font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-200"
      >
        {isLoading
          ? "Saving..."
          : initialData
            ? "Update Bookmark"
            : "Save Bookmark"}
      </button>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full px-4 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Cancel
        </button>
      )}
    </form>
  );
};
