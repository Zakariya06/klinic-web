import { useState } from "react";
import apiClient from "@/api/client";

interface ProfileApiProps {
  endpoint: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface UseProfileApi {
  loading: boolean;
  error: any;
  data: any;
  setData: (data: any) => void;
  fetchData: () => Promise<any>;
  updateData: (data: any) => Promise<boolean>;
  updateDataSilent: (data: any) => Promise<boolean>;
  uploadFile: (
    fileType: string,
    fileName: string,
    file: File | string,
    isCoverImage?: boolean
  ) => Promise<string | null>;
}

const alertError = (title: string, message: string) => {
  window.alert(`${title}: ${message}`);
};

const toBlob = async (file: File | string): Promise<Blob> => {
  if (file instanceof File) return file;
  const res = await fetch(file);
  if (!res.ok) throw new Error(`Failed to fetch file (${res.status})`);
  return await res.blob();
};

const useProfileApi = ({ endpoint, onSuccess, onError }: ProfileApiProps): UseProfileApi => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<any>(null);

  const fetchData = async (): Promise<any> => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Making GET request to ${endpoint}`);
      const response = await apiClient.get(endpoint);
      console.log(`Response from ${endpoint}:`, response.data);

      setData(response.data);
      onSuccess?.(response.data);

      return response.data;
    } catch (err: any) {
      console.error(`Error fetching data from ${endpoint}:`, err);
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      }

      setError(err);
      onError?.(err);

      if (!onError && err.response?.status !== 404) {
        alertError(
          "Error",
          `Failed to load data: ${err.response?.data?.message || err.message}`
        );
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateData = async (newData: any): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Making POST request to ${endpoint} with data:`, newData);
      const response = await apiClient.post(endpoint, newData);
      console.log("Update response:", response.data);

      setData(response.data);
      onSuccess?.(response.data);

      return true;
    } catch (err: any) {
      console.error(`Error updating data for ${endpoint}:`, err);
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      }

      setError(err);
      onError?.(err);

      if (!onError) {
        alertError(
          "Error",
          `Failed to update profile: ${err.response?.data?.message || err.message}`
        );
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateDataSilent = async (newData: any): Promise<boolean> => {
    try {
      console.log(
        `Making silent POST request to ${endpoint} with data:`,
        JSON.stringify(newData, null, 2)
      );
      const response = await apiClient.post(endpoint, newData);
      console.log("Silent update response:", response.data);
      return true;
    } catch (err: any) {
      console.error(`Error in silent update for ${endpoint}:`, err);
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", JSON.stringify(err.response.data, null, 2));
      }
      return false;
    }
  };

  const uploadFile = async (
    fileType: string,
    fileName: string,
    file: File | string,
    isCoverImage: boolean = false
  ): Promise<string | null> => {
    try {
      const finalFileName = isCoverImage ? `cover_${fileName}` : fileName;

      const urlResponse = await apiClient.post("/api/v1/upload-url", {
        fileType,
        fileName: finalFileName,
      });

      const { uploadUrl, publicUrl } = urlResponse.data as {
        uploadUrl: string;
        publicUrl: string;
      };

      const blob = await toBlob(file);

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": fileType },
      });

      if (!putRes.ok) {
        throw new Error(`Upload failed (${putRes.status})`);
      }

      return publicUrl;
    } catch (err: any) {
      console.error("Error uploading file:", err);
      alertError("Error", "Failed to upload file");
      return null;
    }
  };

  return { loading, error, data, setData, fetchData, updateData, updateDataSilent, uploadFile };
};

export default useProfileApi;