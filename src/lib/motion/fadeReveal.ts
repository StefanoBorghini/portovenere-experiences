import { Variants }
from "framer-motion";

export const fadeReveal: Variants = {

  initial: {

    opacity: 0,

    y: 24,

    filter: "blur(10px)",
  },

  animate: {

    opacity: 1,

    y: 0,

    filter: "blur(0px)",
  },
};