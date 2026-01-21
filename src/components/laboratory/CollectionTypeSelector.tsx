import React from "react";
import { FaBuilding, FaHome } from "react-icons/fa";

type CollectionType = "lab" | "home";

interface CollectionTypeSelectorProps {
  selectedType?: CollectionType | null;
  onSelectType: (type: CollectionType) => void;
}

export default function CollectionTypeSelector({
  selectedType,
  onSelectType,
}: CollectionTypeSelectorProps) {
  const options: Array<{
    type: CollectionType;
    label: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    {
      type: "lab",
      label: "Lab Visit",
      description: "Visit the laboratory",
      icon: <FaBuilding size={20} />,
    },
    {
      type: "home",
      label: "Home Collection",
      description: "Sample collected at home",
      icon: <FaHome size={20} />,
    },
  ];

  return (
    <div>
      <h2 className="lg:text-xl text-base font-medium text-[#45464E]">
        Collection Type
      </h2>
      <div className="mb-3 text-gray-600 text-sm">
        Choose how you want your samples to be collected:
      </div>

      <div className="flex flex-wrap gap-4 mb-3">
        {options.map((option) => {
          const active = selectedType === option.type;

          return (
            <button
              key={option.type}
              type="button"
              onClick={() => onSelectType(option.type)}
              className={[
                "  flex-1 flex flex-col items-center rounded-lg border px-4 py-4 cursor-pointer duration-200 transition-all hover:bg-[#5570f1] hover:text-white",
                active
                  ? "bg-[#5570f1] text-white"
                  : "border-gray-200 bg-gray-50",
              ].join(" ")}
            >
              <div>{option.icon}</div>
              <div className={["mt-2 text-center font-medium"].join(" ")}>
                {option.label}
              </div>

              <div className={["mt-1 text-center text-xs"].join(" ")}>
                {option.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
