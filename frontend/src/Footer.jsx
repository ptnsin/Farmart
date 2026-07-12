import { Link } from "react-router-dom";
import { Sprout } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-green-950 text-white mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-green-700 flex items-center justify-center">
            <Sprout className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Farmart</p>
            <p className="text-xs text-white/50">
              © 2024 Farmart. Cultivating trust through transparency.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-white/70 font-medium flex-wrap justify-center">
          <Link to="/help-center" className="hover:text-white">Help Center</Link>
          <Link to="/orders" className="hover:text-white">Shipping Info</Link>
          <Link to="/help-center#contact" className="hover:text-white">Contact Us</Link>
        </div>
      </div>
    </footer>
  );
}