import { useState, useRef } from "react";
import { useTranslation } from "../lib/i18n";
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "../constants";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
}

const FileUpload = ({ onFileSelected }: FileUploadProps) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError(t("errors.fileType"));
      return false;
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(t("errors.fileSize"));
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (validateFile(file)) {
        setFileName(file.name);
        onFileSelected(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      if (validateFile(file)) {
        setFileName(file.name);
        onFileSelected(file);
      }
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={`file-upload-container rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-space-deep/50 transition-all ${
        isDragging ? "border-accent" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleButtonClick}
    >
      <div className="text-accent text-6xl mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      </div>
      
      <p className="mb-4 text-center">{t("upload.dragAndDrop")}</p>
      
      <button 
        type="button"
        className="bg-accent hover:bg-accent/80 text-white font-medium py-2 px-6 rounded-full transition-all"
      >
        {fileName || t("upload.selectFile")}
      </button>
      
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden"
        accept=".jpg,.jpeg,.png,.gif" 
        onChange={handleFileChange}
      />
      
      <p className="text-sm text-gray-400 mt-4">JPG, PNG {t("upload.or")} GIF, {t("upload.maxSize")}</p>
      
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
