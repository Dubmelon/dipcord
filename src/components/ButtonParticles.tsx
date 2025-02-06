
import { useEffect, useRef } from "react";
import { ButtonParticleAnimation } from "./animations/ButtonParticleAnimation";

interface ButtonParticlesProps {
  x: number;
  y: number;
}

export const ButtonParticles = ({ x, y }: ButtonParticlesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<ButtonParticleAnimation>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Optimize canvas for retina displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    animationRef.current = new ButtonParticleAnimation(canvas, x, y);
    animationRef.current.start();

    return () => {
      if (animationRef.current) {
        animationRef.current.cleanup();
        animationRef.current = undefined;
      }
    };
  }, [x, y]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      style={{ 
        width: '100%', 
        height: '100%',
        willChange: 'transform' // Optimize for animations
      }}
    />
  );
};
