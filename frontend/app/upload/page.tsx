'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import PageHeader from '@/components/PageHeader';

interface UploadResult {
  message: string;
  total_rows: number;
  successful_imports: number;
  failed_imports: number;
  errors: string[];
}

export default function UploadPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      setUploading(true);
      setError(null);
      
      const result = await api.uploadCSV(selectedFile);
      setUploadResult(result as UploadResult);
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const template = await api.downloadTemplate();
      const blob = new Blob([template], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions_template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Failed to download template');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setError(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#93BFC7] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ECF4E8] to-[#CBF3BB]">
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Upload Transactions"
          description="Import transactions from a CSV file"
        />

        <div className="max-w-3xl mx-auto">
          {/* Instructions Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">How to Upload</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Download the CSV template or prepare your own CSV file</li>
              <li>Fill in your transaction data with columns: date, description, amount, type (optional)</li>
              <li>Drag and drop the file below or click to browse</li>
              <li>Click "Upload" to import your transactions</li>
            </ol>
            
            <button
              onClick={handleDownloadTemplate}
              className="mt-4 px-4 py-2 bg-[#93BFC7] text-white rounded-lg hover:bg-[#7AABB5] transition"
            >
              📥 Download CSV Template
            </button>
          </div>

          {/* Upload Zone */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div
              className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive
                  ? 'border-[#93BFC7] bg-[#ECF4E8]'
                  : 'border-gray-300 bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="pointer-events-none">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-semibold text-[#93BFC7]">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">CSV files only (max 10MB)</p>
              </div>
            </div>

            {/* Selected File */}
            {selectedFile && (
              <div className="mt-4 p-4 bg-[#ECF4E8] rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg
                    className="h-8 w-8 text-[#93BFC7]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Upload Button */}
            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="mt-4 w-full px-6 py-3 bg-[#93BFC7] text-white rounded-lg hover:bg-[#7AABB5] disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  '⬆️ Upload Transactions'
                )}
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Success Result */}
          {uploadResult && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center mb-4">
                <svg
                  className="h-8 w-8 text-green-500 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-800">{uploadResult.message}</h3>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Total Rows</p>
                  <p className="text-2xl font-bold text-gray-800">{uploadResult.total_rows}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Successful</p>
                  <p className="text-2xl font-bold text-green-600">{uploadResult.successful_imports}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{uploadResult.failed_imports}</p>
                </div>
              </div>

              {uploadResult.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Errors:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-red-600 max-h-40 overflow-y-auto">
                    {uploadResult.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => router.push('/transactions')}
                  className="flex-1 px-4 py-2 bg-[#93BFC7] text-white rounded-lg hover:bg-[#7AABB5] transition"
                >
                  View Transactions
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Upload Another File
                </button>
              </div>
            </div>
          )}

          {/* CSV Format Example */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">CSV Format Example</h2>
            <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-800 font-mono">
{`date,description,amount,type
2024-10-01,Starbucks Coffee,5.50,expense
2024-10-02,Salary Deposit,3500.00,income
2024-10-03,Uber Ride,18.30,expense
2024-10-05,Netflix Subscription,15.99,expense`}
              </pre>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              <strong>Note:</strong> The 'type' column is optional. If not specified, transactions will be categorized as 'expense' by default.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
