"use client";

import { useState, useEffect } from "react";
import { ChakraProvider as BaseChakraProvider } from "@chakra-ui/react";
import { system } from "@/theme";

export function ChakraProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <BaseChakraProvider value={system}>{children}</BaseChakraProvider>;
}
