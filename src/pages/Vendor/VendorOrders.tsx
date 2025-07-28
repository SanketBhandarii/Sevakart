"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useApp } from "../../contexts/AppContext"
import { Eye, Package, Truck, CheckCircle, Clock } from "lucide-react"
import Modal from "../../components/Common/Modal"
import { auth } from "../../utils/firebase"
import toast from "react-hot-toast"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../../utils/firebase"

const VendorOrders: React.FC = () => {
  const { orders, reorder } = useApp()
  const [activeTab, setActiveTab] = useState<"current" | "history">("current")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loadingReorder, setLoadingReorder] = useState<string | null>(null)
  const [supplierPhones, setSupplierPhones] = useState<Record<string, string>>({})
  const [supplierNames, setSupplierNames] = useState<Record<string, string>>({})

  const vendorUid = auth.currentUser?.uid
  const myOrders = orders.filter((order) => order.vendor === vendorUid)
  const currentOrders = myOrders.filter((order) => order.status !== "delivered")
  const orderHistory = myOrders.filter((order) => order.status === "delivered")

  const fetchSupplierDetails = async (supplierId: string) => {
    if (supplierPhones[supplierId] && supplierNames[supplierId]) return
    try {
      const userDoc = await getDoc(doc(db, "User", supplierId))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        const phone = userData.phone || "No phone"
        const name = userData.name || "Unknown Supplier"
        setSupplierPhones((prev) => ({ ...prev, [supplierId]: phone }))
        setSupplierNames((prev) => ({ ...prev, [supplierId]: name }))
      } else {
        setSupplierPhones((prev) => ({ ...prev, [supplierId]: "No phone" }))
        setSupplierNames((prev) => ({ ...prev, [supplierId]: "Unknown Supplier" }))
      }
    } catch (error) {
      console.error("Error fetching supplier details:", error)
      setSupplierPhones((prev) => ({ ...prev, [supplierId]: "No phone" }))
      setSupplierNames((prev) => ({ ...prev, [supplierId]: "Unknown Supplier" }))
    }
  }

  useEffect(() => {
    const allSupplierIds = new Set<string>()
    myOrders.forEach((order) => {
      order.items?.forEach((item: any) => {
        if (item.supplierId) allSupplierIds.add(item.supplierId)
      })
    })
    allSupplierIds.forEach((supplierId) => {
      fetchSupplierDetails(supplierId)
    })
  }, [myOrders])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ordered":
        return <Clock className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ordered":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "shipped":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "delivered":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const handleReorder = async (order: any) => {
    try {
      setLoadingReorder(order.id)
      await reorder(order)
      toast.success("Order reordered successfully!")
    } catch (err) {
      console.error("Reorder failed", err)
      alert("Failed to reorder. Please try again.")
    } finally {
      setLoadingReorder(null)
    }
  }

  const formatDate = (d: any): string => {
    try {
      return d?.toDate?.() instanceof Date ? d.toDate().toLocaleDateString() : new Date(d).toLocaleDateString()
    } catch {
      return "Invalid date"
    }
  }

  const getUniqueSuppliers = (items: any[]) => {
    const suppliers = new Set()
    items?.forEach((item: any) => {
      if (item.supplierId) suppliers.add(item.supplierId)
    })
    return Array.from(suppliers)
  }

  const OrderCard = ({
    order,
    showReorder = false,
  }: {
    order: any
    showReorder?: boolean
  }) => {
    const uniqueSuppliers = getUniqueSuppliers(order.items)
    return (
      <div className="glass-card p-6 w-full h-full flex flex-col justify-between">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm md:text-base break-all">Order #{order.id}</h3>
            <p className="text-sm text-gray-500">{formatDate(order.date)}</p>
          </div>
          <div
            className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-full border text-xs sm:text-sm font-medium capitalize shrink-0 w-fit self-start sm:self-center ${getStatusColor(
              order.status,
            )}`}
          >
            {getStatusIcon(order.status)}
            <span className="whitespace-nowrap">{order.status}</span>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          {uniqueSuppliers.length === 1 && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-500">Supplier Name:</span>
                <span className="font-medium text-right break-words max-w-[60%]">
                  {supplierNames[uniqueSuppliers[0] as string] || "Loading..."}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Supplier Phone:</span>
                <span className="font-medium text-right break-all max-w-[60%]">
                  {supplierPhones[uniqueSuppliers[0] as string] || "Loading..."}
                </span>
              </div>
            </>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Items:</span>
            <span className="font-medium">{order.items?.length || 0} item(s)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total:</span>
            <span className="font-bold text-purple-600">₹{order.total}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleViewDetails(order)}
            className="btn-secondary flex-1 flex items-center justify-center space-x-2"
          >
            <Eye size={16} /> <span>View Details</span>
          </button>
          {showReorder && (
            <button
              onClick={() => handleReorder(order)}
              disabled={loadingReorder === order.id}
              className={`btn-primary flex-1 ${loadingReorder === order.id ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loadingReorder === order.id ? "Reordering..." : "Reorder"}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-0">
      {/* Header Section - Responsive */}
      <div className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold">My Orders</h1>
        <p className="text-gray-500 text-sm sm:text-base">Track and manage your orders with suppliers</p>
      </div>

      {/* Tab Navigation - Responsive */}
      <div className="glass-card p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("current")}
            className={`flex-1 px-3 md:px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "current" ? "bg-purple-600 text-white" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Current Orders ({currentOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 px-3 md:px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === "history" ? "bg-purple-600 text-white" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Order History ({orderHistory.length})
          </button>
        </div>
      </div>

      {/* Orders Grid - Maintains structure for large screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {activeTab === "current" ? (
          currentOrders.length > 0 ? (
            currentOrders.map((order) => (
              <div key={order.id} className="w-full">
                <OrderCard order={order} />
              </div>
            ))
          ) : (
            <EmptyState text="No current orders" />
          )
        ) : orderHistory.length > 0 ? (
          orderHistory.map((order) => (
            <div key={order.id} className="w-full">
              <OrderCard order={order} showReorder />
            </div>
          ))
        ) : (
          <EmptyState text="No order history" />
        )}
      </div>

      {/* Modal - Enhanced responsiveness */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Order Details" size="lg">
        {selectedOrder && (
          <div className="space-y-6">
            {/* Modal Header - Responsive */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold truncate">Order #{selectedOrder.id}</h3>
                <p className="text-gray-500 text-xs sm:text-sm">Placed on {formatDate(selectedOrder.date)}</p>
              </div>
              <div
                className={`flex items-center space-x-2 px-2 sm:px-3 py-1 rounded-full border text-xs sm:text-sm font-medium capitalize shrink-0 ${getStatusColor(
                  selectedOrder.status,
                )}`}
              >
                {getStatusIcon(selectedOrder.status)}
                <span>{selectedOrder.status}</span>
              </div>
            </div>

            {/* Order Items - Responsive */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 text-sm sm:text-base">Order Items</h4>
              <div className="space-y-3">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded-lg gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{item.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">Quantity: {item.qty}</p>
                      {item.supplierId && (
                        <>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">
                            Supplier: {supplierNames[item.supplierId] || "Loading..."}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 break-all">
                            Phone: {supplierPhones[item.supplierId] || "Loading..."}
                          </p>
                        </>
                      )}
                    </div>
                    <p className="font-semibold text-sm sm:text-base text-right sm:text-left shrink-0">
                      ₹{item.price * item.qty}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Section - Responsive */}
            <div className="border-t pt-4 flex flex-col xs:flex-row xs:justify-between gap-2">
              <span className="text-base sm:text-lg font-medium">Total Amount:</span>
              <span className="text-lg sm:text-xl font-bold text-purple-600">₹{selectedOrder.total}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

const EmptyState = ({ text }: { text: string }) => (
  <div className="col-span-full text-center py-8 sm:py-12">
    <Package className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
    <p className="text-gray-500 text-sm sm:text-base">{text}</p>
  </div>
)

export default VendorOrders
