import React, { useMemo } from "react";
import {
  FaEnvelope,
  FaExternalLinkAlt,
  FaGlobe,
  FaMap,
  FaMapMarkerAlt,
  FaPhone,
} from "react-icons/fa";

interface LaboratoryAddressProps {
  laboratory: {
    laboratoryName: string;
    laboratoryAddress?: {
      address: string;
      city: string;
      state: string;
      country: string;
      pinCode: string;
      googleMapsLink?: string;
    };
    laboratoryPhone?: string;
    laboratoryEmail?: string;
    laboratoryWebsite?: string;
    user?: {
      phone: string;
      email: string;
    };
  };
}

export default function LaboratoryAddress({
  laboratory,
}: LaboratoryAddressProps) {
  const phone = laboratory.laboratoryPhone || laboratory.user?.phone;
  const email = laboratory.laboratoryEmail || laboratory.user?.email;

  const mapsUrl = useMemo(() => {
    if (laboratory.laboratoryAddress?.googleMapsLink)
      return laboratory.laboratoryAddress.googleMapsLink;

    if (laboratory.laboratoryAddress) {
      const address = `${laboratory.laboratoryAddress.address}, ${laboratory.laboratoryAddress.city}`;
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address,
      )}`;
    }

    return null;
  }, [laboratory.laboratoryAddress]);

  const handleOpenMaps = () => {
    if (!mapsUrl) return;
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  };

  const handleCallLab = () => {
    if (!phone) return;
    window.location.href = `tel:${phone}`;
  };

  const handleEmailLab = () => {
    if (!email) return;
    window.location.href = `mailto:${email}`;
  };

  const handleOpenWebsite = () => {
    if (!laboratory.laboratoryWebsite) return;
    window.open(laboratory.laboratoryWebsite, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="mb-3 text-lg font-semibold text-gray-900">
        Laboratory Information
      </div>

      {/* Laboratory Name */}
      <div className="mb-4">
        <div className="lg:text-lg text-base font-medium text-[#45464E]">
          {laboratory.laboratoryName}
        </div>
        <div className="text-sm text-gray-600">
          Diagnostic &amp; Testing Center
        </div>
      </div>

      {/* Address */}
      {laboratory.laboratoryAddress && (
        <div className="mb-4">
          <div className="mb-3 flex items-start">
            <FaMapMarkerAlt className="mt-1 h-4 w-4 text-gray-600" />
            <div className="ml-2 min-w-0 flex-1">
              <div className="font-medium text-gray-800">Address</div>
              <div className="text-gray-600">
                {laboratory.laboratoryAddress.address}
              </div>
              <div className="text-gray-600">
                {laboratory.laboratoryAddress.city},{" "}
                {laboratory.laboratoryAddress.state} -{" "}
                {laboratory.laboratoryAddress.pinCode}
              </div>
              <div className="text-gray-600">
                {laboratory.laboratoryAddress.country}
              </div>
            </div>
          </div>

          {/* Google Maps Button */}
          <button
            type="button"
            onClick={handleOpenMaps}
            disabled={!mapsUrl}
            className={[
              "flex w-full items-center justify-center rounded-lg bg-blue-500 px-4 py-2 text-white",
              "transition hover:bg-blue-600",
              !mapsUrl ? "cursor-not-allowed opacity-70" : "",
            ].join(" ")}
          >
            <FaMap className="h-4 w-4 text-white" />
            <span className="ml-2 font-medium">Open in Google Maps</span>
          </button>
        </div>
      )}

      {/* Contact Information */}
      <div className="mb-1">
        <div className="mb-3 font-semibold text-gray-800">
          Contact Information
        </div>

        <div className="space-y-3">
          {/* Phone */}
          {phone && (
            <button
              type="button"
              onClick={handleCallLab}
              className="flex w-full items-center rounded-lg border border-green-200 bg-green-50 p-3 text-left transition hover:bg-green-100"
            >
              <FaPhone className="h-4 w-4 text-emerald-600" />
              <div className="ml-3 min-w-0 flex-1">
                <div className="font-medium text-green-800">Phone</div>
                <div className="break-words text-green-700">{phone}</div>
              </div>
              <FaExternalLinkAlt className="h-3.5 w-3.5 text-emerald-600" />
            </button>
          )}

          {/* Email */}
          {email && (
            <button
              type="button"
              onClick={handleEmailLab}
              className="flex w-full items-center rounded-lg border border-blue-200 bg-blue-50 p-3 text-left transition hover:bg-blue-100"
            >
              <FaEnvelope className="h-4 w-4 text-blue-600" />
              <div className="ml-3 min-w-0 flex-1">
                <div className="font-medium text-blue-800">Email</div>
                <div className="break-words text-blue-700">{email}</div>
              </div>
              <FaExternalLinkAlt className="h-3.5 w-3.5 text-blue-600" />
            </button>
          )}

          {/* Website */}
          {laboratory.laboratoryWebsite && (
            <button
              type="button"
              onClick={handleOpenWebsite}
              className="flex w-full items-center rounded-lg border border-purple-200 bg-purple-50 p-3 text-left transition hover:bg-purple-100"
            >
              <FaGlobe className="h-4 w-4 text-purple-600" />
              <div className="ml-3 min-w-0 flex-1">
                <div className="font-medium text-purple-800">Website</div>
                <div className="truncate text-purple-700">
                  {laboratory.laboratoryWebsite}
                </div>
              </div>
              <FaExternalLinkAlt className="h-3.5 w-3.5 text-purple-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
