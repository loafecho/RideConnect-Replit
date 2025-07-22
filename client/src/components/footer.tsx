import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
              RideConnect
            </h3>
            <p className="text-slate-400">Your trusted personal driver service for reliable, comfortable transportation.</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Airport Transfers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">City Tours</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Business Travel</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Special Events</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-slate-400">
              <p>📞 (555) 123-4567</p>
              <p>✉️ hello@rideconnect.com</p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Facebook
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Twitter
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; 2024 RideConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
