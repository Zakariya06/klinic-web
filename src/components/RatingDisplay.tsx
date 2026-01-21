import React, { useState, useEffect } from "react";
import apiClient from "@/api/client";
import { FaStar, FaStarHalf } from "react-icons/fa";

interface RatingDisplayProps {
  providerId: string;
  providerType: "doctor" | "lab" | "laboratoryService";
  size?: "small" | "medium" | "large";
  showBreakdown?: boolean;
}

interface RatingData {
  averageRating: number;
  totalRatings: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  providerId,
  providerType,
  size = "medium",
  showBreakdown = false,
}) => {
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (providerId && providerType) {
      fetchRating();
    }
  }, [providerId, providerType]);

  const fetchRating = async () => {
    try {
      setLoading(true);
      const url = `/api/v1/ratings/providers/${providerId}?type=${providerType}`;
      const response = await apiClient.get(url);
      setRatingData(response.data);
    } catch (error) {
      console.error("Rating API error:", error);
      setRatingData({
        averageRating: 0,
        totalRatings: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case "small":
        return { starSize: 14, textSize: "text-xs" };
      case "large":
        return { starSize: 20, textSize: "text-base" };
      default:
        return { starSize: 16, textSize: "text-sm" };
    }
  };

  const { starSize, textSize } = getSizeConfig();

  const renderStars = () => {
    const rating = ratingData?.averageRating || 0;
    const stars = [];

    if (rating === 0) {
      return Array(5)
        .fill(0)
        .map((_, i) => (
          <FaStar key={i} size={starSize} className="text-gray-300 mr-0.5" />
        ));
    }

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar
          key={`f-${i}`}
          size={starSize}
          fill="#FFD700"
          className="text-yellow-400 mr-0.5"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <FaStarHalf
          key="h"
          size={starSize}
          fill="#FFD700"
          className="text-yellow-400 mr-0.5"
        />
      );
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaStar
          key={`e-${i}`}
          size={starSize}
          className="text-gray-300 mr-0.5"
        />
      );
    }

    return stars;
  };

  const renderBreakdown = () => {
    if (!showBreakdown || !ratingData || ratingData.totalRatings === 0)
      return null;

    return (
      <div className="mt-4">
        <p className={`${textSize} font-medium text-gray-700 mb-2`}>
          Rating Breakdown
        </p>
        {([5, 4, 3, 2, 1] as const).map((star) => (
          <div key={star} className="flex items-center mb-1">
            <span className={`${textSize} text-gray-600 w-8`}>{star}★</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2 overflow-hidden">
              <div
                className="bg-yellow-400 h-full rounded-full"
                style={{
                  width: `${
                    (ratingData.breakdown[star] / ratingData.totalRatings) * 100
                  }%`,
                }}
              />
            </div>
            <span className={`${textSize} text-gray-600 w-8 text-right`}>
              {ratingData.breakdown[star]}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center">
        <FaStar size={starSize} className="text-gray-300 animate-pulse" />
        <span className={`${textSize} text-gray-500 ml-1`}>Loading...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center">
        <div className="flex items-center">{renderStars()}</div>
        {ratingData && ratingData.averageRating > 0 ? (
          <span className={`${textSize} text-gray-600 ml-1 font-medium`}>
            {ratingData.averageRating.toFixed(1)}
          </span>
        ) : (
          <span className={`${textSize} text-gray-500 ml-1`}>No ratings</span>
        )}
      </div>
      {renderBreakdown()}
    </div>
  );
};

export default RatingDisplay;
