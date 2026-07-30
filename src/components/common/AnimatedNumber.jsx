// ============================================================
// components/common/AnimatedNumber.jsx — Smooth counter transition
// Author  : TransitOps Dev Team
// Date    : 2026
// ============================================================
import { useEffect, useState } from 'react';

/**
 * AnimatedNumber — Animates numbers smoothly using requestAnimationFrame.
 * Integrates ease-out easing curve for premium micro-interactions.
 */
export default function AnimatedNumber({ value, prefix = '', suffix = '', decimalPlaces = 0 }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTimestamp = null;
    const startValue = displayValue;
    const endValue = value;
    
    if (startValue === endValue) return;

    const duration = 800; // 800ms animation duration

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeProgress;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  const formatted = decimalPlaces > 0
    ? displayValue.toFixed(decimalPlaces)
    : Math.round(displayValue).toLocaleString();

  return <span>{prefix}{formatted}{suffix}</span>;
}
