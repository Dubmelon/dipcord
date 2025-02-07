
import { BaseAnimation } from './BaseAnimation';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: 'circle' | 'star' | 'triangle';
  opacity: number;
}

export class ButtonParticleAnimation extends BaseAnimation {
  private particles: Particle[] = [];
  private colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"];
  private readonly particleCount = 50;
  private readonly gravity = 0.15; // Add gravity for descent

  constructor(canvas: HTMLCanvasElement, x: number, y: number) {
    super(canvas);
    this.initializeParticles(x, y);
  }

  private initializeParticles(x: number, y: number): void {
    for (let i = 0; i < this.particleCount; i++) {
      // Create wider angle distribution for better spread
      const baseAngle = (Math.PI * 2 * i) / this.particleCount;
      // Add more variation to create natural spread
      const angleVariation = (Math.random() - 0.5) * Math.PI / 2;
      const finalAngle = baseAngle + angleVariation;
      
      // Higher initial speeds with more variation
      const minSpeed = 15;
      const maxSpeed = 25;
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
      
      // Add upward bias to initial velocity
      const upwardBias = -Math.abs(Math.random() * 5); // Negative because y-axis is inverted in canvas
      
      const shape = Math.random() < 0.33 ? "circle" : Math.random() < 0.66 ? "star" : "triangle";
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(finalAngle) * speed,
        vy: Math.sin(finalAngle) * speed + upwardBias, // Add upward bias
        size: 2 + Math.random() * 5, // More size variation
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        shape,
        opacity: 1
      });
    }
  }

  private drawParticle(particle: Particle): void {
    if (!this.ctx) return;
    
    this.ctx.save();
    this.ctx.translate(particle.x, particle.y);
    this.ctx.rotate(particle.rotation);
    this.ctx.globalAlpha = particle.opacity;
    this.ctx.fillStyle = particle.color;
    this.ctx.beginPath();

    switch (particle.shape) {
      case "star":
        for (let i = 0; i < 5; i++) {
          const angle = (Math.PI * 2 * i) / 5;
          const x = Math.cos(angle) * particle.size;
          const y = Math.sin(angle) * particle.size;
          if (i === 0) this.ctx.moveTo(x, y);
          else this.ctx.lineTo(x, y);
        }
        break;
      case "triangle":
        const size = particle.size * 1.5;
        this.ctx.moveTo(-size/2, size/2);
        this.ctx.lineTo(size/2, size/2);
        this.ctx.lineTo(0, -size/2);
        break;
      default:
        this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
    }

    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  animate(): void {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles = this.particles.filter(particle => particle.opacity > 0);

    this.particles.forEach(particle => {
      // Add gravity effect
      particle.vy += this.gravity;
      
      // Minimal horizontal deceleration
      particle.vx *= 0.99;
      
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.rotationSpeed;
      
      // Slower fade out for longer-lasting effect
      particle.opacity -= 0.015;
      
      this.drawParticle(particle);
    });

    if (this.particles.length > 0) {
      this.animationFrame = requestAnimationFrame(this.animate.bind(this));
    }
  }
}
