import React, { useState, useCallback } from 'react';
import {
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaCheck,
  FaTimesCircle,
  FaExclamationCircle,
  FaMapMarkerAlt,
  FaMoneyBill,
  FaTimes,
  FaSpinner
} from 'react-icons/fa';
import { Colors } from '@/constants/Colors';
import { DeliveryOrder, useDeliveryStore } from '@/store/deliveryStore';

interface DeliveryOrderCardProps {
  order: DeliveryOrder;
}

const DeliveryOrderCard: React.FC<DeliveryOrderCardProps> = ({ order }) => {
  const { acceptOrder, rejectOrder, updateDeliveryStatus } = useDeliveryStore();
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'assigned_to_delivery':
        return 'bg-amber-500';
      case 'delivery_accepted':
        return 'bg-emerald-500';
      case 'out_for_delivery':
        return 'bg-blue-500';
      case 'delivered':
        return 'bg-green-600';
      case 'delivery_rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'assigned_to_delivery':
        return FaClock;
      case 'delivery_accepted':
        return FaCheckCircle;
      case 'out_for_delivery':
        return FaTruck;
      case 'delivered':
        return FaCheck;
      case 'delivery_rejected':
        return FaTimesCircle;
      default:
        return FaClock;
    }
  }, []);

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case 'assigned_to_delivery':
        return 'NEW ORDER';
      case 'delivery_accepted':
        return 'ACCEPTED';
      case 'out_for_delivery':
        return 'IN TRANSIT';
      case 'delivered':
        return 'DELIVERED';
      case 'delivery_rejected':
        return 'REJECTED';
      default:
        return status.toUpperCase();
    }
  }, []);

  const getPriorityColor = useCallback((status: string) => {
    switch (status) {
      case 'assigned_to_delivery':
        return 'bg-amber-50';
      case 'delivery_accepted':
        return 'bg-emerald-50';
      case 'out_for_delivery':
        return 'bg-blue-50';
      case 'delivered':
        return 'bg-emerald-50';
      case 'delivery_rejected':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  }, []);

  const getPriorityTextColor = useCallback((status: string) => {
    switch (status) {
      case 'assigned_to_delivery':
        return 'text-amber-900';
      default:
        return 'text-gray-900';
    }
  }, []);

  const handleAcceptOrder = useCallback(async () => {
    console.log('🔵 Accept button pressed for order:', order._id);
    
    try {
      console.log('🟢 Testing direct API call for accept order:', order._id);
      const success = await acceptOrder(order._id);
      console.log('🟢 Accept result:', success);
      
      if (success) {
        alert(`Success: Order #${order._id.slice(-8)} accepted successfully!`);
      } else {
        alert('Error: Failed to accept order. Please try again.');
      }
    } catch (error) {
      console.error('🔴 Error accepting order:', error);
      alert('Error: Failed to accept order. Please try again.');
    }
  }, [order._id, acceptOrder]);

  const handleRejectOrder = useCallback(async () => {
    console.log('🔵 Reject button pressed for order:', order._id);
    
    try {
      console.log('🟢 Testing direct API call for reject order:', order._id);
      const success = await rejectOrder(order._id, 'Order rejected by delivery partner');
      console.log('🟢 Reject result:', success);
      
      if (success) {
        alert(`Success: Order #${order._id.slice(-8)} rejected successfully!`);
      } else {
        alert('Error: Failed to reject order. Please try again.');
      }
    } catch (error) {
      console.error('🔴 Error rejecting order:', error);
      alert('Error: Failed to reject order. Please try again.');
    }
  }, [order._id, rejectOrder]);

  const handleUpdateStatus = useCallback(async (newStatus: 'out_for_delivery' | 'delivered') => {
    console.log('🔵 Update status button pressed for order:', order._id, 'to:', newStatus);
    
    try {
      console.log('🟢 Testing direct API call for update status:', order._id, 'to:', newStatus);
      setUpdatingStatus(newStatus);
      const success = await updateDeliveryStatus(order._id, newStatus);
      console.log('🟢 Update status result:', success);
      setUpdatingStatus(null);
      
      if (success) {
        const statusText = newStatus === 'out_for_delivery' ? 'out for delivery' : 'delivered';
        alert(`Success: Order #${order._id.slice(-8)} status updated to ${statusText}!`);
      } else {
        alert('Error: Failed to update order status. Please try again.');
      }
    } catch (error) {
      console.error('🔴 Error updating order status:', error);
      setUpdatingStatus(null);
      alert('Error: Failed to update order status. Please try again.');
    }
  }, [order._id, updateDeliveryStatus]);

  const renderActionButtons = () => {
    console.log('🔄 Rendering action buttons for order:', order._id, 'status:', order.status);
    
    const StatusIcon = getStatusIcon(order.status);
    
    switch (order.status) {
      case 'assigned_to_delivery':
        return (
          <>
            <button
              onClick={handleAcceptOrder}
              className="flex items-center justify-center px-5 py-3.5 rounded-lg flex-1 min-h-12 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <FaCheck className="w-3.5 h-3.5" />
              <span className="ml-2 text-sm font-bold">Accept</span>
            </button>
            <button
              onClick={handleRejectOrder}
              className="flex items-center justify-center px-5 py-3.5 rounded-lg flex-1 min-h-12 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <FaTimes className="w-3.5 h-3.5" />
              <span className="ml-2 text-sm font-bold">Reject</span>
            </button>
          </>
        );
      case 'delivery_accepted':
        return (
          <button
            onClick={() => handleUpdateStatus('out_for_delivery')}
            disabled={updatingStatus === 'out_for_delivery'}
            className="flex items-center justify-center px-5 py-3.5 rounded-lg flex-1 min-h-12 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {updatingStatus === 'out_for_delivery' ? (
              <FaSpinner className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <FaTruck className="w-3.5 h-3.5" />
                <span className="ml-2 text-sm font-bold">Start Delivery</span>
              </>
            )}
          </button>
        );
      case 'out_for_delivery':
        return (
          <button
            onClick={() => handleUpdateStatus('delivered')}
            disabled={updatingStatus === 'delivered'}
            className="flex items-center justify-center px-5 py-3.5 rounded-lg flex-1 min-h-12 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold shadow-md transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          >
            {updatingStatus === 'delivered' ? (
              <FaSpinner className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <FaCheck className="w-3.5 h-3.5" />
                <span className="ml-2 text-sm font-bold">Mark Delivered</span>
              </>
            )}
          </button>
        );
      default:
        return null;
    }
  };

  const StatusIcon = getStatusIcon(order.status);

  return (
    <div className="bg-white rounded-xl p-4 mb-3 shadow-md border-l-4" 
         style={{ borderLeftColor: getStatusColor(order.status).replace('bg-', '').split('-')[1] ? 
           `var(--${getStatusColor(order.status).replace('bg-', '').replace('-', '-')})` : '#6B7280' }}>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex-1">
          <div className="text-base font-semibold text-gray-900">
            Order #{order._id.slice(-8)}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {formatDate(order.createdAt)}
          </div>
        </div>
        <div className={`${getStatusColor(order.status)} flex items-center px-2 py-1 rounded-full`}>
          <StatusIcon className="w-3 h-3 text-white" />
          <span className="text-xs font-semibold text-white ml-1">
            {getStatusText(order.status)}
          </span>
        </div>
      </div>

      {/* Priority Indicator */}
      {order.status === 'assigned_to_delivery' && (
        <div className={`${getPriorityColor(order.status)} flex items-center px-3 py-2 rounded-lg mb-3`}>
          <FaExclamationCircle className="w-3 h-3 text-amber-500" />
          <span className={`text-xs font-medium ml-1.5 ${getPriorityTextColor(order.status)}`}>
            New order - Action required
          </span>
        </div>
      )}

      {/* Customer Info */}
      <div className="mb-3">
        <div className="text-sm font-semibold text-gray-900">
          {order.orderedBy.name}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {order.orderedBy.phone} • {order.orderedBy.email}
        </div>
      </div>

      {/* Order Details */}
      <div className="mb-3">
        <div className="flex items-center mb-1">
          <div className="text-lg font-bold text-blue-600">
            ₹{order.totalPrice}
          </div>
          {order.cod && (
            <div className="flex items-center bg-emerald-500 px-1.5 py-0.5 rounded ml-2">
              <FaMoneyBill className="w-3 h-3 text-white" />
              <span className="text-xs font-semibold text-white ml-1">
                COD
              </span>
            </div>
          )}
        </div>
        
        {order.products && order.products.length > 0 && (
          <div className="text-xs text-gray-500">
            {order.products.length} product{order.products.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Delivery Address */}
      {order.customerAddress && (
        <div className="flex items-start mb-3 px-3 py-2 bg-slate-50 rounded-lg">
          <FaMapMarkerAlt className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
          <div className="ml-2 flex-1">
            <div className="text-xs text-gray-700 leading-tight line-clamp-2">
              {order.customerAddress}
            </div>
            {order.customerPinCode && (
              <div className="text-xs text-gray-500 font-medium mt-1">
                PIN: {order.customerPinCode}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Laboratory Info */}
      {order.laboratoryUser && (
        <div className="flex items-center mb-3">
          <span className="text-xs text-gray-500 mr-1">
            From:
          </span>
          <span className="text-xs font-medium text-gray-900">
            {order.laboratoryUser.name}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-3">
        <div className="flex gap-2.5 mb-2.5">
          {renderActionButtons()}
        </div>
        
        {/* COD Collection Reminder */}
        {order.cod && (order.status === 'out_for_delivery' || order.status === 'delivery_accepted') && (
          <div className="flex items-center px-4 py-3 bg-red-50 rounded-lg border border-red-200 shadow-sm">
            <FaMoneyBill className="w-3.5 h-3.5 text-red-500" />
            <span className="text-sm font-semibold text-red-700 ml-2">
              Collect ₹{order.totalPrice} as Cash on Delivery
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryOrderCard;