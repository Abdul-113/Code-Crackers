import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Edit,
  X,
  Info,
} from 'lucide-react';
import { useExtractInvoice, useUploadInvoice } from '../../../hooks/useInvoices';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { Building2 } from 'lucide-react';


/* ─── Confidence badge ──────────────────────────────────────────────────── */
const ConfidenceBadge = ({ label, score }) => {
  const pct = Math.round((score || 0) * 100);
  if (pct === 0) return null;
  const config = {
    high:   { bg: 'bg-emerald-500/15', text: 'text-emerald-400', ring: 'ring-emerald-500/30', dot: 'bg-emerald-400' },
    medium: { bg: 'bg-amber-500/15',   text: 'text-amber-400',   ring: 'ring-amber-500/30',   dot: 'bg-amber-400'   },
    low:    { bg: 'bg-rose-500/15',    text: 'text-rose-400',    ring: 'ring-rose-500/30',     dot: 'bg-rose-400'    },
  }[label || 'low'];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ring-1 ${config.bg} ${config.text} ${config.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {pct}%
    </span>
  );
};

/* ─── Editable field row ─────────────────────────────────────────────────── */
const ExtractionField = ({ label, fieldKey, value, fieldData, onChange, type = 'text' }) => {
  const [editing, setEditing] = useState(false);
  const confidence = fieldData?.confidence || 0;
  const confLabel  = fieldData?.confidenceLabel || 'low';
  const isLow      = confLabel === 'low' || confidence < 0.60;
  const isMissing  = !value && value !== 0;

  const ringClass = isMissing
    ? 'ring-gray-600/40'
    : isLow
    ? 'ring-rose-500/50 bg-rose-950/20'
    : 'ring-emerald-500/30 bg-emerald-950/10';

  return (
    <div className="group relative">
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>
        <div className="flex items-center gap-1.5">
          {fieldData && <ConfidenceBadge label={confLabel} score={confidence} />}
          {isLow && !isMissing && (
            <span className="text-[9px] text-rose-400 font-medium">Please verify</span>
          )}
        </div>
      </div>

      <div className={`flex items-center gap-2 rounded-lg ring-1 px-3 py-2.5 transition-all duration-200 ${ringClass}`}>
        {editing ? (
          <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            onBlur={() => setEditing(false)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder-gray-600"
          />
        ) : (
          <span className={`flex-1 text-sm truncate ${isMissing ? 'text-gray-600 italic' : isLow ? 'text-rose-300' : 'text-white'}`}>
            {isMissing ? `Not detected` : String(value)}
          </span>
        )}
        <button
          onClick={() => setEditing(!editing)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-gray-500 hover:text-blue-400"
          title="Edit field"
        >
          <Edit className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

/* ─── Scanning animation ─────────────────────────────────────────────────── */
const ScanningOverlay = () => (
  <div className="absolute inset-0 z-20 bg-dark-card/95 rounded-2xl flex flex-col items-center justify-center gap-6">
    {/* Document icon with scanning beam */}
    <div className="relative w-24 h-28">
      <FileText className="w-24 h-28 text-blue-500/30" />
      <div
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-90"
        style={{ animation: 'scanBeam 1.5s ease-in-out infinite', top: '10%' }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
      </div>
    </div>

    <div className="text-center space-y-1">
      <p className="text-white font-semibold text-lg">Analysing Document</p>
      <p className="text-gray-400 text-sm">Extracting invoice fields with AI…</p>
    </div>
    {/* Progress dots */}
    <div className="flex gap-1.5">
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-blue-500"
          style={{ animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite` }}
        />
      ))}
    </div>
    <style>{`
      @keyframes scanBeam {
        0%   { top: 5%;  opacity: 0; }
        15%  { opacity: 1; }
        85%  { opacity: 1; }
        100% { top: 90%; opacity: 0; }
      }
    `}</style>
  </div>
);

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function InvoiceUploadZone({ userId }) {
  const { currentUser } = useAuth();
  const navigate   = useNavigate();
  const inputRef   = useRef(null);
  const dropRef    = useRef(null);

  const [dragActive, setDragActive]       = useState(false);
  const [selectedFile, setSelectedFile]   = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDone, setUploadDone]       = useState(false);
  const [extractionResult, setExtractionResult] = useState(null); // { fields, overallConfidence, … }
  const [formData, setFormData]           = useState({});
  const [buyersList, setBuyersList]       = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState(null);

  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'buyer'));
        const snap = await getDocs(q);
        const buyers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBuyersList(buyers);
      } catch (err) {
        console.error("Failed to fetch buyers:", err);
      }
    };
    fetchBuyers();
  }, []);

  const { mutate: extractPdf,  isPending: isExtracting  } = useExtractInvoice();
  const { mutate: uploadInvoice, isPending: isUploading } = useUploadInvoice();

  /* ── helpers ─────────────────────────────────────────────────────────── */

  const fieldValue = (key) => formData[key] ?? extractionResult?.fields?.[key]?.value ?? '';

  const handleFieldChange = (key, val) => {
    setFormData(prev => ({ ...prev, [key]: val }));
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPdfPreviewUrl(null);
    setExtractionResult(null);
    setFormData({});
    setUploadProgress(0);
    setUploadDone(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  /* ── file selection → immediate extraction ───────────────────────────── */

  const handleFileChosen = useCallback((file) => {
    if (!file || file.type !== 'application/pdf') return;
    if (file.size > 20 * 1024 * 1024) {
      alert('File exceeds 20 MB limit.');
      return;
    }

    setSelectedFile(file);
    setPdfPreviewUrl(URL.createObjectURL(file));
    setExtractionResult(null);
    setFormData({});

    // Immediately call Stage-1 extraction
    extractPdf(
      { file },
      {
        onSuccess: (data) => {
          setExtractionResult(data);
          // Pre-populate formData with extracted values
          const pre = {};
          Object.entries(data.fields || {}).forEach(([k, f]) => {
            if (f.value !== '' && f.value !== 0) pre[k] = f.value;
          });
          setFormData(pre);
        },
      }
    );
  }, [extractPdf]);

  /* ── drag & drop ─────────────────────────────────────────────────────── */

  const onDragOver  = (e) => { e.preventDefault(); setDragActive(true); };
  const onDragLeave = ()  => setDragActive(false);
  const onDrop      = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChosen(file);
  };

  /* ── final upload ─────────────────────────────────────────────────────── */

  const handleUpload = () => {
    if (!selectedFile) return;

    const meta = {
      irn:            fieldValue('irn')            || '',
      invoiceNumber:  fieldValue('invoiceNumber') || `INV-${Date.now()}`,
      invoiceDate:    fieldValue('invoiceDate')   || new Date().toISOString().split('T')[0],
      dueDate:        fieldValue('dueDate')        || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      invoiceAmount:  Number(fieldValue('invoiceAmount')) || 0,
      currency:       fieldValue('currency')       || 'INR',
      sellerName:     fieldValue('sellerName')     || 'Unknown Seller',
      sellerGST:      fieldValue('sellerGST')      || fieldValue('sellerGSTIN') || currentUser?.gst || currentUser?.profile?.gst || '',
      buyerName:      selectedBuyer?.companyName || selectedBuyer?.displayName || fieldValue('buyerName')      || 'Unknown Buyer',
      buyerCompany:   selectedBuyer?.companyName || selectedBuyer?.displayName || fieldValue('buyerName')      || 'Unknown Buyer',
      buyerGST:       selectedBuyer?.gst || fieldValue('buyerGST')       || '',
      buyerWalletAddress: selectedBuyer?.walletAddress || '',
      buyerId:        selectedBuyer?.id || selectedBuyer?.uid || '',
      industry:       fieldValue('industry') || 'TECHNOLOGY',
      taxAmount:      Number(fieldValue('taxAmount')) || 0,
      createdBy:      userId || currentUser?.uid || '',
    };

    uploadInvoice(
      { file: selectedFile, metadata: meta, onProgress: setUploadProgress },
      {
        onSuccess: (data) => {
          setUploadDone(true);
          setTimeout(() => navigate(`/app/invoice/${data.invoiceId || data.id}`), 1800);
        },
      }
    );
  };

  /* ── overall confidence summary ──────────────────────────────────────── */
  const overallPct = extractionResult
    ? Math.round((extractionResult.overallConfidence || 0) * 100)
    : 0;
  const lowFields = extractionResult
    ? Object.entries(extractionResult.fields || {}).filter(
        ([, f]) => f.confidenceLabel === 'low' && f.value !== '' && f.value !== 0
      ).length
    : 0;

  /* ─────────────────────────────────────────────────────────────────────── */
  /* RENDER */
  /* ─────────────────────────────────────────────────────────────────────── */

  /* ── Success state ─────────────────────────────────────────────────────── */
  if (uploadDone) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 text-center animate-fade-in">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
        </div>
        <div>
          <p className="text-white text-xl font-bold">Invoice Processed!</p>
          <p className="text-gray-400 text-sm mt-1">Redirecting to invoice details…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Drop zone ─────────────────────────────────────────────────── */}
      {!selectedFile ? (
        <div
          ref={dropRef}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-5 py-16 px-8 text-center select-none
            ${dragActive
              ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
              : 'border-gray-700 hover:border-blue-500/60 hover:bg-blue-500/5 bg-dark-card/40'
            }`}
        >
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-300
            ${dragActive ? 'bg-blue-500/20' : 'bg-gray-800'}`}>
            <UploadCloud className={`w-8 h-8 transition-colors ${dragActive ? 'text-blue-400' : 'text-gray-500'}`} />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">
              {dragActive ? 'Drop your invoice here' : 'Drop invoice PDF here'}
            </p>
            <p className="text-gray-500 text-sm mt-1">or click to browse — PDF only, max 20 MB</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Fields auto-extracted · Manual editing available · OCR-ready
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFileChosen(e.target.files?.[0])}
          />
        </div>
      ) : (
        /* ── File selected: preview + extraction results ───────────────── */
        <div className="space-y-5">

          {/* File header */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-dark-card/60 ring-1 ring-white/5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-blue-500/15 ring-1 ring-blue-500/30 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-gray-500 text-xs">{(selectedFile.size / 1024).toFixed(1)} KB
                  {extractionResult && ` · ${extractionResult.pageCount} page${extractionResult.pageCount !== 1 ? 's' : ''}`}
                  {extractionResult && ` · via ${extractionResult.extractorUsed}`}
                </p>
              </div>
            </div>
            <button onClick={resetAll} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* PDF preview */}
          {pdfPreviewUrl && (
            <div className="relative w-full rounded-xl overflow-hidden ring-1 ring-white/5" style={{ height: 200 }}>
              <iframe
                src={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full"
                title="PDF Preview"
              />
              <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/5 rounded-xl" />
            </div>
          )}

          {/* Scanning overlay / extraction result */}
          <div className="relative">
            {isExtracting && <ScanningOverlay />}

            {/* Confidence summary bar */}
            {extractionResult && !isExtracting && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-dark-card/60 ring-1 ring-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">Extraction complete</span>
                    {!extractionResult.success && (
                      <span className="text-xs text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Scanned PDF detected
                      </span>
                    )}
                  </div>
                  <span className={`text-sm font-bold ${
                    overallPct >= 80 ? 'text-emerald-400' : overallPct >= 60 ? 'text-amber-400' : 'text-rose-400'
                  }`}>{overallPct}% confidence</span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      overallPct >= 80 ? 'bg-emerald-500' : overallPct >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${overallPct}%` }}
                  />
                </div>
                {lowFields > 0 && (
                  <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {lowFields} field{lowFields !== 1 ? 's' : ''} with low confidence — please review below
                  </p>
                )}
                {!extractionResult.success && (
                  <p className="mt-1.5 text-xs text-amber-400 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    {extractionResult.message} Please fill fields manually.
                  </p>
                )}
              </div>
            )}

            {/* Extracted fields grid and Buyer Selection */}
            {(extractionResult || isExtracting) && (
              <div className={`space-y-4 transition-opacity duration-300 ${isExtracting ? 'opacity-0' : 'opacity-100'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ExtractionField label="GST IRN (64-char hex)" fieldKey="irn"
                    value={fieldValue('irn')} fieldData={extractionResult?.fields?.irn}
                    onChange={handleFieldChange} />
                  <ExtractionField label="Invoice Number" fieldKey="invoiceNumber"
                    value={fieldValue('invoiceNumber')} fieldData={extractionResult?.fields?.invoiceNumber}
                    onChange={handleFieldChange} />
                  <ExtractionField label="Currency" fieldKey="currency"
                    value={fieldValue('currency')} fieldData={extractionResult?.fields?.currency}
                    onChange={handleFieldChange} />
                  <ExtractionField label="Invoice Date" fieldKey="invoiceDate" type="date"
                    value={fieldValue('invoiceDate')} fieldData={extractionResult?.fields?.invoiceDate}
                    onChange={handleFieldChange} />
                  <ExtractionField label="Due Date" fieldKey="dueDate" type="date"
                    value={fieldValue('dueDate')} fieldData={extractionResult?.fields?.dueDate}
                    onChange={handleFieldChange} />
                  <ExtractionField label="Invoice Amount" fieldKey="invoiceAmount" type="number"
                    value={fieldValue('invoiceAmount')} fieldData={extractionResult?.fields?.invoiceAmount}
                    onChange={handleFieldChange} />
                  <ExtractionField label="Tax Amount" fieldKey="taxAmount" type="number"
                    value={fieldValue('taxAmount')} fieldData={extractionResult?.fields?.taxAmount}
                    onChange={handleFieldChange} />
                  <ExtractionField label="Seller Name" fieldKey="sellerName"
                    value={fieldValue('sellerName')} fieldData={extractionResult?.fields?.sellerName}
                    onChange={handleFieldChange} />
                  <ExtractionField label="Seller GSTIN" fieldKey="sellerGST"
                    value={fieldValue('sellerGST')} fieldData={extractionResult?.fields?.sellerGST}
                    onChange={handleFieldChange} />
                </div>
                
                {/* Corporate Buyer Selection */}
                <div className="p-4 rounded-xl bg-blue-950/20 ring-1 ring-blue-500/20 space-y-3">
                  <label className="text-sm font-bold text-blue-400 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Send for Approval: Select Corporate Buyer
                  </label>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    The extracted buyer is: <span className="font-semibold text-white">{fieldValue('buyerName')}</span> (GST: {fieldValue('buyerGST')}). 
                    Please select the registered buyer counterparty from the dropdown below to assign this invoice for their approval.
                  </p>
                  <select
                    className="w-full bg-dark-card border border-blue-500/30 rounded-lg p-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={selectedBuyer?.id || ''}
                    onChange={(e) => {
                      const b = buyersList.find(x => x.id === e.target.value);
                      setSelectedBuyer(b || null);
                    }}
                  >
                    <option value="">-- Select Registered Corporate Buyer --</option>
                    {buyersList.map(b => (
                      <option key={b.id} value={b.id}>{b.companyName || b.displayName || b.email} (GST: {b.gst || 'N/A'})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Upload progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Uploading to secure vault…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={resetAll}
              disabled={isExtracting || isUploading}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-400 bg-white/5 hover:bg-white/10 ring-1 ring-white/10 transition-all disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={isExtracting || isUploading || !selectedFile}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {isUploading ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Processing…</>
              ) : isExtracting ? (
                <><Sparkles className="w-4 h-4 animate-pulse" /> Extracting…</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Confirm &amp; Upload</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

