"use client";

import React, { useState, useEffect } from "react";

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

  // Ensure internal state updates when initialData changes (e.g., when clicking edit)
  useEffect(() => {
    setFormData({
      title: initialData?.title || "",
      url: initialData?.url || "",
      is_public: initialData?.is_public ?? false,
    });
  }, [initialData]);

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
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
        />
      </div>

      <div>
        <label
          htmlFor="url"
          className="block text-sm font-medium text-gray-700 mb-1"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
        />
      </div>

      <div className="flex items-center space-x-3">
        <input
          id="is_public"
          name="is_public"
          type="checkbox"
          checked={formData.is_public}
          onChange={handleChange}
          className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
        />
        <label
          htmlFor="is_public"
          className="text-sm font-medium text-gray-700"
        >
          Make this bookmark public
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 font-semibold text-white bg-black rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
          className="w-full px-4 py-2 font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      )}
    </form>
  );
};
