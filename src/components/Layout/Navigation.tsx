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
    <>
      {links.map((link) => {
        const Icon = link.icon
        const isActive = location.pathname === link.path
        return (
          <Link
            key={link.path}
            to={link.path}
            onClick={onLinkClick}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive ? "bg-primary-purple text-white" : "text-text-gray hover:bg-gray-100 hover:text-text-dark"
            } ${mobile ? "w-full" : ""}`}
          >
            <Icon size={20} />
            <span className="font-medium">{link.label}</span>
          </Link>
        )
      })}
      <button
        onClick={() => {
          handleLogout()
          onLinkClick()
        }}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-red-600 hover:bg-red-50 hover:text-red-700 ${
          mobile ? "w-full" : ""
        }`}
      >
        <LogOut size={20} />
        <span className="font-medium">Logout</span>
      </button>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50">
        <div className="flex-1 flex flex-col min-h-0 glass-card m-4 mr-0 rounded-r-none">
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-primary-purple" />
              <span className="text-xl font-bold text-text-dark">SevaKart</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
            <div className="flex items-center px-4 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary-purple flex items-center justify-center">
                <span className="text-white font-semibold">{currentUser?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-text-dark">{currentUser?.name}</p>
                <p className="text-xs text-text-gray capitalize">{currentUser?.role}</p>
              </div>
            </div>
            <nav className="mt-5 flex-1 px-4 space-y-2">
              <NavLinks />
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden w-full">
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center space-x-2">
            <Store className="h-6 w-6 text-primary-purple" />
            <span className="text-lg font-bold text-text-dark">SevaKart</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary-purple flex items-center justify-center">
            <span className="text-white text-sm font-semibold">{currentUser?.name?.charAt(0).toUpperCase()}</span>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className={`fixed inset-0 bg-black transition-opacity duration-300 ${
              isMobileMenuOpen ? "bg-opacity-50" : "bg-opacity-0"
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div
            className={`relative flex flex-col w-80 max-w-[85vw] bg-white h-full shadow-xl transform transition-transform duration-300 ease-out ${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Store className="h-8 w-8 text-primary-purple" />
                <span className="text-xl font-bold text-text-dark">SevaKart</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary-purple flex items-center justify-center">
                  <span className="text-white font-semibold">{currentUser?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-text-dark">{currentUser?.name}</p>
                  <p className="text-xs text-text-gray capitalize">{currentUser?.role}</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <nav className="px-4 space-y-2">
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
