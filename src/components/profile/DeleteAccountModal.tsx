import React, { useEffect, useState } from "react";
import { FaTimes, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { accountDeletionService } from "@/services/accountDeletionService";
import { useUserStore } from "@/store/userStore";

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

type Step = "reason" | "confirm" | "pending";

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ visible, onClose }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState<any>(null);
  const [step, setStep] = useState<Step>("reason");

  const clearUser = useUserStore((s) => s.clearUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (visible) checkDeletionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const checkDeletionStatus = async () => {
    try {
      const status = await accountDeletionService.getDeletionStatus();
      setDeletionStatus(status);
      setStep(status?.hasPendingRequest ? "pending" : "reason");
    } catch (error) {
      console.error("Error checking deletion status:", error);
    }
  };

  const handleRequestDeletion = async () => {
    if (!reason.trim()) {
      window.alert("Please provide a reason for account deletion");
      return;
    }

    try {
      setLoading(true);
      await accountDeletionService.requestDeletion(reason.trim());
      setStep("confirm");
    } catch (error: any) {
      window.alert(error?.message || "Failed to request account deletion");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeletion = async () => {
    const ok = window.confirm(
      "This action cannot be undone. All your data will be permanently deleted.\n\nAre you sure you want to proceed?"
    );
    if (!ok) return;

    try {
      setLoading(true);
      await accountDeletionService.confirmDeletion();

      window.alert("Your account has been successfully deleted. You will be logged out.");
      clearUser();
      navigate("/", { replace: true });
      onClose();
    } catch (error: any) {
      window.alert(error?.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    try {
      setLoading(true);
      await accountDeletionService.cancelDeletion();
      setStep("reason");
      setReason("");
      setDeletionStatus(null);
      window.alert("Account deletion request cancelled");
    } catch (error: any) {
      window.alert(error?.message || "Failed to cancel deletion request");
    } finally {
      setLoading(false);
    }
  };

  const closeOnOverlay = () => {
    if (!loading) onClose();
  };

  const renderHeader = (title: string) => (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-60"
        disabled={loading}
        aria-label="Close"
      >
        <FaTimes className="text-gray-500" />
      </button>
    </div>
  );

  const renderReasonStep = () => (
    <div className="p-6">
      {renderHeader("Delete Account")}

      <p className="text-center text-red-600 font-semibold mb-4">
        ⚠️ This action cannot be undone. All your data will be permanently deleted.
      </p>

      <label className="block text-gray-900 font-semibold mb-2">
        Reason for deletion (required)
      </label>
      <textarea
        className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-900 min-h-[110px] outline-none focus:ring-2 focus:ring-red-200"
        placeholder="Please tell us why you want to delete your account..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={4}
      />

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="flex-1 bg-gray-100 text-gray-600 font-semibold py-3 rounded-lg hover:bg-gray-200 disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleRequestDeletion}
          disabled={loading || !reason.trim()}
          className="flex-1 bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <>
              <FaTrash />
              <span>Request Deletion</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="p-6">
      {renderHeader("Confirm Deletion")}

      <p className="text-center text-red-600 font-semibold mb-4">
        ⚠️ Your account deletion request has been submitted.
      </p>

      <p className="text-sm text-gray-600 leading-5 mb-5">
        You can now confirm the deletion to permanently delete your account and all associated data.
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCancelDeletion}
          disabled={loading}
          className="flex-1 bg-gray-100 text-gray-600 font-semibold py-3 rounded-lg hover:bg-gray-200 disabled:opacity-60"
        >
          Cancel Request
        </button>

        <button
          type="button"
          onClick={handleConfirmDeletion}
          disabled={loading}
          className="flex-1 bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <>
              <FaTrash />
              <span>Delete Account</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderPendingStep = () => (
    <div className="p-6">
      {renderHeader("Pending Deletion")}

      <p className="text-center text-red-600 font-semibold mb-4">
        ⚠️ You have a pending account deletion request.
      </p>

      <p className="text-sm text-gray-600 leading-5 mb-2">
        Reason: <span className="text-gray-900 font-medium">{deletionStatus?.request?.reason}</span>
      </p>

      <p className="text-sm text-gray-600 leading-5 mb-5">
        Requested on:{" "}
        <span className="text-gray-900 font-medium">
          {deletionStatus?.request?.createdAt
            ? new Date(deletionStatus.request.createdAt).toLocaleDateString()
            : "-"}
        </span>
      </p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCancelDeletion}
          disabled={loading}
          className="flex-1 bg-gray-100 text-gray-600 font-semibold py-3 rounded-lg hover:bg-gray-200 disabled:opacity-60"
        >
          Cancel Request
        </button>

        <button
          type="button"
          onClick={handleConfirmDeletion}
          disabled={loading}
          className="flex-1 bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <>
              <FaTrash />
              <span>Delete Account</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[1100] bg-black/50 flex items-center justify-center p-5"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        // close only if clicking overlay
        if (e.target === e.currentTarget) closeOnOverlay();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-[400px] max-h-[80vh] overflow-y-auto shadow-xl">
        {step === "reason" && renderReasonStep()}
        {step === "confirm" && renderConfirmStep()}
        {step === "pending" && renderPendingStep()}
      </div>
    </div>
  );
};

export default DeleteAccountModal;
