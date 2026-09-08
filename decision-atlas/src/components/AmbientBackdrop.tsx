import { motion, useReducedMotion } from "framer-motion";

export function AmbientBackdrop() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,225,207,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(124,225,207,0.12),transparent_18%),linear-gradient(180deg,#041017_0%,#07141c_45%,#061019_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(124,225,207,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(124,225,207,0.05)_1px,transparent_1px)] bg-[size:88px_88px] opacity-30" />

      <motion.div
        className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-[rgba(124,225,207,0.14)] blur-3xl"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, 60, 0],
                y: [0, 24, 0],
                opacity: [0.18, 0.28, 0.18],
              }
        }
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-0 right-0 h-[32rem] w-[32rem] rounded-full bg-[rgba(124,225,207,0.08)] blur-3xl"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, -48, 0],
                y: [0, -20, 0],
                opacity: [0.14, 0.22, 0.14],
              }
        }
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg
        className="absolute inset-x-0 bottom-[-8%] h-[42vh] w-full opacity-55"
        viewBox="0 0 1440 420"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0 243C132 214 230 122 383 122C536 122 584 265 748 265C912 265 987 132 1149 132C1282 132 1348 176 1440 209V420H0V243Z"
          fill="rgba(124,225,207,0.18)"
          animate={shouldReduceMotion ? undefined : { y: [0, -16, 0], x: [0, 8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M0 269C111 289 216 197 372 197C514 197 620 310 776 310C918 310 981 232 1128 232C1266 232 1345 275 1440 320V420H0V269Z"
          fill="rgba(124,225,207,0.09)"
          animate={shouldReduceMotion ? undefined : { y: [0, 20, 0], x: [0, -12, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
