
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

  constructor(canvas: HTMLCanvasElement, x: number, y: number) {
    super(canvas);
    this.initializeParticles(x, y);
  }

  private initializeParticles(x: number, y: number): void {
    for (let i = 0; i < this.particleCount; i++) {
      // Create an even circular distribution with more spread
      const angle = (Math.PI * 2 * i) / this.particleCount;
      // Increase base speed and randomization for more spread
      const baseSpeed = 8; // Increased base speed
      const randomSpeed = Math.random() * 6; // More random variation
      const speed = baseSpeed + randomSpeed;
      
      // Add some random offset to the angle for less uniform distribution
      const randomAngleOffset = (Math.random() - 0.5) * 0.5;
      const finalAngle = angle + randomAngleOffset;
      
      const shape = Math.random() < 0.33 ? "circle" : Math.random() < 0.66 ? "star" : "triangle";
      
      this.particles.push({
        x,
        y,
        // Use cosine and sine with the adjusted angle and speed
        vx: Math.cos(finalAngle) * speed,
        vy: Math.sin(finalAngle) * speed,
        size: 2 + Math.random() * 4,
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
      // Reduce deceleration for more consistent outward movement
      particle.vx *= 0.99;
      particle.vy *= 0.99;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.rotationSpeed;
      particle.opacity -= 0.02; // Slightly faster fade out
      this.drawParticle(particle);
    });

    if (this.particles.length > 0) {
      this.animationFrame = requestAnimationFrame(this.animate.bind(this));
    }
  }
}
