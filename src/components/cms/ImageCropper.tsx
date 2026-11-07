import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Crop, ZoomIn, ZoomOut, RotateCw, RotateCcw, 
  FlipHorizontal, FlipVertical, Sliders, RefreshCw, 
  Check, Maximize2, Move, Sun, Contrast, Palette, Grid
} from 'lucide-react';
import { cropAndAdjustImage, CropAdjustmentOptions } from '../../lib/imageUtils';

interface ImageCropperProps {
  imageSrc: string;
  onApply: (croppedDataUrl: string) => void;
  onCancel?: () => void;
}

const ASPECT_RATIOS = [
  { label: 'Free / Original', value: null, icon: 'Original' },
  { label: '16:9 Banner', value: 16 / 9, icon: '16:9' },
  { label: '4:5 Card', value: 4 / 5, icon: '4:5' },
  { label: '1:1 Square', value: 1, icon: '1:1' },
  { label: '4:3 Standard', value: 4 / 3, icon: '4:3' },
  { label: '3:2 Photo', value: 3 / 2, icon: '3:2' },
  { label: '21:9 Ultra', value: 21 / 9, icon: '21:9' },
];

export default function ImageCropper({
  imageSrc,
  onApply,
  onCancel
}: ImageCropperProps) {
  const [aspectRatio, setAspectRatio] = useState<number | null>(16 / 9);
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Filter adjustments
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);

  const [activeTab, setActiveTab] = useState<'crop' | 'adjust' | 'transform'>('crop');
  const [processing, setProcessing] = useState<boolean>(false);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle Drag / Pan with mouse or touch
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPanX: panX,
      startPanY: panY
    };
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging || !dragStartRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;

    setPanX(Math.max(-80, Math.min(80, dragStartRef.current.startPanX + deltaX)));
    setPanY(Math.max(-80, Math.min(80, dragStartRef.current.startPanY + deltaY)));
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  const handleReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setFitMode('cover');
  };

  const handleApply = async () => {
    if (!imageSrc) return;
    try {
      setProcessing(true);
      const options: CropAdjustmentOptions = {
        aspectRatio,
        zoom,
        panX,
        panY,
        rotation,
        flipH,
        flipV,
        fitMode,
        brightness,
        contrast,
        saturation,
        maxDimension: 1600,
        targetMaxSizeBytes: 200 * 1024
      };

      const resultDataUrl = await cropAndAdjustImage(imageSrc, options);
      onApply(resultDataUrl);
    } catch (err) {
      console.error('Failed to crop image:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Control Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('crop')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'crop' 
                ? 'bg-maroon text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Crop className="h-3.5 w-3.5" /> Aspect & Fit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transform')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'transform' 
                ? 'bg-maroon text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Maximize2 className="h-3.5 w-3.5" /> Zoom & Position
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('adjust')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'adjust' 
                ? 'bg-maroon text-white shadow-sm' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" /> Tone & Filters
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
              showGrid ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'
            }`}
            title="Toggle Rule-of-Thirds Grid"
          >
            <Grid className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 text-xs flex items-center gap-1"
            title="Reset All Adjustments"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Preview Canvas / Stage */}
      <div className="relative bg-slate-950 rounded-2xl overflow-hidden p-4 flex items-center justify-center min-h-[260px] max-h-[360px] select-none touch-none shadow-inner">
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          className={`relative overflow-hidden rounded-xl border-2 border-dashed border-amber-400/80 shadow-2xl cursor-grab active:cursor-grabbing max-w-full max-h-full transition-all duration-300 ${
            isDragging ? 'ring-2 ring-amber-400' : ''
          }`}
          style={{
            aspectRatio: aspectRatio ? `${aspectRatio}` : 'auto',
            width: aspectRatio && aspectRatio >= 1 ? '100%' : 'auto',
            height: aspectRatio && aspectRatio < 1 ? '260px' : 'auto',
            maxWidth: '100%',
            maxHeight: '260px'
          }}
        >
          {/* Rule of Thirds Grid Overlay */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none z-20 grid grid-cols-3 grid-rows-3 opacity-30">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>
          )}

          {/* Interactive Image Frame */}
          <div 
            className="w-full h-full flex items-center justify-center bg-slate-900 overflow-hidden"
          >
            <img
              src={imageSrc}
              alt="Adjustment preview"
              className="max-w-none transition-transform duration-75 pointer-events-none"
              style={{
                width: fitMode === 'contain' ? '100%' : '100%',
                height: fitMode === 'contain' ? '100%' : '100%',
                objectFit: fitMode,
                transform: `translate(${panX}%, ${panY}%) scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
              }}
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Drag instruction overlay badge */}
          <div className="absolute bottom-2 right-2 z-20 pointer-events-none bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] text-white/80 flex items-center gap-1">
            <Move className="h-3 w-3" /> Drag to position
          </div>
        </div>
      </div>

      {/* Tab Controls Area */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
        {/* Tab 1: Aspect Ratio & Fit */}
        {activeTab === 'crop' && (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Target Aspect Ratio / Crop Preset
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {ASPECT_RATIOS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setAspectRatio(item.value)}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                      aspectRatio === item.value
                        ? 'bg-maroon text-white border-maroon shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Fit Style
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFitMode('cover')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    fitMode === 'cover'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Fill Frame (Cover)
                </button>
                <button
                  type="button"
                  onClick={() => setFitMode('contain')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    fitMode === 'contain'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Fit Entire Image (Contain)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Zoom, Rotate & Positioning */}
        {activeTab === 'transform' && (
          <div className="space-y-4">
            {/* Zoom Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <ZoomIn className="h-3.5 w-3.5 text-maroon" /> Zoom Scale
                </span>
                <span className="text-maroon font-mono">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setZoom(Math.max(0.6, Number((zoom - 0.1).toFixed(1))))}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <input
                  type="range"
                  min="0.6"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-maroon"
                />
                <button
                  type="button"
                  onClick={() => setZoom(Math.min(3, Number((zoom + 0.1).toFixed(1))))}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Pan Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                  <span>Horizontal Pan</span>
                  <span className="font-mono">{panX}%</span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="80"
                  step="1"
                  value={panX}
                  onChange={(e) => setPanX(parseInt(e.target.value, 10))}
                  className="w-full accent-maroon"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                  <span>Vertical Pan</span>
                  <span className="font-mono">{panY}%</span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="80"
                  step="1"
                  value={panY}
                  onChange={(e) => setPanY(parseInt(e.target.value, 10))}
                  className="w-full accent-maroon"
                />
              </div>
            </div>

            {/* Rotate & Flips */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Rotate & Orientation
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                  className="py-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> -90°
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="py-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-1"
                >
                  <RotateCw className="h-3.5 w-3.5" /> +90°
                </button>
                <button
                  type="button"
                  onClick={() => setFlipH(!flipH)}
                  className={`py-1.5 px-3 border rounded-xl text-xs font-semibold flex items-center justify-center gap-1 ${
                    flipH ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <FlipHorizontal className="h-3.5 w-3.5" /> Flip X
                </button>
                <button
                  type="button"
                  onClick={() => setFlipV(!flipV)}
                  className={`py-1.5 px-3 border rounded-xl text-xs font-semibold flex items-center justify-center gap-1 ${
                    flipV ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <FlipVertical className="h-3.5 w-3.5" /> Flip Y
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Visual Lighting & Tone */}
        {activeTab === 'adjust' && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Sun className="h-3.5 w-3.5 text-amber-500" /> Brightness
                </span>
                <span className="font-mono">{brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="160"
                step="2"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Contrast className="h-3.5 w-3.5 text-blue-500" /> Contrast
                </span>
                <span className="font-mono">{contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="160"
                step="2"
                value={contrast}
                onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                className="w-full accent-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-emerald-500" /> Saturation / Color
                </span>
                <span className="font-mono">{saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={saturation}
                onChange={(e) => setSaturation(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
          >
            Back / Cancel
          </button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={handleApply}
            disabled={processing}
            className="px-6 py-2.5 bg-maroon text-white font-bold rounded-full text-xs uppercase tracking-wider hover:bg-maroon/90 shadow-md shadow-maroon/20 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {processing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Processing Crop...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Apply & Save Image
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
