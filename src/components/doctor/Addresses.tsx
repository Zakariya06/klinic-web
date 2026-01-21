import React, { useState } from "react";
import { FaCheck, FaEnvelope, FaMapMarkerAlt, FaPhone } from "react-icons/fa";

interface Clinic {
  clinicName: string;
  clinicAddress: {
    address?: string;
    city?: string;
    state?: string;
    pinCode: string;
    country?: string;
    googleMapsLink?: string;
    latitude?: number;
    longitude?: number;
  };
  clinicPhone?: string;
  clinicEmail?: string;
  clinicWebsite?: string;
}

interface AddressesProps {
  clinics: Clinic[];
  onSelectClinic?: (clinic: Clinic) => void;
  disabled?: boolean;
}

export default function Addresses({
  clinics,
  onSelectClinic,
  disabled = false,
}: AddressesProps) {
  const [selectedClinicIndex, setSelectedClinicIndex] = useState<number | null>(
    null
  );

  if (!clinics || clinics.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-center text-gray-600">
          No clinic addresses available
        </p>
      </div>
    );
  }

  const handleSelectClinic = (index: number) => {
    if (disabled) return;

    setSelectedClinicIndex(index);
    onSelectClinic?.(clinics[index]);
  };

  const openMaps = (clinic: Clinic) => {
    const link =
      clinic.clinicAddress?.googleMapsLink ||
      (clinic.clinicAddress?.latitude != null &&
      clinic.clinicAddress?.longitude != null
        ? `https://maps.google.com/?q=${clinic.clinicAddress.latitude},${clinic.clinicAddress.longitude}`
        : null);

    if (!link) return;
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <div>
      {clinics.map((clinic, index) => {
        const selected = selectedClinicIndex === index;

        const cardClass = disabled
          ? "bg-gray-100 border-gray-200"
          : selected
          ? "bg-gray-50 border-primary"
          : "bg-gray-50 border-transparent";

        const addressLine2 = [
          clinic.clinicAddress?.city,
          clinic.clinicAddress?.state,
          clinic.clinicAddress?.pinCode,
        ]
          .filter(Boolean)
          .join(", ");

        const hasMaps =
          Boolean(clinic.clinicAddress?.googleMapsLink) ||
          (clinic.clinicAddress?.latitude != null &&
            clinic.clinicAddress?.longitude != null);

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleSelectClinic(index)}
            disabled={disabled}
            className={[
              "mb-2 w-full rounded-lg border p-4 text-left",
              cardClass,
              disabled
                ? "cursor-not-allowed opacity-80"
                : "hover:border-gray-200 hover:bg-gray-50 transition",
            ].join(" ")}
            aria-disabled={disabled}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-bold text-gray-900">
                  {clinic.clinicName}
                </div>

                <div className="mt-1 text-gray-600">
                  {clinic.clinicAddress?.address || "Address not available"}
                </div>

                <div className="text-gray-600">{addressLine2}</div>

                {(clinic.clinicPhone || clinic.clinicEmail) && (
                  <div className="mt-2">
                    {clinic.clinicPhone && (
                      <div className="flex items-center">
                        <FaPhone className="h-3.5 w-3.5 text-gray-600" />
                        <span className="ml-2 text-gray-600">
                          {clinic.clinicPhone}
                        </span>
                      </div>
                    )}
                    {clinic.clinicEmail && (
                      <div className="mt-1 flex items-center">
                        <FaEnvelope className="h-3.5 w-3.5 text-gray-600" />
                        <span className="ml-2 text-gray-600">
                          {clinic.clinicEmail}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {hasMaps && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openMaps(clinic);
                    }}
                    disabled={disabled}
                    className={[
                      "mt-3 inline-flex items-center justify-center rounded-lg bg-blue-500 px-3 py-2",
                      "text-white transition hover:bg-blue-600",
                      disabled ? "cursor-not-allowed opacity-70" : "",
                    ].join(" ")}
                  >
                    <FaMapMarkerAlt className="h-3.5 w-3.5 text-white" />
                    <span className="ml-2 font-medium">Navigate</span>
                  </button>
                )}
              </div>

              {selected && (
                <div className="rounded-full bg-primary p-2">
                  <FaCheck className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
