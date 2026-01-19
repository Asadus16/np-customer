'use client';

import { X } from 'lucide-react';

interface ExitConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ExitConfirmModal({ isOpen, onCancel, onConfirm }: ExitConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button
              onClick={onCancel}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          {/* Content */}
          <div className="px-8 pb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Are you sure you want to leave this booking?
            </h2>
            <p className="text-gray-600 mb-8">
              All selections will be lost
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3.5 px-6 border border-gray-300 rounded-full font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3.5 px-6 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-colors"
              >
                Yes, exit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
