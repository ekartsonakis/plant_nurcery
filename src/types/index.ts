export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  approved: boolean;
  name?: string;
  avatar_url?: string;
}

export type ShapeType = 'rectangle' | 'circle' | 'line' | 'text' | 'polygon';
export type MeasurementUnit = 'meters' | 'centimeters';

export interface BaseShape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  name: string;
  quantity?: number;
  plantedDate?: string;
}

export interface RectangleShape extends BaseShape {
  type: 'rectangle';
  width: number;
  height: number;
}

export interface CircleShape extends BaseShape {
  type: 'circle';
  radius: number;
}

export interface LineShape extends BaseShape {
  type: 'line';
  endX: number;
  endY: number;
}

export interface TextShape extends BaseShape {
  type: 'text';
  content: string;
  fontSize: number;
  textAlign?: 'left' | 'center' | 'right';
}

export interface PolygonShape extends BaseShape {
  type: 'polygon';
  points: Array<{x: number, y: number}>;
}

export type AreaShape = RectangleShape | CircleShape | LineShape | TextShape | PolygonShape;

export interface NurseryLayout {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: MeasurementUnit;
  userId: string;
  lastModified: Date;
  areas: AreaShape[];
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
}

export interface Reminder {
  id: string;
  areaId: string;
  title: string;
  description?: string;
  dueDate: string;
  time: string;
  sent: boolean;
  email: string;
}

export interface PlantInfo {
  id: string;
  areaId: string;
  plantingDate: Date;
  quantity: number;
  species: string;
  notes: string;
  customFields: {
    [key: string]: string | number | Date;
  };
}