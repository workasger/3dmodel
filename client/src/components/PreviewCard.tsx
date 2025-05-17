import { useState, useEffect } from "react";
import { useTranslation } from "../lib/i18n";

interface PreviewCardProps {
  originalImage: string | null;
  previewImage: string | null;
  isLoading: boolean;
  promptValue: string;
  analysisText?: string;
  onPromptChange: (value: string) => void;
  onRegenerateClick: () => void;
  onConfirmClick: () => void;
}

const PreviewCard = ({
  originalImage,
  previewImage,
  isLoading,
  promptValue,
  analysisText,
  onPromptChange,
  onRegenerateClick,
  onConfirmClick
}: PreviewCardProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Original photo */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-400">{t("preview.originalPhoto")}</p>
        <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
          {originalImage ? (
            <img 
              src={originalImage} 
              alt={t("preview.originalPhotoAlt")}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
          )}
        </div>
      </div>
      
      {/* Generated preview */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-400">{t("preview.generatedAvatar")}</p>
        <div className="aspect-square bg-gray-800 rounded-lg relative flex items-center justify-center overflow-hidden">
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-space-deep/70 rounded-lg">
              <div className="loading-spinner mb-3"></div>
              <p className="text-sm">{t("preview.generating")}</p>
            </div>
          )}
          
          {/* Preview image */}
          {!isLoading && previewImage ? (
            <img 
              src={previewImage}
              alt={t("preview.generatedAvatarAlt")}
              className="w-full h-full object-cover"
            />
          ) : !isLoading && (
            <div className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          )}
        </div>
      </div>
      
      {/* AI Analysis section */}
      {analysisText && !isLoading && (
        <div className="mt-6 col-span-1 md:col-span-2">
          <h3 className="text-sm font-medium text-accent mb-2">{t("preview.aiAnalysis")}</h3>
          <div className="p-3 rounded-lg bg-gray-800/50 border border-accent/20 text-gray-300">
            {analysisText}
          </div>
        </div>
      )}
      
      {/* Edit prompt section */}
      <div className="mt-6 col-span-1 md:col-span-2">
        <h3 className="text-sm font-medium text-gray-400 mb-2">{t("preview.editPrompt")}</h3>
        <textarea 
          className="w-full p-3 rounded-lg bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:border-accent transition-colors"
          placeholder={t("preview.promptPlaceholder")}
          rows={2}
          value={promptValue}
          onChange={(e) => onPromptChange(e.target.value)}
        />
      </div>
      
      {/* Action buttons */}
      <div className="mt-8 flex justify-between col-span-1 md:col-span-2">
        <button 
          className="bg-gray-700/50 border border-gray-600/30 hover:bg-gray-600 text-white font-medium py-2.5 px-8 rounded-full shadow-md transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onRegenerateClick}
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M3 2v6h6"></path>
            <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
            <path d="M21 22v-6h-6"></path>
            <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
          </svg>
          {t("preview.regenerate")}
        </button>
        <button 
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium py-2.5 px-8 rounded-full shadow-md transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onConfirmClick}
          disabled={isLoading || !previewImage}
        >
          {t("preview.confirm")}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PreviewCard;
