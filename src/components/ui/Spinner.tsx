import { cn } from "@/utils/utils";
import { motion } from "framer-motion";

const Spinner = ({ className }: { className: string }) => {
  return (
    <motion.div
      className={cn("relative w-10 h-10", className)}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    >
      {/* The Outer Gradient Ring */}
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 border-b-pink-500 border-l-cyan-400 opacity-80 blur-[1px]" />

      {/* The Inner Solid Ring (for crispness) */}
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500" />
    </motion.div>
  );
};

export default Spinner;
