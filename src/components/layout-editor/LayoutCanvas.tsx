import React, { useRef, useEffect, useState } from 'react';
import { AreaShape, ShapeType, NurseryLayout } from '../../types';
import { useLayoutStore } from '../../store/layoutStore';
import { ZoomIn, ZoomOut, Square, Circle, Type, Minus, Trash2, XCircle, Hexagon, AlertTriangle } from 'lucide-react';

interface LayoutCanvasProps {
  layout: NurseryLayout;
  selectedArea?: AreaShape | null;
  onAreaSelected?: (area: AreaShape) => void;
  readOnly?: boolean;
}

const LayoutCanvas: React.FC<LayoutCanvasProps> = ({ 
  layout,
  selectedArea,
  onAreaSelected,
  readOnly = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { addArea, updateArea, deleteArea, clearAreas } = useLayoutStore();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [endPoint, setEndPoint] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [selectedTool, setSelectedTool] = useState<ShapeType>('rectangle');
  const [textInputPosition, setTextInputPosition] = useState({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState('');
  const [hoveredArea, setHoveredArea] = useState<AreaShape | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [canvasError, setCanvasError] = useState<string | null>(null);
  
  // Polygon specific states
  const [polygonPoints, setPolygonPoints] = useState<{x: number, y: number}[]>([]);
  const [isCreatingPolygon, setIsCreatingPolygon] = useState(false);
  const [selectedPolygonPoint, setSelectedPolygonPoint] = useState<number | null>(null);
  
  // Text-specific states
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [showTextForm, setShowTextForm] = useState(false);

  // Convert layout dimensions based on unit
  const pixelsPerUnit = layout?.unit === 'meters' ? 100 : 1; // 100px = 1m or 1px = 1cm
  const canvasWidth = (layout?.width || 10) * pixelsPerUnit;
  const canvasHeight = (layout?.height || 10) * pixelsPerUnit;
  
  // Validate layout data
  useEffect(() => {
    try {
      if (!layout) {
        setCanvasError("No layout data available");
        return;
      }
      
      if (!Array.isArray(layout.areas)) {
        setCanvasError("Layout areas are not properly formatted");
        console.error("Invalid layout areas format:", layout.areas);
        return;
      }
      
      // Reset error if everything is fine
      setCanvasError(null);
    } catch (err) {
      setCanvasError(`Error initializing canvas: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error("Canvas initialization error:", err);
    }
  }, [layout]);
  
  const handleZoom = (delta: number) => {
    setScale(prevScale => {
      const newScale = prevScale + delta;
      return Math.min(Math.max(0.1, newScale), 3);
    });
  };
  
  const handleDeleteSelected = async () => {
    if (selectedArea && window.confirm('Are you sure you want to delete this area?')) {
      await deleteArea(selectedArea.id);
      if (onAreaSelected) onAreaSelected(null);
      setShowTextForm(false);
    }
  };
  
  const handleClearAll = async () => {
    if (!layout?.areas?.length) return;
    
    if (window.confirm('Are you sure you want to delete all areas? This cannot be undone.')) {
      await clearAreas();
      if (onAreaSelected) onAreaSelected(null);
      setShowTextForm(false);
    }
  };
  
  const getMousePosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.round((e.clientX - rect.left) / scale),
      y: Math.round((e.clientY - rect.top) / scale)
    };
  };

  const isPointInResizeHandle = (
    point: { x: number; y: number },
    area: AreaShape,
    handle: 'nw' | 'ne' | 'sw' | 'se'
  ) => {
    const handleSize = 10;
    let handleX, handleY;

    if (area.type === 'rectangle') {
      switch (handle) {
        case 'nw':
          handleX = area.x;
          handleY = area.y;
          break;
        case 'ne':
          handleX = area.x + area.width;
          handleY = area.y;
          break;
        case 'sw':
          handleX = area.x;
          handleY = area.y + area.height;
          break;
        case 'se':
          handleX = area.x + area.width;
          handleY = area.y + area.height;
          break;
      }
    } else if (area.type === 'circle') {
      const angle = handle === 'nw' ? 225 :
                   handle === 'ne' ? 315 :
                   handle === 'sw' ? 135 :
                   45; // se
      handleX = area.x + area.radius * Math.cos(angle * Math.PI / 180);
      handleY = area.y + area.radius * Math.sin(angle * Math.PI / 180);
    } else {
      return false;
    }

    return (
      point.x >= handleX - handleSize / 2 &&
      point.x <= handleX + handleSize / 2 &&
      point.y >= handleY - handleSize / 2 &&
      point.y <= handleY + handleSize / 2
    );
  };
  
  const isPointNearPolygonVertex = (
    point: { x: number; y: number },
    polygon: AreaShape & { type: 'polygon' }
  ) => {
    const handleSize = 10;
    if (!polygon.points || polygon.points.length < 3) return -1;
    
    for (let i = 0; i < polygon.points.length; i++) {
      const vertex = polygon.points[i];
      if (
        point.x >= vertex.x - handleSize / 2 &&
        point.x <= vertex.x + handleSize / 2 &&
        point.y >= vertex.y - handleSize / 2 &&
        point.y <= vertex.y + handleSize / 2
      ) {
        return i;
      }
    }
    
    return -1;
  };
  
  const isPointInPolygon = (point: { x: number, y: number }, polygon: AreaShape & { type: 'polygon' }) => {
    if (!polygon.points || polygon.points.length < 3) return false;
    
    const x = point.x;
    const y = point.y;
    let inside = false;
    
    for (let i = 0, j = polygon.points.length - 1; i < polygon.points.length; j = i++) {
      const xi = polygon.points[i].x;
      const yi = polygon.points[i].y;
      const xj = polygon.points[j].x;
      const yj = polygon.points[j].y;
      
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    
    return inside;
  };
  
  const isPointInTextBox = (point: { x: number, y: number }, textBox: AreaShape & { type: 'text' }) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return false;
    
    ctx.font = `${textBox.fontSize}px Arial`;
    const metrics = ctx.measureText(textBox.content);
    const height = textBox.fontSize;
    
    let textX = textBox.x;
    if (textBox.textAlign === 'center') {
      textX -= metrics.width / 2;
    } else if (textBox.textAlign === 'right') {
      textX -= metrics.width;
    }
    
    return (
      point.x >= textX &&
      point.x <= textX + metrics.width &&
      point.y >= textBox.y - height &&
      point.y <= textBox.y
    );
  };
  
  const drawShape = (ctx: CanvasRenderingContext2D, shape: AreaShape, isHovered: boolean) => {
    try {
      const isSelected = selectedArea?.id === shape.id;
      ctx.strokeStyle = isSelected ? '#3b82f6' : (isHovered ? '#10b981' : '#4a7856');
      ctx.fillStyle = isSelected ? 'rgba(59, 130, 246, 0.2)' : (isHovered ? 'rgba(16, 185, 129, 0.2)' : 'rgba(74, 120, 86, 0.2)');
      ctx.lineWidth = isHovered || isSelected ? 2.5 : 2;
      
      switch (shape.type) {
        case 'rectangle': {
          if (typeof shape.width !== 'number' || typeof shape.height !== 'number') {
            console.error("Invalid rectangle dimensions:", shape);
            return;
          }
          
          ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
          ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);

          // Draw resize handles if selected
          if (isSelected) {
            const handleSize = 8;
            const handles = [
              { x: shape.x, y: shape.y }, // NW
              { x: shape.x + shape.width, y: shape.y }, // NE
              { x: shape.x, y: shape.y + shape.height }, // SW
              { x: shape.x + shape.width, y: shape.y + shape.height } // SE
            ];

            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#3b82f6';
            handles.forEach(handle => {
              ctx.fillRect(
                handle.x - handleSize / 2,
                handle.y - handleSize / 2,
                handleSize,
                handleSize
              );
              ctx.strokeRect(
                handle.x - handleSize / 2,
                handle.y - handleSize / 2,
                handleSize,
                handleSize
              );
            });
          }
          break;
        }
        case 'circle': {
          if (typeof shape.radius !== 'number') {
            console.error("Invalid circle radius:", shape);
            return;
          }
          
          ctx.beginPath();
          ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Draw resize handles if selected
          if (isSelected) {
            const handleSize = 8;
            const angles = [45, 135, 225, 315]; // SE, SW, NW, NE
            
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#3b82f6';
            
            angles.forEach(angle => {
              const handleX = shape.x + shape.radius * Math.cos(angle * Math.PI / 180);
              const handleY = shape.y + shape.radius * Math.sin(angle * Math.PI / 180);
              
              ctx.fillRect(
                handleX - handleSize / 2,
                handleY - handleSize / 2,
                handleSize,
                handleSize
              );
              ctx.strokeRect(
                handleX - handleSize / 2,
                handleY - handleSize / 2,
                handleSize,
                handleSize
              );
            });
          }
          break;
        }
        case 'line': {
          if (typeof shape.endX !== 'number' || typeof shape.endY !== 'number') {
            console.error("Invalid line endpoints:", shape);
            return;
          }
          
          ctx.beginPath();
          ctx.moveTo(shape.x, shape.y);
          ctx.lineTo(shape.endX, shape.endY);
          ctx.stroke();
          break;
        }
        case 'polygon': {
          if (!shape.points || !Array.isArray(shape.points) || shape.points.length < 3) {
            console.error("Invalid polygon points:", shape);
            return;
          }
          
          ctx.beginPath();
          ctx.moveTo(shape.points[0].x, shape.points[0].y);
          for (let i = 1; i < shape.points.length; i++) {
            ctx.lineTo(shape.points[i].x, shape.points[i].y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          
          // Draw vertices when selected
          if (isSelected) {
            const handleSize = 6;
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#3b82f6';
            
            shape.points.forEach(point => {
              ctx.fillRect(
                point.x - handleSize / 2,
                point.y - handleSize / 2,
                handleSize,
                handleSize
              );
              ctx.strokeRect(
                point.x - handleSize / 2,
                point.y - handleSize / 2,
                handleSize,
                handleSize
              );
            });
          }
          break;
        }
        case 'text': {
          if (!shape.content || typeof shape.fontSize !== 'number') {
            console.error("Invalid text properties:", shape);
            return;
          }
          
          ctx.font = `${shape.fontSize}px Arial`;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.textAlign = shape.textAlign || 'left';
          
          // Draw text according to alignment
          let textX = shape.x;
          if (ctx.textAlign === 'center') {
            // Nothing needed, textAlign handles it
          } else if (ctx.textAlign === 'right') {
            // Nothing needed, textAlign handles it
          }
          
          ctx.fillText(shape.content, textX, shape.y);
          
          // Calculate bounding box based on text alignment
          const metrics = ctx.measureText(shape.content);
          const height = shape.fontSize;
          let boxX = shape.x;
          
          if (shape.textAlign === 'center') {
            boxX -= metrics.width / 2;
          } else if (shape.textAlign === 'right') {
            boxX -= metrics.width;
          }
          
          if (isSelected || isHovered) {
            ctx.strokeStyle = isSelected ? '#3b82f6' : '#10b981';
            ctx.strokeRect(
              boxX - 2,
              shape.y - height - 2,
              metrics.width + 4,
              height + 4
            );
          }
          break;
        }
        default:
          console.error("Unknown shape type:", shape.type);
      }
      
      // Only show name label for shapes except for line and text
      if (shape.type !== 'text' && shape.type !== 'line') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(shape.name, shape.x + 5, shape.y + 15);
      }
    } catch (err) {
      console.error("Error drawing shape:", err, shape);
    }
  };

  // Draw scale bar
  const drawScaleBar = (ctx: CanvasRenderingContext2D) => {
    const scaleBarLength = layout?.unit === 'meters' ? 100 : 1000; // 1m or 100cm
    const segments = 5;
    const segmentLength = scaleBarLength / segments;
    
    const startX = 20;
    const startY = canvasHeight - 30;
    
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // Draw segments
    for (let i = 0; i <= segments; i++) {
      const x = startX + (i * segmentLength);
      
      // Draw tick
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY + 10);
      ctx.stroke();
      
      // Draw label
      const value = i * (layout?.unit === 'meters' ? 1 : 20);
      ctx.fillText(value.toString(), x, startY + 25);
    }
    
    // Draw horizontal line
    ctx.beginPath();
    ctx.moveTo(startX, startY + 5);
    ctx.lineTo(startX + scaleBarLength, startY + 5);
    ctx.stroke();
    
    // Draw unit label
    ctx.fillText(layout?.unit || 'meters', startX + scaleBarLength + 30, startY + 25);
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      ctx.save();
      ctx.scale(scale, scale);
      
      // Clear canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      
      // Draw grid
      ctx.strokeStyle = '#e5e5e5';
      ctx.lineWidth = 0.5;
      
      const gridSize = layout?.unit === 'meters' ? 100 : 10; // 1m = 100px or 1cm = 10px
      for (let x = 0; x < canvasWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
      
      for (let y = 0; y < canvasHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }
      
      // Draw scale bar
      drawScaleBar(ctx);
      
      // Draw all areas
      if (Array.isArray(layout?.areas)) {
        layout.areas.forEach(area => {
          if (area && typeof area === 'object') {
            drawShape(ctx, area, area.id === hoveredArea?.id);
          }
        });
      }
      
      // Draw polygon in progress
      if (isCreatingPolygon && polygonPoints.length > 0) {
        ctx.strokeStyle = '#2d5f35';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        
        ctx.beginPath();
        ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
        
        // Draw lines between all existing points
        for (let i = 1; i < polygonPoints.length; i++) {
          ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
        }
        
        // Draw line to current mouse position if not closing the polygon
        if (endPoint.x !== 0 || endPoint.y !== 0) {
          ctx.lineTo(endPoint.x, endPoint.y);
        }
        
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#2d5f35';
        polygonPoints.forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
        
        ctx.setLineDash([]);
      }
      // Draw shape being created
      else if (isDrawing && !readOnly && selectedTool !== 'polygon') {
        ctx.strokeStyle = '#2d5f35';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        
        switch (selectedTool) {
          case 'rectangle': {
            const width = endPoint.x - startPoint.x;
            const height = endPoint.y - startPoint.y;
            ctx.strokeRect(startPoint.x, startPoint.y, width, height);
            break;
          }
          case 'circle': {
            const radius = Math.sqrt(
              Math.pow(endPoint.x - startPoint.x, 2) + 
              Math.pow(endPoint.y - startPoint.y, 2)
            );
            ctx.beginPath();
            ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2);
            ctx.stroke();
            break;
          }
          case 'line': {
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(endPoint.x, endPoint.y);
            ctx.stroke();
            break;
          }
        }
        
        ctx.setLineDash([]);
      }
      
      ctx.restore();
    } catch (err) {
      console.error("Error rendering canvas:", err);
      setCanvasError(`Canvas rendering error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [layout, selectedArea, isDrawing, startPoint, endPoint, scale, readOnly, selectedTool, hoveredArea, canvasWidth, canvasHeight, isCreatingPolygon, polygonPoints]);
  
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly || canvasError) return;
    
    e.preventDefault();
    const pos = getMousePosition(e);
    
    // Handle polygon creation mode
    if (selectedTool === 'polygon') {
      if (!isCreatingPolygon) {
        setIsCreatingPolygon(true);
        setPolygonPoints([pos]);
        setEndPoint(pos);
      } else {
        // Check if close to the first point to complete the polygon
        const firstPoint = polygonPoints[0];
        const distance = Math.sqrt(
          Math.pow(pos.x - firstPoint.x, 2) + 
          Math.pow(pos.y - firstPoint.y, 2)
        );
        
        if (polygonPoints.length > 2 && distance < 20) {
          // Complete polygon
          const newPolygon = {
            type: 'polygon' as ShapeType,
            x: polygonPoints[0].x,
            y: polygonPoints[0].y,
            points: [...polygonPoints],
            name: `Polygon ${Array.isArray(layout?.areas) ? (layout.areas.length + 1) : 1}`
          };
          
          addArea(newPolygon);
          setPolygonPoints([]);
          setIsCreatingPolygon(false);
          setEndPoint({ x: 0, y: 0 });
        } else {
          // Add point to polygon
          setPolygonPoints([...polygonPoints, pos]);
        }
      }
      return;
    }
    
    // Handle text tool - but don't edit immediately
    if (selectedTool === 'text') {
      setTextInputPosition(pos);
      setTextInput('');
      setShowTextForm(true);
      if (onAreaSelected) onAreaSelected(null);
      return;
    }
    
    // Check for resize handles first
    if (selectedArea) {
      if (selectedArea.type === 'rectangle') {
        const handles = [
          { handle: 'nw' as const, x: selectedArea.x, y: selectedArea.y },
          { handle: 'ne' as const, x: selectedArea.x + selectedArea.width, y: selectedArea.y },
          { handle: 'sw' as const, x: selectedArea.x, y: selectedArea.y + selectedArea.height },
          { handle: 'se' as const, x: selectedArea.x + selectedArea.width, y: selectedArea.y + selectedArea.height }
        ];

        for (const { handle, x, y } of handles) {
          if (Math.abs(pos.x - x) < 10 && Math.abs(pos.y - y) < 10) {
            setIsResizing(true);
            setResizeHandle(handle);
            setStartPoint({ x, y });
            return;
          }
        }
      } else if (selectedArea.type === 'circle') {
        const angles = [
          { handle: 'se' as const, angle: 45 },
          { handle: 'sw' as const, angle: 135 },
          { handle: 'nw' as const, angle: 225 },
          { handle: 'ne' as const, angle: 315 }
        ];

        for (const { handle, angle } of angles) {
          const handleX = selectedArea.x + selectedArea.radius * Math.cos(angle * Math.PI / 180);
          const handleY = selectedArea.y + selectedArea.radius * Math.sin(angle * Math.PI / 180);
          
          if (Math.abs(pos.x - handleX) < 10 && Math.abs(pos.y - handleY) < 10) {
            setIsResizing(true);
            setResizeHandle(handle);
            setStartPoint({ x: handleX, y: handleY });
            return;
          }
        }
      } else if (selectedArea.type === 'polygon') {
        // Check if clicking on a polygon vertex
        const vertexIndex = isPointNearPolygonVertex(pos, selectedArea);
        if (vertexIndex >= 0) {
          setSelectedPolygonPoint(vertexIndex);
          setIsDragging(true);
          setStartPoint(pos);
          return;
        }
      }
    }

    if (!Array.isArray(layout?.areas)) {
      console.error("Invalid layout areas:", layout?.areas);
      return;
    }

    const clickedArea = layout.areas.find(area => {
      if (!area) return false;
      
      switch (area.type) {
        case 'rectangle':
          return (
            pos.x >= area.x && 
            pos.x <= area.x + area.width && 
            pos.y >= area.y && 
            pos.y <= area.y + area.height
          );
        case 'circle':
          const distance = Math.sqrt(
            Math.pow(pos.x - area.x, 2) + 
            Math.pow(pos.y - area.y, 2)
          );
          return distance <= area.radius;
        case 'line':
          const threshold = 5;
          const lineLength = Math.sqrt(
            Math.pow(area.endX - area.x, 2) + 
            Math.pow(area.endY - area.y, 2)
          );
          const d1 = Math.sqrt(
            Math.pow(pos.x - area.x, 2) + 
            Math.pow(pos.y - area.y, 2)
          );
          const d2 = Math.sqrt(
            Math.pow(pos.x - area.endX, 2) + 
            Math.pow(pos.y - area.endY, 2)
          );
          return Math.abs(d1 + d2 - lineLength) < threshold;
        case 'polygon':
          return isPointInPolygon(pos, area);
        case 'text':
          return isPointInTextBox(pos, area);
        default:
          return false;
      }
    });
    
    if (clickedArea) {
      if (onAreaSelected) onAreaSelected(clickedArea);
      
      if (!readOnly) {
        setIsDragging(true);
        setDragOffset({ 
          x: pos.x - clickedArea.x, 
          y: pos.y - clickedArea.y 
        });
      }
    } else {
      if (onAreaSelected) onAreaSelected(null);
      setShowTextForm(false);
      
      if (!readOnly && selectedTool !== 'text' && selectedTool !== 'polygon') {
        setIsDrawing(true);
        setStartPoint(pos);
        setEndPoint(pos);
      }
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly || canvasError) return;
    
    e.preventDefault();
    const pos = getMousePosition(e);
    
    // Update cursor based on hovered area
    const canvas = e.currentTarget;
    const hoveredShape = layout?.areas?.find(area => {
      if (!area) return false;
      
      switch (area.type) {
        case 'rectangle':
          return (
            pos.x >= area.x && 
            pos.x <= area.x + area.width && 
            pos.y >= area.y && 
            pos.y <= area.y + area.height
          );
        case 'circle':
          const distance = Math.sqrt(
            Math.pow(pos.x - area.x, 2) + 
            Math.pow(pos.y - area.y, 2)
          );
          return distance <= area.radius;
        case 'line':
          const threshold = 5;
          const lineLength = Math.sqrt(
            Math.pow(area.endX - area.x, 2) + 
            Math.pow(area.endY - area.y, 2)
          );
          const d1 = Math.sqrt(
            Math.pow(pos.x - area.x, 2) + 
            Math.pow(pos.y - area.y, 2)
          );
          const d2 = Math.sqrt(
            Math.pow(pos.x - area.endX, 2) + 
            Math.pow(pos.y - area.endY, 2)
          );
          return Math.abs(d1 + d2 - lineLength) < threshold;
        case 'polygon':
          return isPointInPolygon(pos, area);
        case 'text':
          return isPointInTextBox(pos, area);
        default:
          return false;
      }
    });
    
    setHoveredArea(hoveredShape || null);

    // Set cursor based on position
    if (selectedArea) {
      if (selectedArea.type === 'rectangle') {
        const handles = [
          { handle: 'nw', x: selectedArea.x, y: selectedArea.y, cursor: 'nw-resize' },
          { handle: 'ne', x: selectedArea.x + selectedArea.width, y: selectedArea.y, cursor: 'ne-resize' },
          { handle: 'sw', x: selectedArea.x, y: selectedArea.y + selectedArea.height, cursor: 'sw-resize' },
          { handle: 'se', x: selectedArea.x + selectedArea.width, y: selectedArea.y + selectedArea.height, cursor: 'se-resize' }
        ];

        for (const { x, y, cursor } of handles) {
          if (Math.abs(pos.x - x) < 10 && Math.abs(pos.y - y) < 10) {
            canvas.style.cursor = cursor;
            return;
          }
        }
      } else if (selectedArea.type === 'circle') {
        const angles = [
          { angle: 45, cursor: 'se-resize' },
          { angle: 135, cursor: 'sw-resize' },
          { angle: 225, cursor: 'nw-resize' },
          { angle: 315, cursor: 'ne-resize' }
        ];

        for (const { angle, cursor } of angles) {
          const handleX = selectedArea.x + selectedArea.radius * Math.cos(angle * Math.PI / 180);
          const handleY = selectedArea.y + selectedArea.radius * Math.sin(angle * Math.PI / 180);
          
          if (Math.abs(pos.x - handleX) < 10 && Math.abs(pos.y - handleY) < 10) {
            canvas.style.cursor = cursor;
            return;
          }
        }
      } else if (selectedArea.type === 'polygon') {
        // Check if hovering over a vertex
        const vertexIndex = isPointNearPolygonVertex(pos, selectedArea);
        if (vertexIndex >= 0) {
          canvas.style.cursor = 'pointer';
          return;
        }
      }
    }
    
    // Special cursor for polygon creation mode
    if (isCreatingPolygon) {
      // Check if close to first point to show "close polygon" cursor
      if (polygonPoints.length > 2) {
        const firstPoint = polygonPoints[0];
        const distance = Math.sqrt(
          Math.pow(pos.x - firstPoint.x, 2) + 
          Math.pow(pos.y - firstPoint.y, 2)
        );
        
        if (distance < 20) {
          canvas.style.cursor = 'cell';
          return;
        }
      }
      
      canvas.style.cursor = 'crosshair';
      setEndPoint(pos);
      return;
    }
    
    canvas.style.cursor = hoveredShape ? 'move' : (isDragging ? 'grabbing' : 'crosshair');
    
    if (isDrawing) {
      setEndPoint(pos);
    } else if (isDragging && selectedArea) {
      const newX = Math.max(0, Math.min(pos.x - dragOffset.x, canvasWidth));
      const newY = Math.max(0, Math.min(pos.y - dragOffset.y, canvasHeight));
      
      if (selectedArea.type === 'polygon' && selectedPolygonPoint !== null) {
        // Move just one vertex of the polygon
        const updatedPoints = [...selectedArea.points];
        updatedPoints[selectedPolygonPoint] = { x: pos.x, y: pos.y };
        
        updateArea({
          ...selectedArea,
          points: updatedPoints,
          // Also update the anchor point if the first vertex is being moved
          ...(selectedPolygonPoint === 0 ? { x: pos.x, y: pos.y } : {})
        });
      } else if (selectedArea.type === 'polygon') {
        // Move the entire polygon
        const dx = newX - selectedArea.x;
        const dy = newY - selectedArea.y;
        
        // Move all points by the same amount
        const updatedPoints = selectedArea.points.map(point => ({
          x: point.x + dx,
          y: point.y + dy
        }));
        
        updateArea({
          ...selectedArea,
          x: newX,
          y: newY,
          points: updatedPoints
        });
      } else {
        updateArea({
          ...selectedArea,
          x: newX,
          y: newY
        });
      }
    } else if (isResizing && selectedArea && resizeHandle) {
      if (selectedArea.type === 'rectangle') {
        let newX = selectedArea.x;
        let newY = selectedArea.y;
        let newWidth = selectedArea.width;
        let newHeight = selectedArea.height;

        switch (resizeHandle) {
          case 'nw':
            newX = Math.min(pos.x, selectedArea.x + selectedArea.width);
            newY = Math.min(pos.y, selectedArea.y + selectedArea.height);
            newWidth = selectedArea.x + selectedArea.width - newX;
            newHeight = selectedArea.y + selectedArea.height - newY;
            break;
          case 'ne':
            newY = Math.min(pos.y, selectedArea.y + selectedArea.height);
            newWidth = pos.x - selectedArea.x;
            newHeight = selectedArea.y + selectedArea.height - newY;
            break;
          case 'sw':
            newX = Math.min(pos.x, selectedArea.x + selectedArea.width);
            newWidth = selectedArea.x + selectedArea.width - newX;
            newHeight = pos.y - selectedArea.y;
            break;
          case 'se':
            newWidth = pos.x - selectedArea.x;
            newHeight = pos.y - selectedArea.y;
            break;
        }

        // Ensure minimum size
        if (newWidth >= 10 && newHeight >= 10) {
          updateArea({
            ...selectedArea,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight
          });
        }
      } else if (selectedArea.type === 'circle') {
        const dx = pos.x - selectedArea.x;
        const dy = pos.y - selectedArea.y;
        const newRadius = Math.sqrt(dx * dx + dy * dy);
        
        // Ensure minimum radius
        if (newRadius >= 5) {
          updateArea({
            ...selectedArea,
            radius: newRadius
          });
        }
      }
    }
  };
  
  const handleMouseUp = () => {
    if (readOnly || canvasError) return;
    
    // Skip mouse up behavior for polygon creation
    if (isCreatingPolygon) {
      return;
    }
    
    if (isDrawing) {
      const width = Math.abs(endPoint.x - startPoint.x);
      const height = Math.abs(endPoint.y - startPoint.y);
      
      if (width > 10 || height > 10) {
        let newArea: AreaShape;
        
        switch (selectedTool) {
          case 'rectangle':
            newArea = {
              type: 'rectangle',
              x: Math.min(startPoint.x, endPoint.x),
              y: Math.min(startPoint.y, endPoint.y),
              width,
              height,
              name: `Rectangle ${Array.isArray(layout?.areas) ? (layout.areas.length + 1) : 1}`
            };
            break;
          
          case 'circle':
            const radius = Math.sqrt(
              Math.pow(endPoint.x - startPoint.x, 2) + 
              Math.pow(endPoint.y - startPoint.y, 2)
            );
            newArea = {
              type: 'circle',
              x: startPoint.x,
              y: startPoint.y,
              radius,
              name: `Circle ${Array.isArray(layout?.areas) ? (layout.areas.length + 1) : 1}`
            };
            break;
          
          case 'line':
            newArea = {
              type: 'line',
              x: startPoint.x,
              y: startPoint.y,
              endX: endPoint.x,
              endY: endPoint.y,
              name: `Line ${Array.isArray(layout?.areas) ? (layout.areas.length + 1) : 1}`
            };
            break;
          
          default:
            return;
        }
        
        addArea(newArea);
      }
      
      setIsDrawing(false);
    }
    
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setSelectedPolygonPoint(null);
  };
  
  const handleAddTextBox = () => {
    if (!textInput.trim()) return;
    
    addArea({
      type: 'text',
      x: textInputPosition.x,
      y: textInputPosition.y,
      content: textInput,
      fontSize: 16,
      textAlign,
      name: `Text ${Array.isArray(layout?.areas) ? (layout.areas.length + 1) : 1}`
    });
    
    setTextInput('');
    setShowTextForm(false);
  };
  
  const handleUpdateTextBox = () => {
    if (!selectedArea || selectedArea.type !== 'text' || !textInput.trim()) return;
    
    updateArea({
      ...selectedArea,
      content: textInput,
      textAlign
    });
    
    setTextInput('');
    setShowTextForm(false);
  };
  
  // Cancel polygon creation on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCreatingPolygon) {
        setPolygonPoints([]);
        setIsCreatingPolygon(false);
        setEndPoint({ x: 0, y: 0 });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreatingPolygon]);
  
  // Set text input when a text area is selected
  useEffect(() => {
    if (selectedArea?.type === 'text') {
      setTextInput(selectedArea.content);
      setTextAlign(selectedArea.textAlign || 'left');
    }
  }, [selectedArea]);
  
  if (canvasError) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-700">
        <div className="flex items-center mb-3">
          <AlertTriangle size={24} className="mr-2" />
          <h3 className="font-semibold">Canvas Error</h3>
        </div>
        <p>{canvasError}</p>
        {layout && (
          <div className="mt-3">
            <details className="text-sm">
              <summary className="cursor-pointer">Debug Information</summary>
              <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto max-h-40">
                {JSON.stringify(layout, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2 bg-white rounded-lg shadow p-2">
          <button
            onClick={() => {
              setSelectedTool('rectangle');
              setShowTextForm(false);
              setIsCreatingPolygon(false);
              setPolygonPoints([]);
            }}
            className={`p-2 rounded ${selectedTool === 'rectangle' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Rectangle"
          >
            <Square size={20} />
          </button>
          <button
            onClick={() => {
              setSelectedTool('circle');
              setShowTextForm(false);
              setIsCreatingPolygon(false);
              setPolygonPoints([]);
            }}
            className={`p-2 rounded ${selectedTool === 'circle' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Circle"
          >
            <Circle size={20} />
          </button>
          <button
            onClick={() => {
              setSelectedTool('line');
              setShowTextForm(false);
              setIsCreatingPolygon(false);
              setPolygonPoints([]);
            }}
            className={`p-2 rounded ${selectedTool === 'line' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Line"
          >
            <Minus size={20} />
          </button>
          <button
            onClick={() => {
              setSelectedTool('polygon');
              setShowTextForm(false);
              setIsCreatingPolygon(false);
              if (onAreaSelected) onAreaSelected(null);
            }}
            className={`p-2 rounded ${selectedTool === 'polygon' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Polygon"
          >
            <Hexagon size={20} />
          </button>
          <button
            onClick={() => {
              setSelectedTool('text');
              setIsCreatingPolygon(false);
              setPolygonPoints([]);
              if (onAreaSelected) onAreaSelected(null);
            }}
            className={`p-2 rounded ${selectedTool === 'text' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Text"
          >
            <Type size={20} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 bg-white rounded-lg shadow p-2">
          <button
            onClick={handleDeleteSelected}
            disabled={!selectedArea}
            className={`p-2 rounded ${!selectedArea ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
            title="Delete Selected Area"
          >
            <Trash2 size={20} />
          </button>
          <button
            onClick={handleClearAll}
            disabled={!layout?.areas?.length}
            className={`p-2 rounded ${!layout?.areas?.length ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
            title="Clear All Areas"
          >
            <XCircle size={20} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 bg-white rounded-lg shadow p-2 ml-auto">
          <button
            onClick={() => handleZoom(-0.1)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <span className="text-sm text-gray-600">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.1)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
        </div>
      </div>
      
      {isCreatingPolygon && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded text-sm text-yellow-700 flex items-center">
          <span className="font-semibold mr-1">Polygon mode:</span> Click to add points. Click near the first point to complete the polygon. Press ESC to cancel.
        </div>
      )}
      
      {showTextForm && (
        <div className="mb-4 p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-3">
            {selectedArea?.type === 'text' ? 'Edit Text' : 'Add Text'}
          </h3>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="textContent" className="block text-sm font-medium text-gray-700 mb-1">
                Text Content
              </label>
              <input
                id="textContent"
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="Enter text"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Alignment
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setTextAlign('left')}
                  className={`px-3 py-1.5 border ${textAlign === 'left' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-300 text-gray-700'} rounded-md`}
                >
                  Left
                </button>
                <button
                  type="button"
                  onClick={() => setTextAlign('center')}
                  className={`px-3 py-1.5 border ${textAlign === 'center' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-300 text-gray-700'} rounded-md`}
                >
                  Center
                </button>
                <button
                  type="button"
                  onClick={() => setTextAlign('right')}
                  className={`px-3 py-1.5 border ${textAlign === 'right' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-300 text-gray-700'} rounded-md`}
                >
                  Right
                </button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowTextForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={selectedArea?.type === 'text' ? handleUpdateTextBox : handleAddTextBox}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                disabled={!textInput.trim()}
              >
                {selectedArea?.type === 'text' ? 'Update' : 'Add'} Text
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="relative border border-gray-300 bg-white rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{ 
            width: `${canvasWidth * scale}px`, 
            height: `${canvasHeight * scale}px`,
            cursor: readOnly ? 'default' : (isDragging ? 'grabbing' : 'crosshair')
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="touch-none"
        ></canvas>
      </div>
    </div>
  );
};

export default LayoutCanvas;