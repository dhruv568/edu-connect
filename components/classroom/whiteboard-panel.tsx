"use client";

import React, { useEffect, useRef, useState } from "react";
import { WhiteboardElement } from "@/types/classroom";
import {
  PenTool,
  Eraser,
  Type,
  Square,
  Circle as CircleIcon,
  Minus,
  Highlighter,
  RotateCcw,
  RotateCw,
  Trash2,
  Lock,
} from "lucide-react";

interface WhiteboardPanelProps {
  initialElements: WhiteboardElement[];
  canDraw: boolean;
  isTeacher: boolean;
  onSaveState: (elements: WhiteboardElement[]) => Promise<void>;
  onClose: () => void;
}

export function WhiteboardPanel({
  initialElements,
  canDraw,
  isTeacher,
  onSaveState,
  onClose,
}: WhiteboardPanelProps) {
  const [elements, setElements] = useState<WhiteboardElement[]>(initialElements || []);
  const [tool, setTool] = useState<"pen" | "eraser" | "text" | "rectangle" | "circle" | "line" | "highlight">("pen");
  const [color, setColor] = useState("#3b82f6"); // Default blue
  const [size, setSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [undoStack, setUndoStack] = useState<WhiteboardElement[][]>([]);
  const [redoStack, setRedoStack] = useState<WhiteboardElement[][]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    redrawCanvas();
  }, [elements]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach((el) => {
      ctx.beginPath();
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = el.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (el.type === "pen" || el.type === "eraser" || el.type === "highlight") {
        if (el.type === "eraser") {
          ctx.strokeStyle = "#0f172a"; // Background dark color
        } else if (el.type === "highlight") {
          ctx.strokeStyle = `${el.color}66`; // Semi-transparent
          ctx.lineWidth = el.size * 3;
        }

        if (el.points && el.points.length > 0) {
          ctx.moveTo(el.points[0].x, el.points[0].y);
          el.points.forEach((pt) => ctx.lineTo(pt.x, pt.y));
          ctx.stroke();
        }
      } else if (el.type === "rectangle") {
        ctx.strokeRect(el.x || 0, el.y || 0, el.width || 0, el.height || 0);
      } else if (el.type === "circle") {
        const radius = Math.sqrt(Math.pow(el.width || 0, 2) + Math.pow(el.height || 0, 2)) / 2;
        ctx.arc((el.x || 0) + radius, (el.y || 0) + radius, Math.max(1, radius), 0, 2 * Math.PI);
        ctx.stroke();
      } else if (el.type === "line") {
        ctx.moveTo(el.x || 0, el.y || 0);
        ctx.lineTo((el.x || 0) + (el.width || 0), (el.y || 0) + (el.height || 0));
        ctx.stroke();
      } else if (el.type === "text" && el.text) {
        ctx.font = `${el.size * 5}px sans-serif`;
        ctx.fillText(el.text, el.x || 0, el.y || 0);
      }
    });
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canDraw) return;
    setIsDrawing(true);
    const coords = getCanvasCoords(e);
    currentPathRef.current = [coords];

    setUndoStack([...undoStack, elements]);
    setRedoStack([]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canDraw) return;
    const coords = getCanvasCoords(e);
    currentPathRef.current.push(coords);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (tool === "pen" || tool === "eraser" || tool === "highlight") {
      ctx.beginPath();
      ctx.strokeStyle = tool === "eraser" ? "#0f172a" : tool === "highlight" ? `${color}66` : color;
      ctx.lineWidth = tool === "highlight" ? size * 3 : size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const pts = currentPathRef.current;
      if (pts.length > 1) {
        ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !canDraw) return;
    setIsDrawing(false);

    const newElement: WhiteboardElement = {
      id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: tool,
      points: [...currentPathRef.current],
      color,
      size,
    };

    const updatedElements = [...elements, newElement];
    setElements(updatedElements);
    currentPathRef.current = [];
    onSaveState(updatedElements);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack([...redoStack, elements]);
    setElements(previous);
    setUndoStack(undoStack.slice(0, -1));
    onSaveState(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack([...undoStack, elements]);
    setElements(next);
    setRedoStack(redoStack.slice(0, -1));
    onSaveState(next);
  };

  const handleClear = () => {
    if (!canDraw) return;
    setUndoStack([...undoStack, elements]);
    setElements([]);
    onSaveState([]);
  };

  return (
    <div className="w-full h-full bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden text-slate-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenTool className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Digital Whiteboard</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs font-semibold"
        >
          Close
        </button>
      </div>

      {/* Drawing Toolbar */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-2">
        {/* Tools Group */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!canDraw}
            onClick={() => setTool("pen")}
            className={`p-2 rounded-xl text-xs ${tool === "pen" ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-400"}`}
            title="Pen"
          >
            <PenTool className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!canDraw}
            onClick={() => setTool("highlight")}
            className={`p-2 rounded-xl text-xs ${tool === "highlight" ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-400"}`}
            title="Highlight"
          >
            <Highlighter className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!canDraw}
            onClick={() => setTool("eraser")}
            className={`p-2 rounded-xl text-xs ${tool === "eraser" ? "bg-blue-600 text-white" : "hover:bg-slate-800 text-slate-400"}`}
            title="Eraser"
          >
            <Eraser className="h-4 w-4" />
          </button>
        </div>

        {/* Colors & Actions Group */}
        <div className="flex items-center gap-2">
          {/* Color Picker */}
          <input
            type="color"
            disabled={!canDraw}
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-7 h-7 bg-transparent border-0 cursor-pointer rounded-lg overflow-hidden"
            title="Color Picker"
          />

          <button
            type="button"
            disabled={!canDraw || undoStack.length === 0}
            onClick={handleUndo}
            className="p-2 rounded-xl text-slate-400 hover:text-white disabled:opacity-40"
            title="Undo"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!canDraw || redoStack.length === 0}
            onClick={handleRedo}
            className="p-2 rounded-xl text-slate-400 hover:text-white disabled:opacity-40"
            title="Redo"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          {isTeacher && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 rounded-xl text-red-400 hover:bg-red-500/20"
              title="Clear Canvas"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Lock Notice for Students when drawing disabled */}
      {!canDraw && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-1.5 flex items-center justify-center gap-2 text-amber-300 text-xs font-semibold">
          <Lock className="h-3.5 w-3.5" /> Student drawing is view-only (Disabled by Educator)
        </div>
      )}

      {/* Canvas Area */}
      <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center p-2">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`w-full h-full border border-slate-800 rounded-2xl bg-slate-950 shadow-inner ${
            canDraw ? "cursor-crosshair" : "cursor-not-allowed"
          }`}
        />
      </div>
    </div>
  );
}
