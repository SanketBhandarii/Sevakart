import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  Leaf,
  Store
} from "lucide-react"
import { Link } from "react-router-dom"
import freshVegetables from "../../assets/images/fresh_vegetables.jpg"
import dairyProducts from "../../assets/images/dairy_products.jpg"
import spicesHerbs from "../../assets/images/spices_herbs.webp"
import cerealsGrains from "../../assets/images/cereals_grains.webp"

export default function LandingPage() {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      title: "Fresh Vegetables",
      desc: "Farm to table quality",
      img: freshVegetables, // public folder path or URL
    },
    {
      title: "Dairy Products",
      desc: "Premium quality",
      img: dairyProducts,
    },
    {
      title: "Spices & Herbs",
      desc: "Authentic flavors",
      img: spicesHerbs,
    },
    {
      title: "Grains & Cereals",
      desc: "Bulk quantities",
      img: cerealsGrains,
    },
  ]

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger fade-in after mount
    const timeout = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timeout)
  }, [])


  return (
    <div id="home" className={`flex flex-col min-h-screen transition-opacity duration-700 ease-out ${
      isVisible ? "opacity-100" : "opacity-0"
    }`}>
      {/* Header */}
      <header className="px-4 lg:px-6 h-20 flex items-center border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <Link to="/" className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-primary-purple" />
              <span className="text-3xl font-bold text-text-dark">
                SevaKart
              </span>
            </Link>

        {/* Desktop Navigation */}
        <nav className="ml-auto hidden md:flex gap-4 lg:gap-6">
          <a className="text-sm font-medium hover:text-green-600 transition-colors" href="#home">Home</a>
          <a className="text-sm font-medium hover:text-green-600 transition-colors" href="#features">Features</a>
          <a className="text-sm font-medium hover:text-green-600 transition-colors" href="#how-it-works">How It Works</a>
          <a className="text-sm font-medium hover:text-green-600 transition-colors" href="#testimonals">Testimonials</a>
        </nav>

        {/* Desktop Buttons */}
        <div className="ml-6 hidden sm:flex gap-2">
          <Link to="/login">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>

          <Link to="/login">
            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Button>

      </header>

      {/* Mobile Sidebar Button */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white shadow-md px-4 py-4 space-y-2">
          <a href="#features" className="block text-sm font-medium text-gray-700 hover:text-green-600">Features</a>
          <a href="#how-it-works" className="block text-sm font-medium text-gray-700 hover:text-green-600">How It Works</a>
          <a href="#pricing" className="block text-sm font-medium text-gray-700 hover:text-green-600">Pricing</a>
          <a href="#contact" className="block text-sm font-medium text-gray-700 hover:text-green-600">Contact</a>
          <div className="flex flex-col gap-2 pt-4">
            <Link to="/login">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>

            <Link to="/login">
              <Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      )}


      <main className="flex-1">
        <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="container max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Left Content */}
              <div className="space-y-6">
                <div className="inline-block rounded-full bg-green-100 text-green-800 px-3 py-1 text-sm font-medium">
                  🚀 We are improving our product!
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
                  Connect Vendors with <br /> Quality Suppliers
                </h1>
                <p className="text-lg text-gray-600 max-w-xl">
                  The leading B2B marketplace for fresh produce, dairy, spices, and raw materials.
                  Streamline your supply chain with verified suppliers and competitive pricing.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/login" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:bg-gradient-to-r hover:from-violet-500 hover:to-indigo-500 text-white text-sm px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2">
                    Start Buying <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/login">
                    <button className="border border-gray-300 hover:border-gray-700 text-sm px-6 py-3 rounded-lg font-medium">
                      Become a Supplier
                    </button>
                  </Link>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-2">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    No setup fees
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Verified suppliers
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    24/7 support
                  </div>
                </div>
              </div>

              {/* Right Product Cards */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
                {features.map((item, i) => (
                  <div key={i} className="bg-white shadow-md rounded-lg p-4">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="h-24 w-full object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Why Choose Us Section */}
      <section id="features" className="px-4 py-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-2">Why Choose Us?</h2>
          <p className="text-gray-500 text-lg">Everything you need to trust us with your requirements</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Card 1 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">500+ Customers</h3>
            <p className="text-gray-600 text-sm">Trusted by athletes, tech enthusiasts, and everyday users alike.</p>
          </div>
          {/* Card 2 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">1K+ Orders</h3>
            <p className="text-gray-600 text-sm">Hundreds of successful device sales and repairs fulfilled.</p>
          </div>
          {/* Card 3 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">4.9 Rating</h3>
            <p className="text-gray-600 text-sm">Rated high by users for quality, speed, and value.</p>
          </div>
          {/* Card 4 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">24/7 Support</h3>
            <p className="text-gray-600 text-sm">Live support and troubleshooting, anytime you need it.</p>
          </div>
          {/* Card 5 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center mb-4">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Eco Friendly</h3>
            <p className="text-gray-600 text-sm">We promote device recycling and responsible disposal.</p>
          </div>
          {/* Card 6 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Top Performance</h3>
            <p className="text-gray-600 text-sm">Only the best refurbished or fixed devices leave our hands.</p>
          </div>
        </div>
      </section>


      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gray-50 py-16 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-gray-600 mt-2">Simple steps to connect with us and get your devices serviced</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center">
          {/* Step 1 */}
          <div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4 font-semibold">
              1
            </div>
            <h3 className="font-semibold text-lg mb-2">Browse & Book</h3>
            <p className="text-gray-500 text-sm">Choose your device and service from our online platform.</p>
          </div>
          {/* Step 2 */}
          <div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4 font-semibold">
              2
            </div>
            <h3 className="font-semibold text-lg mb-2">Pickup & Repair</h3>
            <p className="text-gray-500 text-sm">We pick it up, repair it fast, and keep you updated throughout.</p>
          </div>
          {/* Step 3 */}
          <div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4 font-semibold">
              3
            </div>
            <h3 className="font-semibold text-lg mb-2">Receive & Review</h3>
            <p className="text-gray-500 text-sm">Get it delivered back to you. Rate your experience easily.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonals" className="bg-white py-16 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Trusted by Thousands</h2>
          <p className="text-gray-600 mt-2">Here's what our happy customers have to say</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Testimonial 1 */}
          <div className="bg-gray-50 rounded-xl shadow-sm p-6">
            <div className="text-yellow-500 mb-2">★★★★★</div>
            <p className="text-gray-700 mb-4">"FreshTech has saved me tons on device repairs. Great service!"</p>
            <div>
              <p className="font-semibold text-sm">Sarah Johnson</p>
              <p className="text-xs text-gray-500">Procurement Manager, Fresh Foods Inc.</p>
            </div>
          </div>
          {/* Testimonial 2 */}
          <div className="bg-gray-50 rounded-xl shadow-sm p-6">
            <div className="text-yellow-500 mb-2">★★★★★</div>
            <p className="text-gray-700 mb-4">"The booking process was smooth and transparent. Highly recommend!"</p>
            <div>
              <p className="font-semibold text-sm">Michael Chen</p>
              <p className="text-xs text-gray-500">Head Chef, Urban Bistro</p>
            </div>
          </div>
          {/* Testimonial 3 */}
          <div className="bg-gray-50 rounded-xl shadow-sm p-6">
            <div className="text-yellow-500 mb-2">★★★★★</div>
            <p className="text-gray-700 mb-4">"My phone was fixed the same day. Super efficient team!"</p>
            <div>
              <p className="font-semibold text-sm">Emily Rodriguez</p>
              <p className="text-xs text-gray-500">Operations Director, Healthy Eats Co.</p>
            </div>
          </div>
        </div>
      </section>


      {/* Call to Action Section */}
      <section className="py-12 px-4 bg-gradient-to-r from-violet-700 to-indigo-800 text-white text-center rounded-md mt-12">
        <h2 className="text-3xl font-bold mb-4">Ready to Experience the Best?</h2>
        <p className="mb-6">Browse our electronics or get your devices repaired with expert care.</p>
        <Link to="/login">
          <Button className="bg-white text-indigo-600 font-bold hover:bg-gray-100">
            Shop Now <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </section>


      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-gray-50">
        <p className="text-xs text-gray-600 text-center sm:text-left">© 2025 SevaKart. All rights reserved.</p>
        <nav className="sm:ml-auto flex flex-wrap justify-center sm:justify-end gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-gray-600" to="#">Terms of Service</Link>
          <Link className="text-xs hover:underline underline-offset-4 text-gray-600" to="#">Privacy Policy</Link>
          <Link className="text-xs hover:underline underline-offset-4 text-gray-600" to="#">Support</Link>
        </nav>
      </footer>
    </div>
  )
}
