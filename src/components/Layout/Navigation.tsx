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

  const links =
    currentUser?.role === "vendor"
      ? [
          { path: "/vendor/dashboard", label: "Dashboard", icon: Home },
          { path: "/vendor/shop", label: "Shop", icon: ShoppingCart },
          { path: "/vendor/orders", label: "My Orders", icon: Clipboard },
          { path: "/vendor/inventory", label: "Inventory", icon: Package },
          { path: "/vendor/profile", label: "Profile", icon: User },
        ]
      : [
          { path: "/supplier/dashboard", label: "Dashboard", icon: Home },
          { path: "/supplier/orders", label: "Orders", icon: Clipboard },
          { path: "/supplier/products", label: "Products", icon: Package },
          { path: "/supplier/customers", label: "Customers", icon: Users },
          { path: "/supplier/profile", label: "Profile", icon: User },
        ]

  return (
    <>
      <div className="hidden lg:block fixed left-6 top-6 bottom-6 w-64 z-50">
        <div className="h-full bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-6 bg-purple-50 border-b border-purple-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-primary-purple rounded-2xl flex items-center justify-center shadow-lg">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">SevaKart</span>
                {/* Remove this entire div - the green dot on avatar is enough */}
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-purple-100 shadow-sm">
              <div className="relative">
                <div className="w-10 h-10 bg-primary-purple rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">{currentUser?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4">
            <nav className="space-y-2">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-primary-purple text-white shadow-lg"
                        : "text-gray-700 hover:bg-purple-50 hover:text-primary-purple"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-500 group-hover:text-primary-purple"}`}
                    />
                    <span className="font-medium">{link.label}</span>
                    {isActive && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => {
                logout()
                navigate("/login")
              }}
              className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        <div className="bg-white shadow-sm border-b px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-3 rounded-xl bg-purple-50 text-gray-700 border border-purple-100 shadow-sm hover:bg-purple-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-purple rounded-xl flex items-center justify-center">
                <Store className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">SevaKart</span>
            </div>
            <div className="relative">
              <div className="w-9 h-9 bg-primary-purple rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">{currentUser?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
          </div>
        </div>

        <div
          className={`fixed inset-0 z-50 transition-all duration-300 ${
            isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div
            className={`relative w-80 max-w-[90vw] h-full bg-white shadow-2xl transform transition-transform duration-300 ${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="p-6 bg-purple-50 border-b border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-purple rounded-2xl flex items-center justify-center">
                    <Store className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-gray-900">SevaKart</span>
                    {/* Remove this entire div as well. */}
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-white text-gray-600 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-purple-100 shadow-sm">
                <div className="relative">
                  <div className="w-12 h-12 bg-primary-purple rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{currentUser?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{currentUser?.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{currentUser?.role}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-2">
                {links.map((link) => {
                  const Icon = link.icon
                  const isActive = location.pathname === link.path
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-primary-purple text-white shadow-lg"
                          : "text-gray-700 hover:bg-purple-50 hover:text-primary-purple"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-500 group-hover:text-primary-purple"}`}
                      />
                      <span className="font-medium text-lg">{link.label}</span>
                      {isActive && <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>}
                    </Link>
                  )
                })}
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      logout()
                      navigate("/login")
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-3 w-full px-4 py-3.5 text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-lg">Logout</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navigation
