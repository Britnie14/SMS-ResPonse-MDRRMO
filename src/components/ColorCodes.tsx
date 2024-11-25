// ColorCodes.tsx
import React from "react";

export interface ColorCodeItemProps {
  color: string;
  label: string;
  description: string;
}

const ColorCodeItem: React.FC<ColorCodeItemProps> = ({
  color,
  label,
  description,
}) => {
  return (
    <div className="flex items-start mb-4">
      <div className="w-6 h-6" style={{ backgroundColor: color }}></div>
      <div className="ml-4">
        <p className="text-lg font-bold">{label}</p>
        <p className="text-base">{description}</p>
      </div>
    </div>
  );
};

const ColorCodes: React.FC<{ onSelect: (color: string, label: string) => void }> = ({ onSelect }) => {
  const colorOptions = [
    { color: "#4CAF50", label: "Non-Emergency Incidents" }, // Green
    { color: "#FFEB3B", label: "Warnings or Potential Threats" }, // Yellow
    { color: "#2196F3", label: "Medical Emergencies" }, // Blue
    { color: "#F44336", label: "Critical or Life-Threatening Incidents" }, // Red
    { color: "#E91E63", label: "Police Assistance Button" }, // Pink (Cyan Blue changed to Pink)
    { color: "#FFFFFF", label: "Unknown Messages" }, // White for Unknown Messages
  ];

  return (
    <div>
      {colorOptions.map(({ color, label }) => (
        <div key={label} onClick={() => onSelect(color, label)} className="cursor-pointer mb-2">
          <ColorCodeItem color={color} label={label} description="" />
        </div>
      ))}
    </div>
  );
};

export default ColorCodes;
