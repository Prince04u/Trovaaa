"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Upload, Plus, Trash2, Copy, Check, Settings, Send, 
  Eye, Download, Image as ImageIcon, Bold, Italic, 
  AlignCenter, AlignLeft, AlignRight, RefreshCw, Star 
} from "lucide-react";
import ClientSidePreview from "@/components/admin/ClientSidePreview";
import { format } from "date-fns";

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

  // Scheduled prediction queue states
  const [scheduledPredictions, setScheduledPredictions] = useState<any[]>([]);
  const [scheduleTime, setScheduleTime] = useState<string>("");
  const [schedulePriority, setSchedulePriority] = useState<number>(0);
  const [scheduleAutoOverride, setScheduleAutoOverride] = useState<boolean>(false);
  const [scheduling, setScheduling] = useState<boolean>(false);
  const [scheduleType, setScheduleType] = useState<"chart" | "text" | "gif">("chart");
  const [scheduleMessageText, setScheduleMessageText] = useState<string>("");
  const [scheduleGifUrl, setScheduleGifUrl] = useState<string>("");
  const [uploadingGif, setUploadingGif] = useState<boolean>(false);

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
  const [previewError, setPreviewError] = useState<string | null>(null);

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

  const fetchScheduledPredictions = async () => {
    try {
      const res = await fetch("/api/predictions/schedule");
      if (res.ok) {
        const json = await res.json();
        setScheduledPredictions(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load scheduled predictions:", err);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchTelegramSettings();
    fetchScheduledPredictions();

    // Poll every 5 seconds to ensure instant queue processing and real-time UI updates
    const interval = setInterval(() => {
      fetchScheduledPredictions();
    }, 5000);

    return () => clearInterval(interval);
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
    const nextNum = (BigInt(numStr) + BigInt(1)).toString();
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
  // Removed manual handleGeneratePreview since we now use real-time ClientSidePreview.

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

  const handleGifUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/gif") && !file.name.endsWith(".gif")) {
      showNotification("Please select a valid GIF file", "error");
      return;
    }

    try {
      setUploadingGif(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await res.json();
      setScheduleGifUrl(data.url);
      showNotification("GIF uploaded successfully!", "success");
    } catch (err: any) {
      showNotification(err.message || "Failed to upload GIF", "error");
    } finally {
      setUploadingGif(false);
    }
  };

  const handleSchedulePrediction = async () => {
    if (scheduleType === "chart" && !selectedTemplate) {
      showNotification("Please select a template first", "error");
      return;
    }
    if (scheduleType === "text" && !scheduleMessageText.trim()) {
      showNotification("Please enter a message to schedule", "error");
      return;
    }
    if (scheduleType === "gif" && !scheduleGifUrl.trim()) {
      showNotification("Please enter or select a GIF URL", "error");
      return;
    }
    if (!scheduleTime) {
      showNotification("Please select a date & time for scheduling", "error");
      return;
    }

    try {
      setScheduling(true);
      
      const payload: any = {
        chatId: telegramChatId || undefined,
        scheduledAt: new Date(scheduleTime).toISOString(),
        priority: schedulePriority,
      };

      if (scheduleType === "gif") {
        payload.gifUrl = scheduleGifUrl.trim();
        payload.messageText = scheduleMessageText.trim() || undefined;
        payload.autoOverrideWingo = false;
      } else if (scheduleType === "text") {
        payload.messageText = scheduleMessageText;
        payload.autoOverrideWingo = false;
      } else {
        payload.templateId = selectedTemplate!.id;
        payload.headerValues = headerValues;
        payload.rows = rows;
        payload.isLast = isLastPrediction;
        payload.autoOverrideWingo = scheduleAutoOverride;
      }

      const res = await fetch("/api/predictions/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to schedule");
      }

      showNotification("Broadcast scheduled successfully!", "success");
      setScheduleTime("");
      setScheduleMessageText("");
      fetchScheduledPredictions();
    } catch (err: any) {
      showNotification(err.message || "Scheduling failed", "error");
    } finally {
      setScheduling(false);
    }
  };

  const handleDeleteScheduled = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this scheduled prediction?")) return;
    try {
      const res = await fetch(`/api/predictions/schedule?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete");
      }

      showNotification("Cancelled scheduled prediction", "success");
      fetchScheduledPredictions();
    } catch (err: any) {
      showNotification(err.message || "Cancellation failed", "error");
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
                <div 
                  className="flex-1 bg-black/40 rounded-2xl border border-border p-3 flex items-center justify-center relative min-h-[160px] cursor-zoom-in"
                  onClick={() => { if (selectedTemplate) setIsPreviewModalOpen(true); }}
                  title="Click to view full screen"
                >
                  <div className="w-full h-[260px] rounded-lg overflow-hidden relative">
                    <ClientSidePreview 
                      template={selectedTemplate} 
                      headerValues={headerValues} 
                      rows={rows} 
                      isLastPrediction={isLastPrediction} 
                    />
                    <div className="absolute inset-0 hover:bg-black/10 transition z-10"></div>
                  </div>
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
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="bg-surface-2 text-foreground border border-border rounded-xl py-2 px-1 text-xs font-semibold hover:bg-surface-3 transition"
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

                {/* Schedule For Later Form */}
                <div className="border-t border-border mt-4 pt-4 flex flex-col gap-3">
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Schedule Broadcast</h3>
                  
                  <div>
                    <label className="text-[10px] text-muted block mb-1">Broadcast Type</label>
                    <div className="grid grid-cols-3 gap-1 bg-surface-2 p-0.5 rounded-lg border border-border">
                      <button
                        type="button"
                        onClick={() => setScheduleType("chart")}
                        className={`text-[10px] py-1.5 rounded font-semibold transition ${
                          scheduleType === "chart" ? "bg-teal-500 text-black font-bold" : "text-muted hover:text-foreground"
                        }`}
                      >
                        Chart
                      </button>
                      <button
                        type="button"
                        onClick={() => setScheduleType("text")}
                        className={`text-[10px] py-1.5 rounded font-semibold transition ${
                          scheduleType === "text" ? "bg-teal-500 text-black font-bold" : "text-muted hover:text-foreground"
                        }`}
                      >
                        Text
                      </button>
                      <button
                        type="button"
                        onClick={() => setScheduleType("gif")}
                        className={`text-[10px] py-1.5 rounded font-semibold transition ${
                          scheduleType === "gif" ? "bg-teal-500 text-black font-bold" : "text-muted hover:text-foreground"
                        }`}
                      >
                        GIF
                      </button>
                    </div>
                  </div>

                  {scheduleType === "text" ? (
                    <div>
                      <label className="text-[10px] text-muted block mb-1">Message Text (HTML allowed)</label>
                      <textarea
                        value={scheduleMessageText}
                        onChange={(e) => setScheduleMessageText(e.target.value)}
                        placeholder="Enter message text... e.g. <b>LUVO MALL</b> Game start!"
                        rows={3}
                        className="w-full bg-surface-2 border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none resize-none"
                      />
                    </div>
                  ) : null}

                  {scheduleType === "gif" ? (
                    <div className="flex flex-col gap-2">
                      <div>
                        <label className="text-[10px] text-muted block mb-1">Preset GIF (Optional)</label>
                        <select
                          onChange={(e) => {
                            if (e.target.value) setScheduleGifUrl(e.target.value);
                          }}
                          className="w-full bg-surface-2 border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                        >
                          <option value="">-- Custom GIF URL --</option>
                          <option value="https://media.giphy.com/media/3oz8xAFtq1qOcnsC9G/giphy.gif">Win Celebration GIF</option>
                          <option value="https://media.giphy.com/media/26FPsOhZmqtMC6G0E/giphy.gif">Loss / Try Again GIF</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-muted block mb-1">GIF URL (Direct Link to .gif)</label>
                          <input
                            type="text"
                            value={scheduleGifUrl}
                            onChange={(e) => setScheduleGifUrl(e.target.value)}
                            placeholder="https://example.com/win.gif"
                            className="w-full bg-surface-2 border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted block mb-1">Or Upload GIF File</label>
                          <input
                            type="file"
                            accept="image/gif"
                            onChange={handleGifUpload}
                            disabled={uploadingGif}
                            className="w-full bg-surface-2 border border-border rounded-xl px-2 py-1 text-xs focus:outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-teal-500 file:text-black file:cursor-pointer disabled:opacity-50"
                          />
                          {uploadingGif && <span className="text-[9px] text-teal-400 mt-0.5 block animate-pulse">Uploading GIF...</span>}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-muted block mb-1">Caption Text (Optional, HTML allowed)</label>
                        <textarea
                          value={scheduleMessageText}
                          onChange={(e) => setScheduleMessageText(e.target.value)}
                          placeholder="Caption to send with the GIF..."
                          rows={2}
                          className="w-full bg-surface-2 border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none resize-none"
                        />
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <label className="text-[10px] text-muted block mb-1">Scheduled Time</label>
                    <input
                      type="datetime-local"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-muted block mb-1">Sending Order</label>
                      <select
                        value={schedulePriority}
                        onChange={(e) => setSchedulePriority(Number(e.target.value))}
                        className="w-full bg-surface-2 border border-border rounded-xl px-2 py-1.5 text-xs focus:outline-none"
                      >
                        <option value={0}>Normal</option>
                        <option value={10}>1st / First</option>
                        <option value={9}>2nd / Second</option>
                        <option value={8}>3rd / Third</option>
                        <option value={7}>4th / Fourth</option>
                        <option value={6}>5th / Fifth</option>
                      </select>
                    </div>
                    {scheduleType === "chart" && (
                      <div className="flex items-center gap-1.5 mt-4">
                        <input
                          type="checkbox"
                          id="autoOverride"
                          checked={scheduleAutoOverride}
                          onChange={(e) => setScheduleAutoOverride(e.target.checked)}
                          className="rounded bg-surface-2 border-border accent-teal-500 w-3.5 h-3.5"
                        />
                        <label htmlFor="autoOverride" className="text-[10px] text-muted select-none cursor-pointer">
                          Auto Wingo Pre-Result
                        </label>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSchedulePrediction}
                    disabled={scheduling || (scheduleType === "chart" && !selectedTemplate) || (scheduleType === "gif" && !scheduleGifUrl.trim())}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-black rounded-xl py-2 text-xs font-bold transition mt-1 disabled:opacity-50"
                  >
                    {scheduling ? "Scheduling..." : "Schedule Broadcast"}
                  </button>
                </div>
              </section>
            </div>
          </div>

          {/* Scheduled Predictions Queue Section */}
          <section className="card-surface rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md shadow-xl mt-6">
            <h2 className="text-lg font-semibold mb-2">Pending Telegram Dispatch Queue</h2>
            <p className="text-xs text-muted mb-4">Predictions scheduled to be automatically broadcasted to Telegram.</p>

            {scheduledPredictions.length === 0 ? (
              <p className="text-sm text-muted py-4 text-center">No scheduled predictions pending.</p>
            ) : (
              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-sm border-collapse text-left">
                  <thead>
                    <tr className="bg-surface-2 border-b border-border">
                      <th className="py-2.5 px-4 font-semibold text-xs text-muted uppercase">Template</th>
                      <th className="py-2.5 px-4 font-semibold text-xs text-muted uppercase">Scheduled Time</th>
                      <th className="py-2.5 px-4 font-semibold text-xs text-muted uppercase">Priority</th>
                      <th className="py-2.5 px-4 font-semibold text-xs text-muted uppercase">Wingo Pre-Result</th>
                      <th className="py-2.5 px-4 font-semibold text-xs text-muted uppercase">Created By</th>
                      <th className="py-2.5 px-4 font-semibold text-xs text-muted uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {scheduledPredictions.map((pred) => (
                      <tr key={pred.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-medium">
                          <div>{pred.templateName}</div>
                          {pred.gifUrl && (
                            <div className="text-[10px] text-gold truncate max-w-[200px] mt-0.5" title={pred.gifUrl}>
                              GIF: {pred.gifUrl}
                            </div>
                          )}
                          {pred.messageText && (
                            <div className="text-[10px] text-muted truncate max-w-[200px] mt-0.5" title={pred.messageText}>
                              {pred.messageText}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-muted">
                          {format(new Date(pred.scheduledAt), "yyyy-MM-dd HH:mm:ss")}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pred.priority >= 6 ? "bg-gold/10 text-gold border border-gold/20" : "bg-white/10 text-muted"
                          }`}>
                            {pred.priority === 10 ? "1st" :
                             pred.priority === 9 ? "2nd" :
                             pred.priority === 8 ? "3rd" :
                             pred.priority === 7 ? "4th" :
                             pred.priority === 6 ? "5th" :
                             "Normal"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pred.autoOverrideWingo ? "bg-green/10 text-green border border-green/20" : "bg-white/10 text-muted"
                          }`}>
                            {pred.autoOverrideWingo ? "Auto-Set" : "None"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted">{pred.createdBy}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteScheduled(pred.id)}
                            className="text-xs font-semibold px-2.5 py-1 rounded bg-red/10 border border-red/30 text-red hover:bg-red/20 hover:text-white transition"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
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
      {isPreviewModalOpen && selectedTemplate && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsPreviewModalOpen(false)}
        >
          <div className="relative w-full max-w-5xl h-[85vh] flex flex-col items-center justify-center gap-4 cursor-default" onClick={e => e.stopPropagation()}>
            <div className="w-full flex-1 relative rounded-xl shadow-2xl border border-white/10 overflow-hidden flex items-center justify-center bg-[#222]">
              <ClientSidePreview 
                template={selectedTemplate} 
                headerValues={headerValues} 
                rows={rows} 
                isLastPrediction={isLastPrediction} 
              />
            </div>
            <div className="flex gap-4 mt-2 shrink-0">
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
