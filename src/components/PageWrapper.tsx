import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";

const variants = {
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: 16, transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } },
};

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={router.asPath}
        initial="initial"
        animate="animate"
        exit="exit"
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
} 