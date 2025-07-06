'use client';

import { useEffect, useState } from 'react';

export default function ThemeWrapper({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  if (!mounted) return null;

  return (
    <div
      style={{
        backgroundImage: "var(--background-image)",
        backgroundColor: "var(--color-background)",
        color: "var(--color-foreground)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh"
      }}
    >
      {children}
    </div>
  );
}
