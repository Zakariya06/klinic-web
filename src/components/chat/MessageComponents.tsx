import React from "react";
import {
  FaStethoscope,
  FaHeartbeat,
  FaCalendarCheck,
  FaLeaf,
  FaLightbulb,
  FaExclamationTriangle,
  FaClock,
  FaCheckCircle,
  FaInfoCircle,
  FaFlask,
  FaPlusCircle,
  FaCalendar,
  FaUserMd,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaVideo,
  FaExclamation,
  FaListUl,
  FaCircle,
  FaEyeDropper,
} from "react-icons/fa";

// Helper function to format bullet points and structured content
const formatStructuredContent = (content: string) => {
  const lines = content
    .trim()
    .split("\n")
    .filter((line) => line.trim());

  return lines.map((line, index) => {
    const trimmedLine = line.trim();

    // Check for numbered lists (1. 2. etc.)
    if (trimmedLine.match(/^\d+\.\s+/)) {
      const numberMatch = trimmedLine.match(/^(\d+)\.\s+(.+)/);
      if (numberMatch) {
        const [, number, bulletContent] = numberMatch;
        return (
          <div key={index} className="flex mb-2.5 items-start">
            <div className="min-w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
              <span className="text-white text-xs font-bold">{number}</span>
            </div>
            <p className="text-gray-700 text-base leading-6 flex-1">
              {bulletContent}
            </p>
          </div>
        );
      }
    }

    // Check for bullet points (• or * or -)
    if (trimmedLine.match(/^[•\*\-]\s+/)) {
      const bulletContent = trimmedLine.replace(/^[•\*\-]\s+/, "");
      return (
        <div key={index} className="flex mb-2.5 items-start">
          <FaCircle className="w-2 h-2 text-purple-500 mt-2 mr-3 shrink-0" />
          <p className="text-gray-700 text-base leading-6 flex-1">
            {bulletContent}
          </p>
        </div>
      );
    }

    // Check for section headers (lines ending with :)
    if (trimmedLine.endsWith(":") && trimmedLine.length > 3) {
      return (
        <p
          key={index}
          className="text-gray-800 text-base leading-6 font-semibold mb-2 mt-2"
        >
          {trimmedLine}
        </p>
      );
    }

    // Regular text
    return (
      <p key={index} className="text-gray-700 text-base leading-6 mb-2">
        {trimmedLine}
      </p>
    );
  });
};

interface MedicalAssessmentProps {
  content: string;
}

export const MedicalAssessment: React.FC<MedicalAssessmentProps> = ({
  content,
}) => (
  <div className="bg-blue-50 border-l-4 border-blue-500 p-5 mb-3.5 rounded-2xl border-tl rounded-tl shadow-sm">
    <div className="flex items-center mb-3.5">
      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center mr-3">
        <FaStethoscope size={18} className="text-blue-500" />
      </div>
      <p className="font-semibold text-blue-900 text-lg flex-1">
        Medical Assessment
      </p>
    </div>
    <div className="pl-2">{formatStructuredContent(content)}</div>
  </div>
);

interface RecommendationProps {
  type: string;
  content: string;
}

export const RecommendationCard: React.FC<RecommendationProps> = ({
  type,
  content,
}) => {
  const getRecommendationStyle = (type: string) => {
    switch (type) {
      case "immediate":
        return {
          backgroundColor: "bg-pink-50",
          borderColor: "border-pink-400",
          icon: FaHeartbeat,
          iconColor: "text-pink-500",
          textColor: "text-pink-900",
          iconBg: "bg-pink-100",
        };
      case "followup":
        return {
          backgroundColor: "bg-blue-50",
          borderColor: "border-blue-500",
          icon: FaCalendarCheck,
          iconColor: "text-blue-500",
          textColor: "text-blue-900",
          iconBg: "bg-blue-100",
        };
      case "lifestyle":
        return {
          backgroundColor: "bg-green-50",
          borderColor: "border-green-500",
          icon: FaLeaf,
          iconColor: "text-green-500",
          textColor: "text-green-900",
          iconBg: "bg-green-100",
        };
      default:
        return {
          backgroundColor: "bg-gray-50",
          borderColor: "border-purple-500",
          icon: FaLightbulb,
          iconColor: "text-purple-500",
          textColor: "text-purple-900",
          iconBg: "bg-purple-100",
        };
    }
  };

  const style = getRecommendationStyle(type);
  const IconComponent = style.icon;

  return (
    <div
      className={`${style.backgroundColor} border-l-4 ${style.borderColor} p-5 mb-3.5 rounded-2xl border-tl rounded-tl shadow-sm`}
    >
      <div className="flex items-center mb-3.5">
        <div
          className={`w-9 h-9 ${style.iconBg} rounded-full flex items-center justify-center mr-3`}
        >
          <IconComponent size={18} className={style.iconColor} />
        </div>
        <p
          className={`font-semibold ${style.textColor} text-lg capitalize flex-1`}
        >
          {type} Recommendation
        </p>
      </div>
      <div className="pl-2">{formatStructuredContent(content)}</div>
    </div>
  );
};

interface TestCardProps {
  name: string;
  priority: string;
  reason?: string;
  content: string;
}

export const TestCard: React.FC<TestCardProps> = ({
  name,
  priority,
  reason,
  content,
}) => {
  const getPriorityConfig = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return {
          backgroundColor: "bg-red-500",
          borderColor: "border-red-600",
          textColor: "text-white",
          icon: FaExclamationTriangle,
          iconColor: "text-white",
          glowColor: "shadow-red-500/30",
          label: "HIGH PRIORITY",
          urgencyText: "Urgent",
        };
      case "medium":
        return {
          backgroundColor: "bg-yellow-500",
          borderColor: "border-yellow-600",
          textColor: "text-white",
          icon: FaClock,
          iconColor: "text-white",
          glowColor: "shadow-yellow-500/30",
          label: "MEDIUM PRIORITY",
          urgencyText: "Moderate",
        };
      case "low":
        return {
          backgroundColor: "bg-green-500",
          borderColor: "border-green-600",
          textColor: "text-white",
          icon: FaCheckCircle,
          iconColor: "text-white",
          glowColor: "shadow-green-500/30",
          label: "LOW PRIORITY",
          urgencyText: "Routine",
        };
      default:
        return {
          backgroundColor: "bg-gray-500",
          borderColor: "border-gray-600",
          textColor: "text-white",
          icon: FaInfoCircle,
          iconColor: "text-white",
          glowColor: "shadow-gray-500/30",
          label: "PRIORITY",
          urgencyText: "Standard",
        };
    }
  };

  const priorityConfig = getPriorityConfig(priority);

  return (
    <div className="bg-purple-50 border border-purple-200 p-5 mb-3.5 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center flex-1">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <FaFlask size={16} className="text-purple-500" />
          </div>
          <p className="ml-3 font-bold text-purple-900 text-base flex-1">
            {name}
          </p>
        </div>
        <div
          className={`${priorityConfig.backgroundColor} border ${priorityConfig.borderColor} px-2 py-1.5 rounded-full flex items-center ${priorityConfig.glowColor} shadow-sm`}
        >
          <priorityConfig.icon
            size={12}
            className={`${priorityConfig.iconColor} mr-1.5`}
          />
          <span
            className={`${priorityConfig.textColor} text-xs font-bold uppercase tracking-wide`}
          >
            {priorityConfig.label}
          </span>
        </div>
      </div>

      {reason && (
        <div className="bg-purple-100 p-3 rounded-xl mb-3">
          <p className="text-purple-800 font-semibold text-sm mb-1">
            Reason for Testing:
          </p>
          <p className="text-purple-600 text-sm leading-5">{reason}</p>
        </div>
      )}

      <div className="pl-2">{formatStructuredContent(content)}</div>
    </div>
  );
};

interface MedicationCardProps {
  name: string;
  dosage?: string;
  duration?: string;
  priority?: string;
  content: string;
}

export const MedicationCard: React.FC<MedicationCardProps> = ({
  name,
  dosage,
  duration,
  priority,
  content,
}) => {
  const getPriorityConfig = (priority?: string) => {
    if (!priority) return null;

    switch (priority?.toLowerCase()) {
      case "high":
        return {
          backgroundColor: "bg-red-500",
          borderColor: "border-red-600",
          textColor: "text-white",
          icon: FaExclamationTriangle,
          iconColor: "text-white",
          label: "URGENT",
          urgencyText: "Start Immediately",
        };
      case "medium":
        return {
          backgroundColor: "bg-yellow-500",
          borderColor: "border-yellow-600",
          textColor: "text-white",
          icon: FaClock,
          iconColor: "text-white",
          label: "MODERATE",
          urgencyText: "Start Soon",
        };
      case "low":
        return {
          backgroundColor: "bg-green-500",
          borderColor: "border-green-600",
          textColor: "text-white",
          icon: FaCheckCircle,
          iconColor: "text-white",
          label: "ROUTINE",
          urgencyText: "When Convenient",
        };
      default:
        return null;
    }
  };

  const priorityConfig = getPriorityConfig(priority);

  return (
    <div className="bg-green-50 border border-green-200 p-5 mb-3.5 rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center flex-1">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <FaPlusCircle size={16} className="text-green-500" />
          </div>
          <p className="ml-3 font-bold text-green-900 text-base flex-1">
            {name}
          </p>
        </div>
        {priorityConfig && (
          <div
            className={`${priorityConfig.backgroundColor} border ${priorityConfig.borderColor} px-2 py-1 rounded-full flex items-center`}
          >
            <priorityConfig.icon
              size={10}
              className={`${priorityConfig.iconColor} mr-1`}
            />
            <span
              className={`${priorityConfig.textColor} text-xs font-bold uppercase`}
            >
              {priorityConfig.label}
            </span>
          </div>
        )}
      </div>

      <div className="bg-green-100 p-3 rounded-xl mb-3">
        {dosage && (
          <div className="flex items-center mb-2">
            <FaEyeDropper size={12} className="text-green-600" />
            <p className="ml-2 text-green-800 font-semibold text-sm">
              Dosage: {dosage}
            </p>
          </div>
        )}
        {duration && (
          <div className="flex items-center">
            <FaCalendar size={12} className="text-green-600" />
            <p className="ml-2 text-green-800 font-semibold text-sm">
              Duration: {duration}
            </p>
          </div>
        )}
      </div>

      <div className="pl-2">{formatStructuredContent(content)}</div>
    </div>
  );
};

interface DoctorRecommendationCardProps {
  name: string;
  specialization: string;
  city: string;
  fee?: string;
  type?: string;
  priority?: string;
  reason?: string;
  content: string;
}

export const DoctorRecommendationCard: React.FC<
  DoctorRecommendationCardProps
> = ({ name, specialization, city, fee, type, priority, reason, content }) => {
  const getPriorityConfig = (priority?: string) => {
    if (!priority) return null;

    switch (priority?.toLowerCase()) {
      case "high":
        return {
          backgroundColor: "bg-red-500",
          borderColor: "border-red-600",
          textColor: "text-white",
          icon: FaExclamationTriangle,
          iconColor: "text-white",
          label: "URGENT",
          urgencyText: "Book Today",
        };
      case "medium":
        return {
          backgroundColor: "bg-yellow-500",
          borderColor: "border-yellow-600",
          textColor: "text-white",
          icon: FaClock,
          iconColor: "text-white",
          label: "RECOMMENDED",
          urgencyText: "Book Soon",
        };
      case "low":
        return {
          backgroundColor: "bg-green-500",
          borderColor: "border-green-600",
          textColor: "text-white",
          icon: FaCheckCircle,
          iconColor: "text-white",
          label: "OPTIONAL",
          urgencyText: "When Convenient",
        };
      default:
        return null;
    }
  };

  const priorityConfig = getPriorityConfig(priority);

  return (
    <div className="bg-blue-50 border border-blue-200 p-5 mb-3.5 rounded-2xl shadow-sm w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center flex-1">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <FaUserMd size={16} className="text-blue-600" />
          </div>
          <div className="ml-3 flex-1">
            <p className="font-bold text-blue-900 text-base">{name}</p>
            <p className="text-blue-700 text-sm mt-0.5">{specialization}</p>
          </div>
        </div>
        {priorityConfig && (
          <div
            className={`${priorityConfig.backgroundColor} border ${priorityConfig.borderColor} px-2 py-1 rounded-full flex items-center`}
          >
            <priorityConfig.icon
              size={10}
              className={`${priorityConfig.iconColor} mr-1`}
            />
            <span
              className={`${priorityConfig.textColor} text-xs font-bold uppercase`}
            >
              {priorityConfig.label}
            </span>
          </div>
        )}
      </div>

      <div className="bg-blue-100 p-3 rounded-xl mb-3">
        <div className="flex items-center mb-2">
          <FaMapMarkerAlt size={12} className="text-blue-700" />
          <p className="ml-2 text-blue-900 font-semibold text-sm">{city}</p>
          {fee && (
            <>
              <span className="mx-2 text-gray-500">•</span>
              <FaRupeeSign size={12} className="text-blue-700" />
              <p className="ml-1 text-blue-900 font-semibold text-sm">{fee}</p>
            </>
          )}
        </div>
        {type && (
          <div className="flex items-center">
            <FaVideo size={12} className="text-blue-700" />
            <p className="ml-2 text-blue-900 font-medium text-xs capitalize">
              {type} Consultation
            </p>
          </div>
        )}
      </div>

      {reason && (
        <div className="bg-blue-100 p-3 rounded-xl mb-3">
          <p className="text-blue-900 font-semibold text-sm mb-1">
            Why this doctor:
          </p>
          <p className="text-blue-700 text-sm leading-5">{reason}</p>
        </div>
      )}

      <div className="pl-2">{formatStructuredContent(content)}</div>
    </div>
  );
};

interface WarningsCardProps {
  content: string;
}

export const WarningsCard: React.FC<WarningsCardProps> = ({ content }) => (
  <div className="bg-red-50 border border-red-300 p-5 mb-4 rounded-2xl shadow-sm w-full">
    <div className="flex items-center mb-3">
      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
        <FaExclamationTriangle size={16} className="text-red-500" />
      </div>
      <p className="ml-3 font-bold text-red-900 text-lg">
        ⚠️ Important Warnings
      </p>
    </div>
    <div className="pl-2">{formatStructuredContent(content)}</div>
  </div>
);

interface NextStepsCardProps {
  content: string;
}

export const NextStepsCard: React.FC<NextStepsCardProps> = ({ content }) => (
  <div className="bg-gray-50 border-l-4 border-purple-500 p-5 mb-4 rounded-2xl border-tl rounded-tl shadow-sm">
    <div className="flex items-center mb-4">
      <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center mr-3">
        <FaListUl size={18} className="text-purple-500" />
      </div>
      <p className="font-semibold text-purple-900 text-lg flex-1">Next Steps</p>
    </div>
    <div className="pl-2">{formatStructuredContent(content)}</div>
  </div>
);

interface PlainTextProps {
  content: string;
}

export const PlainText: React.FC<PlainTextProps> = ({ content }) => (
  <div className="mb-3 w-full">{formatStructuredContent(content)}</div>
);
