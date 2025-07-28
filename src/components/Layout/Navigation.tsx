"use client"

import type React from "react"
import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Home, ShoppingCart, Package, Clipboard, Users, User, LogOut, Menu, X, Store } from "lucide-react"

const Navigation: React.FC = () => {
  const { currentUser, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const vendorLinks = [
    { path: "/vendor/dashboard", label: "Dashboard", icon: Home },
    { path: "/vendor/shop", label: "Shop", icon: ShoppingCart },
    { path: "/vendor/orders", label: "My Orders", icon: Clipboard },
    { path: "/vendor/inventory", label: "Inventory", icon: Package },
    { path: "/vendor/profile", label: "Profile", icon: User },
  ]

  const supplierLinks = [
    { path: "/supplier/dashboard", label: "Dashboard", icon: Home },
    { path: "/supplier/orders", label: "Orders", icon: Clipboard },
    { path: "/supplier/products", label: "Products", icon: Package },
    { path: "/supplier/customers", label: "Customers", icon: Users },
    { path: "/supplier/profile", label: "Profile", icon: User },
  ]

  const links = currentUser?.role === "vendor" ? vendorLinks : supplierLinks

  const NavLinks = ({ mobile = false, onLinkClick = () => {} }) => (
    <div className="space-y-1">
      {links.map((link) => {
        const Icon = link.icon
        const isActive = location.pathname === link.path
        return (
          <Link
            key={link.path}
            to={link.path}
            onClick={onLinkClick}
            className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-primary-purple text-white shadow-lg"
                : "text-gray-700 hover:bg-purple-50 hover:text-primary-purple"
            }`}
          >
            <Icon
              className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-gray-500 group-hover:text-primary-purple"}`}
            />
            {link.label}
          </Link>
        )
      })}
      <div className="pt-4 mt-4 border-t border-gray-200">
        <button
          onClick={() => {
            handleLogout()
            onLinkClick()
          }}
          className="group flex items-center w-full px-3 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-200"
        >
          <LogOut className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-700" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-50">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200 shadow-sm">
          {/* Logo Section */}
          <div className="flex items-center justify-center h-20 px-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-purple rounded-lg">
                <Store className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">SevaKart</span>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-primary-purple rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-semibold text-lg">{currentUser?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 capitalize bg-gray-200 px-2 py-1 rounded-full inline-block mt-1">
                  {currentUser?.role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
            <nav className="flex-1 px-4">
              <NavLinks />
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-primary-purple rounded-lg">
                <Store className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">SevaKart</span>
            </div>

            <div className="h-9 w-9 bg-primary-purple rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-semibold">{currentUser?.name?.charAt(0).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        <div
          className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
            isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black transition-opacity duration-300 ${
              isMobileMenuOpen ? "bg-opacity-50" : "bg-opacity-0"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Sidebar */}
          <div
            className={`relative flex flex-col w-80 max-w-[85vw] bg-white h-full shadow-2xl transform transition-transform duration-300 ease-out ${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-purple rounded-lg">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">SevaKart</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile User Profile */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-primary-purple rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-lg">{currentUser?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{currentUser?.name}</p>
                  <p className="text-xs text-gray-500 capitalize bg-gray-200 px-2 py-1 rounded-full inline-block mt-1">
                    {currentUser?.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 overflow-y-auto pt-6 pb-4">
              <nav className="px-4">
                <NavLinks mobile={true} onLinkClick={() => setIsMobileMenuOpen(false)} />
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navigation
