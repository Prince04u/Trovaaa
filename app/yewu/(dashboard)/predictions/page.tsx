"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Upload, Plus, Trash2, Copy, Check, Settings, Send, 
  Eye, Download, Image as ImageIcon, Bold, Italic, 
  AlignCenter, AlignLeft, AlignRight, RefreshCw, Star 
} from "lucide-react";

interface FieldStyle {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  align: "left" | "center" | "right";
  rotation: number;
  opacity: number;
  letterSpacing: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

interface Template {
  id: string;
  name: string;
  imageUrl: string;
  fields: Record<string, FieldStyle>;
  isDefault: boolean;
  createdAt: string;
}

interface TableRow {
  period: string;
  project: string;
  colour: "Red" | "Green" | "Violet";
  amount: string;
  result: "WON" | "LOSS" | "PENDING" | "NULL";
  profit: string;
}

export default function PredictionsPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "generator" | "editor">("dashboard");

  // Selection states
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedFieldKey, setSelectedFieldKey] = useState<string>("teacherName");

  // Generator input values - Header Metadata
  const [headerValues, setHeaderValues] = useState<Record<string, string>>({
    teacherPlan: "Teacher Plan",
    investmentRule: "Use 3x",
    teacherName: "Carlos",
    telegramHandle: "@mason81631",
  });

  // Dynamic Table Rows
  const [rows, setRows] = useState<TableRow[]>([
    { period: "20220216431", project: "emerd", colour: "Red", amount: "100", result: "WON", profit: "100" }
  ]);
  const [isLastPrediction, setIsLastPrediction] = useState(false);

  // Telegram settings & overrides
  const [savedChannelUsername, setSavedChannelUsername] = useState<string>("@mason81631");
  const [savingChannel, setSavingChannel] = useState<boolean>(false);
  const [telegramChatId, setTelegramChatId] = useState<string>("");

  // Editor states
  const [editorTemplate, setEditorTemplate] = useState<Template | null>(null);
  const [editorFields, setEditorFields] = useState<Record<string, FieldStyle>>({});
  const [imgDimensions, setImgDimensions] = useState({ width: 1024, height: 404 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Creation & Upload states
  const [newTemplateName, setNewTemplateName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Preview Image states
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Notifications
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch templates from DB
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/templates");
      if (!res.ok) throw new Error("Failed to load templates");
      const data = await res.json();
      setTemplates(data);
      if (data.length > 0) {
        const def = data.find((t: Template) => t.isDefault) || data[0];
        setSelectedTemplate(def);
      }
    } catch (err: any) {
      showNotification(err.message || "Failed to load templates", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Telegram targeted channel setting
  const fetchTelegramSettings = async () => {
    try {
      const res = await fetch("/api/prediction/settings");
      if (res.ok) {
        const data = await res.json();
        setSavedChannelUsername(data.channelUsername);
        setTelegramChatId(data.channelUsername);
      }
    } catch (err) {
      console.error("Failed to load telegram channel settings:", err);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchTelegramSettings();
  }, []);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Synchronize header inputs when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const initialHeader: Record<string, string> = {};
      Object.entries(selectedTemplate.fields).forEach(([key, field]) => {
        initialHeader[key] = headerValues[key] !== undefined ? headerValues[key] : field.text;
      });
      setHeaderValues(initialHeader);
    }
  }, [selectedTemplate]);



  // Save targeted channel username to DB
  const handleSaveChannelSettings = async () => {
    try {
      setSavingChannel(true);
      const res = await fetch("/api/prediction/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelUsername: savedChannelUsername }),
      });
      if (!res.ok) throw new Error("Failed to save targeted channel");
      const data = await res.json();
      setSavedChannelUsername(data.channelUsername);
      setTelegramChatId(data.channelUsername);
      showNotification("Targeted Telegram channel updated in settings!", "success");
    } catch (err: any) {
      showNotification(err.message, "error");
    } finally {
      setSavingChannel(false);
    }
  };

  // Upload Template
  const handleUploadTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName || !selectedFile) {
      showNotification("Please select a file and enter a name", "error");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("name", newTemplateName);
      formData.append("file", selectedFile);

      const res = await fetch("/api/templates", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      showNotification("Template uploaded successfully!", "success");
      setNewTemplateName("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchTemplates();
    } catch (err: any) {
      showNotification(err.message || "Failed to upload template", "error");
    } finally {
      setUploading(false);
    }
  };

  // Duplicate Template
  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate", id }),
      });
      if (!res.ok) throw new Error("Duplication failed");
      showNotification("Template duplicated!", "success");
      fetchTemplates();
    } catch (err: any) {
      showNotification("Duplication failed", "error");
    }
  };

  // Delete Template
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      showNotification("Template deleted!", "success");
      fetchTemplates();
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  // Set Default Template
  const handleSetDefault = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (!res.ok) throw new Error("Failed to set default");
      showNotification("Default template updated!", "success");
      fetchTemplates();
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  // Auto-increments a period string numerically (e.g. 20220216431 -> 20220216432)
  const incrementPeriod = (periodStr: string): string => {
    const match = periodStr.match(/(\d+)$/);
    if (!match) return periodStr;
    const numStr = match[1];
    const nextNum = (BigInt(numStr) + 1n).toString();
    const padded = nextNum.padStart(numStr.length, "0");
    return periodStr.slice(0, periodStr.length - numStr.length) + padded;
  };

  // Add Table Row
  const handleAddRow = () => {
    const lastRow = rows[rows.length - 1];
    let newPeriod = "20220216431";
    let newProject = "emerd";
    if (lastRow) {
      newPeriod = incrementPeriod(lastRow.period);
      newProject = lastRow.project;
    }
    const newRow: TableRow = {
      period: newPeriod,
      project: newProject,
      colour: "Red",
      amount: "100",
      result: "WON",
      profit: "100"
    };
    setRows([...rows, newRow]);
  };

  // Remove last row
  const handleRemoveRow = () => {
    if (rows.length <= 1) {
      showNotification("Must keep at least 1 prediction row", "error");
      return;
    }
    setRows(rows.slice(0, -1));
  };

  // Update specific cell in table
  const handleCellChange = (index: number, key: keyof TableRow, value: string) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [key]: value };

    // Auto-calculate profit when amount, colour, or result changes
    if (key === "amount" || key === "result" || key === "colour") {
      const amt = parseInt(updated[index].amount) || 0;
      const res = updated[index].result;
      const col = updated[index].colour;
      
      if (res === "LOSS") {
        updated[index].profit = `-${amt}`;
      } else if (res === "WON") {
        if (col === "Violet") {
          updated[index].profit = `${amt * 2}`;
        } else {
          updated[index].profit = `${amt}`;
        }
      } else {
        // PENDING or NULL
        updated[index].profit = "";
      }
    }

    setRows(updated);
  };

  // Calculate sum of profit column
  const calculateTotalProfit = (): number => {
    let total = 0;
    rows.forEach((r) => {
      total += parseInt(r.profit) || 0;
    });
    return total;
  };

  // Trigger Image Generation for Preview
  const handleGeneratePreview = async () => {
    if (!selectedTemplate) return;
    try {
      setPreviewLoading(true);
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
        setPreviewBlobUrl(null);
      }

      const res = await fetch("/api/prediction/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          headerValues,
          rows,
          isLast: isLastPrediction,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate preview image");
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
    } catch (err: any) {
      showNotification(err.message || "Failed to generate preview", "error");
    } finally {
      setPreviewLoading(false);
    }
  };

  // Download Image
  const handleDownload = async () => {
    if (!selectedTemplate) return;
    try {
      showNotification("Generating high-resolution download...", "success");
      const res = await fetch("/api/prediction/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          headerValues,
          rows,
          isLast: isLastPrediction,
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `prediction_chart_${rows[rows.length - 1]?.period || Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      showNotification("Failed to download image", "error");
    }
  };

  // Send to Telegram Channel
  const handleSendTelegram = async () => {
    if (!selectedTemplate) return;
    try {
      // Set persistent notification (no auto-hide timeout)
      setNotification({ message: "Sending chart to Telegram...", type: "success" });
      
      const res = await fetch("/api/prediction/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          headerValues,
          rows,
          isLast: isLastPrediction,
          chatId: telegramChatId || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to send");
      }

      // Show success notification and set a timeout to auto-hide it after 4 seconds
      setNotification({ message: "Sent successfully!", type: "success" });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({ message: err.message || "Send failed", type: "error" });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Open Visual Editor
  const openVisualEditor = (template: Template) => {
    setEditorTemplate(template);
    setEditorFields({ ...template.fields });
    setSelectedFieldKey(Object.keys(template.fields)[0] || "teacherName");
    setActiveTab("editor");
    
    const img = new Image();
    img.src = template.imageUrl;
    img.onload = () => {
      setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
  };

  // Visual Editor Dragging
  const handleMouseDown = (key: string, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedFieldKey(key);
    setIsDragging(true);

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleX = rect.width / imgDimensions.width;
    const scaleY = rect.height / imgDimensions.height;
    
    const field = editorFields[key];
    const mouseX = (e.clientX - rect.left) / scaleX;
    const mouseY = (e.clientY - rect.top) / scaleY;

    setDragStart({ x: mouseX, y: mouseY });
    setDragOffset({ x: field.x, y: field.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !editorTemplate || !selectedFieldKey) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleX = rect.width / imgDimensions.width;
    const scaleY = rect.height / imgDimensions.height;

    const mouseX = (e.clientX - rect.left) / scaleX;
    const mouseY = (e.clientY - rect.top) / scaleY;

    const deltaX = mouseX - dragStart.x;
    const deltaY = mouseY - dragStart.y;

    const newX = Math.round(Math.max(0, Math.min(imgDimensions.width, dragOffset.x + deltaX)));
    const newY = Math.round(Math.max(0, Math.min(imgDimensions.height, dragOffset.y + deltaY)));

    updateFieldStyle(selectedFieldKey, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateFieldStyle = (key: string, updates: Partial<FieldStyle>) => {
    setEditorFields((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...updates,
      },
    }));
  };

  // Save visual coordinates
  const handleSaveEditor = async () => {
    if (!editorTemplate) return;
    try {
      const res = await fetch(`/api/templates/${editorTemplate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: editorFields,
        }),
      });

      if (!res.ok) throw new Error("Failed to save coordinates");
      showNotification("Coordinates successfully saved!", "success");
      await fetchTemplates();
      setActiveTab("dashboard");
    } catch (err: any) {
      showNotification(err.message, "error");
    }
  };

  return (
    <div className="flex flex-col gap-6 text-foreground min-h-screen">
      {/* Status toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border shadow-2xl transition-all duration-300 transform scale-100 ${
          notification.type === "success" 
            ? "border-green/40 text-green bg-green/10 backdrop-blur" 
            : "border-red/40 text-red bg-red/10 backdrop-blur"
        }`}>
          {notification.message}
        </div>
      )}

      {/* Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-300">
            Prediction Charts
          </h1>
          <p className="text-sm text-muted">Generate multi-row prediction tables with automated period increment and direct Telegram broadcast.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-surface-2 p-1.5 rounded-2xl border border-border">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 text-sm rounded-xl transition ${
              activeTab === "dashboard" ? "bg-white/10 text-foreground font-medium" : "text-muted hover:text-foreground"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              if (templates.length === 0) {
                showNotification("Please upload a template first", "error");
                return;
              }
              setActiveTab("generator");
              handleGeneratePreview();
            }}
            className={`px-4 py-2 text-sm rounded-xl transition ${
              activeTab === "generator" ? "bg-white/10 text-foreground font-medium" : "text-muted hover:text-foreground"
            }`}
          >
            Generator Panel
          </button>
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Templates grid */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <section className="card-surface rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md shadow-xl">
              <h2 className="text-lg font-semibold mb-4">Templates Directory</h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-12 text-muted">
                  <ImageIcon className="w-12 h-12 mx-auto opacity-30 mb-2" />
                  <p className="text-sm">No templates uploaded yet.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <div 
                      key={template.id} 
                      onClick={() => setSelectedTemplate(template)}
                      className={`relative group rounded-2xl border bg-surface p-4 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col ${
                        selectedTemplate?.id === template.id 
                          ? "border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.15)]" 
                          : "border-border hover:border-white/20"
                      }`}
                    >
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black/40 relative mb-3">
                        <img 
                          src={template.imageUrl} 
                          alt={template.name} 
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-105" 
                        />
                        {template.isDefault && (
                          <span className="absolute top-2 left-2 flex items-center gap-1 bg-teal-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                            <Star className="w-3 h-3 fill-black" /> DEFAULT
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                      <p className="text-xs text-muted mb-4">
                        Created: {new Date(template.createdAt).toLocaleDateString()}
                      </p>

                      <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border">
                        <button
                          onClick={() => openVisualEditor(template)}
                          className="flex-1 bg-surface-2 hover:bg-surface-3 text-xs border border-border py-1.5 rounded-xl transition text-center"
                        >
                          Visual Edit
                        </button>
                        <button
                          onClick={(e) => handleSetDefault(template.id, e)}
                          title="Set as Default"
                          className={`p-1.5 rounded-xl border border-border transition ${
                            template.isDefault ? "text-teal-400 bg-teal-500/10 border-teal-500/30" : "text-muted hover:text-foreground"
                          }`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                        <button
                          onClick={(e) => handleDuplicate(template.id, e)}
                          title="Duplicate"
                          className="p-1.5 rounded-xl border border-border text-muted hover:text-foreground transition"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(template.id, e)}
                          title="Delete"
                          className="p-1.5 rounded-xl border border-border text-red hover:bg-red/10 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Upload template form */}
          <div>
            <section className="card-surface rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md shadow-xl">
              <h2 className="text-lg font-semibold mb-4">Upload Template</h2>
              <form onSubmit={handleUploadTemplate} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-muted block mb-1.5">Template Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Luvo Mall Base"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-teal-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted block mb-1.5">PNG Template Image</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border hover:border-teal-500/50 rounded-2xl p-6 text-center cursor-pointer transition bg-surface-2/50"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      required
                      accept="image/png"
                      className="hidden"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                    <Upload className="w-8 h-8 text-muted mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">
                      {selectedFile ? selectedFile.name : "Select a PNG file"}
                    </p>
                    <p className="text-xs text-muted mt-1">Accepts PNG format only</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-teal-500 text-black font-semibold rounded-xl py-2.5 hover:brightness-110 transition disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload & Save"}
                </button>
              </form>
            </section>
          </div>
        </div>
      )}

      {/* GENERATOR PANEL TAB */}
      {activeTab === "generator" && selectedTemplate && (
        <div className="flex flex-col gap-6">
          {/* Header fields metadata section */}
          <section className="card-surface rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Header Info</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.keys(selectedTemplate.fields).map((key) => (
                <div key={key}>
                  <label className="text-xs text-muted block mb-1 capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </label>
                  <input
                    type="text"
                    value={headerValues[key] || ""}
                    onChange={(e) => setHeaderValues(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Core dynamic table rows dispatch section */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Table Rows List Editor */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <section className="card-surface rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Prediction Table Rows</h2>
                    <p className="text-xs text-muted">Rows dynamically append below the table header.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRemoveRow}
                      className="bg-red/10 border border-red/30 text-red px-3 py-1.5 rounded-xl text-xs hover:bg-red/20 transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove Row
                    </button>
                    <button
                      onClick={handleAddRow}
                      className="bg-teal-500/10 border border-teal-500/30 text-teal-400 px-3 py-1.5 rounded-xl text-xs hover:bg-teal-500/20 transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Row
                    </button>
                  </div>
                </div>

                {/* Table Form header and body */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm text-left">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted">
                        <th className="py-2 pr-2 font-medium">Period</th>
                        <th className="py-2 px-2 font-medium">Project</th>
                        <th className="py-2 px-2 font-medium">Colour</th>
                        <th className="py-2 px-2 font-medium">Amount</th>
                        <th className="py-2 px-2 font-medium">Result</th>
                        <th className="py-2 pl-2 font-medium">Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="py-2 pr-2">
                            <input
                              type="text"
                              value={row.period}
                              onChange={(e) => handleCellChange(idx, "period", e.target.value)}
                              className="w-28 bg-surface-2 border border-border rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={row.project}
                              onChange={(e) => handleCellChange(idx, "project", e.target.value)}
                              className="w-20 bg-surface-2 border border-border rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <select
                              value={row.colour}
                              onChange={(e) => handleCellChange(idx, "colour", e.target.value)}
                              className="w-24 bg-surface-2 border border-border rounded-lg px-2 py-1 text-xs focus:outline-none"
                            >
                              <option value="Red">Red</option>
                              <option value="Green">Green</option>
                              <option value="Violet">Violet</option>
                            </select>
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              value={row.amount}
                              onChange={(e) => handleCellChange(idx, "amount", e.target.value)}
                              className="w-20 bg-surface-2 border border-border rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <select
                              value={row.result}
                              onChange={(e) => handleCellChange(idx, "result", e.target.value)}
                              className={`w-24 border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none ${
                                row.result === "WON" 
                                  ? "bg-green/10 border-green/30 text-green" 
                                  : row.result === "LOSS"
                                  ? "bg-red/10 border-red/30 text-red"
                                  : row.result === "PENDING"
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                  : "bg-white/10 border-white/20 text-muted"
                              }`}
                            >
                              <option value="WON" className="bg-surface-3 text-green font-semibold">WON</option>
                              <option value="LOSS" className="bg-surface-3 text-red font-semibold">LOSS</option>
                              <option value="PENDING" className="bg-surface-3 text-amber-400 font-semibold">PENDING</option>
                              <option value="NULL" className="bg-surface-3 text-muted font-semibold">NULL</option>
                            </select>
                          </td>
                          <td className="py-2 pl-2">
                            <input
                              type="number"
                              value={row.profit}
                              onChange={(e) => handleCellChange(idx, "profit", e.target.value)}
                              className={`w-20 bg-surface-2 border border-border rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none ${
                                parseInt(row.profit) >= 0 ? "text-green" : "text-red"
                              }`}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Closing row session properties */}
                <div className="flex items-center justify-between border-t border-border mt-4 pt-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isLastCheckbox"
                      checked={isLastPrediction}
                      onChange={(e) => setIsLastPrediction(e.target.checked)}
                      className="w-4 h-4 cursor-pointer accent-teal-500 rounded border-border"
                    />
                    <label htmlFor="isLastCheckbox" className="text-xs text-foreground cursor-pointer font-semibold select-none">
                      Is Last Prediction (Show Total Profit block)
                    </label>
                  </div>

                  <div className="text-sm font-semibold">
                    Calculated Total Profit: <span className={calculateTotalProfit() >= 0 ? "text-green" : "text-red"}>₹{calculateTotalProfit()}</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Preview and Send Panel */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <section className="card-surface rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md shadow-xl flex flex-col h-full">
                <h2 className="text-lg font-semibold mb-3">Dispatch Console</h2>

                {/* Targeted Channel Configuration */}
                <div className="border-b border-border pb-4 mb-4">
                  <label className="text-[10px] text-muted block mb-1">Targeted Telegram Channel</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="@channel_username"
                      value={savedChannelUsername}
                      onChange={(e) => setSavedChannelUsername(e.target.value)}
                      className="flex-1 bg-surface-2 border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    />
                    <button
                      onClick={handleSaveChannelSettings}
                      disabled={savingChannel}
                      className="bg-white/10 hover:bg-white/15 border border-border text-foreground px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                    >
                      {savingChannel ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>

                {/* Preview Thumbnail */}
                <div className="flex-1 bg-black/40 rounded-2xl border border-border p-3 flex items-center justify-center relative min-h-[160px]">
                  {previewLoading ? (
                    <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
                  ) : previewBlobUrl ? (
                    <img 
                      src={previewBlobUrl} 
                      alt="Prediction Preview" 
                      onClick={() => setIsPreviewModalOpen(true)}
                      className="max-h-[260px] w-auto object-contain rounded-lg shadow-lg cursor-zoom-in hover:brightness-95 transition" 
                      title="Click to view full screen"
                    />
                  ) : (
                    <div className="text-center text-xs text-muted">
                      <Eye className="w-10 h-10 mx-auto opacity-30 mb-1" />
                      <p>Click Preview to compile.</p>
                    </div>
                  )}
                </div>

                {/* Telegram Custom Chat ID Override */}
                <div className="mt-4 flex flex-col gap-3">
                  <div>
                    <label className="text-[10px] text-muted block mb-1">Custom Chat ID Override</label>
                    <input
                      type="text"
                      placeholder="e.g. -100xxxxxxxxxx"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleGeneratePreview}
                    disabled={previewLoading}
                    className="bg-surface-2 text-foreground border border-border rounded-xl py-2 px-1 text-xs font-semibold hover:bg-surface-3 transition"
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!previewBlobUrl || previewLoading}
                    className="bg-surface-2 text-foreground border border-border rounded-xl py-2 px-1 text-xs font-semibold hover:bg-surface-3 transition disabled:opacity-40"
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={handleSendTelegram}
                    disabled={previewLoading}
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 text-black rounded-xl py-2 px-1 text-xs font-bold hover:brightness-110 shadow-lg transition"
                  >
                    Broadcast
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* VISUAL LAYOUT EDITOR TAB */}
      {activeTab === "editor" && editorTemplate && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <section className="card-surface rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md shadow-xl">
              <h2 className="text-lg font-semibold mb-4">Header Coordinate Placement</h2>
              
              <div 
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="relative bg-black/40 rounded-2xl border border-border overflow-hidden select-none"
                style={{ aspectRatio: `${imgDimensions.width}/${imgDimensions.height}` }}
              >
                <img
                  src={editorTemplate.imageUrl}
                  alt="Editor Background"
                  className="w-full h-full object-fill pointer-events-none absolute inset-0"
                />

                {/* Display Draggable header fields */}
                {Object.entries(editorFields).map(([key, field]) => {
                  const xPct = (field.x / imgDimensions.width) * 100;
                  const yPct = (field.y / imgDimensions.height) * 100;
                  const isActive = selectedFieldKey === key;

                  return (
                    <div
                      key={key}
                      onMouseDown={(e) => handleMouseDown(key, e)}
                      className={`absolute cursor-move select-none p-1 rounded transition-shadow hover:bg-teal-500/10 ${
                        isActive ? "border-2 border-teal-400 bg-teal-500/10 shadow-[0_0_8px_rgba(20,184,166,0.3)] z-20" : "border border-transparent z-10"
                      }`}
                      style={{
                        left: `${xPct}%`,
                        top: `${yPct}%`,
                        transform: `translate(${field.align === "center" ? "-50%" : field.align === "right" ? "-100%" : "0%"}, -50%) rotate(${field.rotation || 0}deg)`,
                        fontSize: `calc(${field.fontSize}px * 0.5)`, 
                        fontFamily: field.fontFamily || "Inter",
                        color: field.color || "#ffffff",
                        fontWeight: field.fontWeight || "normal",
                        fontStyle: field.fontStyle || "normal",
                        opacity: field.opacity !== undefined ? field.opacity : 1,
                      }}
                    >
                      {field.text || key}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Editor sidebar controls */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <section className="card-surface rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md shadow-xl flex flex-col h-full">
              <h2 className="text-lg font-semibold mb-4">Text Properties</h2>
              
              <div className="mb-4">
                <label className="text-xs text-muted block mb-1.5">Select Layer</label>
                <select
                  value={selectedFieldKey}
                  onChange={(e) => setSelectedFieldKey(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                >
                  {Object.keys(editorFields).map((key) => (
                    <option key={key} value={key} className="capitalize bg-surface-3">
                      {key.replace(/([A-Z])/g, " $1")}
                    </option>
                  ))}
                </select>
              </div>

              {selectedFieldKey && editorFields[selectedFieldKey] && (
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
                  <div>
                    <label className="text-xs text-muted block mb-1.5">Placeholder text</label>
                    <input
                      type="text"
                      value={editorFields[selectedFieldKey].text}
                      onChange={(e) => updateFieldStyle(selectedFieldKey, { text: e.target.value })}
                      className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted block mb-1">X Coordinate</label>
                      <input
                        type="number"
                        value={editorFields[selectedFieldKey].x}
                        onChange={(e) => updateFieldStyle(selectedFieldKey, { x: parseInt(e.target.value) || 0 })}
                        className="w-full bg-surface-2 border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted block mb-1">Y Coordinate</label>
                      <input
                        type="number"
                        value={editorFields[selectedFieldKey].y}
                        onChange={(e) => updateFieldStyle(selectedFieldKey, { y: parseInt(e.target.value) || 0 })}
                        className="w-full bg-surface-2 border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Size and Color */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted block mb-1">Size (px)</label>
                      <input
                        type="number"
                        value={editorFields[selectedFieldKey].fontSize}
                        onChange={(e) => updateFieldStyle(selectedFieldKey, { fontSize: parseInt(e.target.value) || 12 })}
                        className="w-full bg-surface-2 border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted block mb-1">Font Color</label>
                      <input
                        type="text"
                        value={editorFields[selectedFieldKey].color}
                        onChange={(e) => updateFieldStyle(selectedFieldKey, { color: e.target.value })}
                        className="w-full bg-surface-2 border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mt-auto pt-6 border-t border-border">
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    setEditorTemplate(null);
                  }}
                  className="bg-surface-2 hover:bg-surface-3 border border-border text-foreground py-2.5 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditor}
                  className="bg-teal-500 hover:brightness-110 text-black py-2.5 rounded-xl font-bold transition"
                >
                  Save Layout
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Fullscreen Preview Modal */}
      {isPreviewModalOpen && previewBlobUrl && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsPreviewModalOpen(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center gap-4">
            <img 
              src={previewBlobUrl} 
              alt="Fullscreen Preview" 
              className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl border border-white/10" 
            />
            <div className="flex gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                className="bg-teal-500 hover:brightness-110 text-black px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition"
              >
                Download PNG
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPreviewModalOpen(false);
                }}
                className="bg-white/10 hover:bg-white/15 border border-border text-foreground px-5 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
