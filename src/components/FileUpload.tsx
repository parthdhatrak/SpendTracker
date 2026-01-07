'use client';

import { useState, useRef, DragEvent } from 'react';
import { Button } from './ui/button';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    accept?: string;
    maxSize?: number;
    label?: string;
    description?: string;
    isLoading?: boolean;
}

export default function FileUpload({
    onFileSelect,
    accept = '.pdf',
    maxSize = 10 * 1024 * 1024, // 10MB default
    label = 'Upload File',
    description = 'Drag and drop or click to browse',
    isLoading = false,
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFile = (file: File) => {
        setError(null);

        // Check file size
        if (file.size > maxSize) {
            setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
            return;
        }

        // Check file type
        const acceptedTypes = accept.split(',').map(t => t.trim());
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const isAccepted = acceptedTypes.some(
            type => type === fileExtension || type === file.type || type === '*'
        );

        if (!isAccepted) {
            setError(`Please upload a valid file (${accept})`);
            return;
        }

        setSelectedFile(file);
        onFileSelect(file);
    };

    const clearFile = () => {
        setSelectedFile(null);
        setError(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className="w-full">
            <div
                onClick={() => !isLoading && inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200 
          ${isDragging
                        ? 'border-white bg-zinc-900'
                        : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/50'
                    }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          ${selectedFile ? 'border-zinc-500' : ''}
        `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isLoading}
                />

                {isLoading ? (
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
                        <p className="text-zinc-400">Processing...</p>
                    </div>
                ) : selectedFile ? (
                    <div className="flex flex-col items-center">
                        <div className="text-4xl mb-3 grayscale">📄</div>
                        <p className="text-white font-medium">{selectedFile.name}</p>
                        <p className="text-zinc-500 text-sm mt-1">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                clearFile();
                            }}
                            className="mt-4 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-700"
                        >
                            Remove file
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="text-4xl mb-3 grayscale">📁</div>
                        <p className="text-white font-medium">{label}</p>
                        <p className="text-zinc-500 text-sm mt-1">{description}</p>
                        <p className="text-zinc-600 text-xs mt-2">
                            Max size: {Math.round(maxSize / 1024 / 1024)}MB
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <p className="text-zinc-400 text-sm">❌ {error}</p>
                </div>
            )}
        </div>
    );
}
