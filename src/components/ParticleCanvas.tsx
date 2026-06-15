import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface ParticleCanvasRef {
  triggerConfetti: () => void;
  triggerFirework: (x?: number, y?: number) => void;
  triggerLantern: (x?: number) => void;
  triggerBalloon: () => void;
}

interface ParticleCanvasProps {
  scene: string; // 'uploader' | 'opening' | 'tunnel' | 'gallery' | 'message' | 'cake' | 'sky' | 'ending'
}

interface PhysicsEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'particle' | 'star' | 'heart' | 'balloon' | 'lantern' | 'confetti' | 'firework_projectile' | 'firework_trail' | 'firework_spark';
  extra?: any;
}

export const ParticleCanvas = forwardRef<ParticleCanvasRef, ParticleCanvasProps>(
  ({ scene }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const entitiesRef = useRef<PhysicsEntity[]>([]);
    const animationFrameId = useRef<number | null>(null);
    const mouseRef = useRef({ x: 0, y: 0, active: false });

    // Expose particle triggers externally
    useImperativeHandle(ref, () => ({
      triggerConfetti() {
        createConfettiBurst();
      },
      triggerFirework(x, y) {
        createFirework(x, y);
      },
      triggerLantern(x) {
        createLantern(x);
      },
      triggerBalloon() {
        createBalloon();
      }
    }));

    // Particle creation functions
    const createConfettiBurst = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const colors = ['#f3cbd1', '#b76e79', '#e0b0ff', '#ffd700', '#ff5a00', '#22d3ee', '#34d399'];
      for (let i = 0; i < 150; i++) {
        entitiesRef.current.push({
          x: canvas.width / 2 + (Math.random() - 0.5) * 50,
          y: canvas.height * 0.65,
          vx: (Math.random() - 0.5) * 20,
          vy: -Math.random() * 18 - 5,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          life: 0,
          maxLife: Math.random() * 120 + 80,
          type: 'confetti',
          extra: {
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            shape: Math.random() > 0.5 ? 'circle' : 'rect'
          }
        });
      }
    };

    const createFirework = (targetX?: number, targetY?: number) => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const startX = targetX !== undefined ? targetX : Math.random() * canvas.width;
      const startY = canvas.height;
      const endY = targetY !== undefined ? targetY : canvas.height * 0.15 + Math.random() * canvas.height * 0.4;
      const colors = ['#f3cbd1', '#ffd700', '#f472b6', '#c084fc', '#60a5fa', '#34d399'];
      const chosenColor = colors[Math.floor(Math.random() * colors.length)];

      entitiesRef.current.push({
        x: startX,
        y: startY,
        vx: (Math.random() - 0.5) * 2.5,
        vy: -Math.sqrt(2 * 0.15 * (canvas.height - endY)) * (0.95 + Math.random() * 0.1), // Calculate projectile velocity to peak near EndY
        size: 4,
        color: chosenColor,
        alpha: 1,
        life: 0,
        maxLife: 500, // Blow up on apex or when vy becomes positive
        type: 'firework_projectile',
        extra: {
          peakY: endY,
          trailTimer: 0
        }
      });
    };

    const explodeFirework = (x: number, y: number, color: string) => {
      const colors = [color, '#ffffff', '#ffd700', '#f3cbd1'];
      const count = 80;
      for (let i = 0; i < count; i++) {
        const radius = Math.random() * 6 + 1;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 2;
        entitiesRef.current.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: radius,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          life: 0,
          maxLife: Math.random() * 60 + 40,
          type: 'firework_spark',
          extra: {
            gravity: 0.08,
            friction: 0.96
          }
        });
      }
    };

    const createLantern = (x?: number) => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const px = x !== undefined ? x : Math.random() * canvas.width;
      const colors = ['rgba(251, 191, 36, 0.8)', 'rgba(212, 163, 89, 0.8)', 'rgba(183, 110, 121, 0.8)'];
      entitiesRef.current.push({
        x: px,
        y: canvas.height + 20,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -(Math.random() * 1.2 + 0.6),
        size: Math.random() * 12 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.9,
        life: 0,
        maxLife: canvas.height * 2, // Live as they climb beyond viewport
        type: 'lantern',
        extra: {
          swaySpeed: Math.random() * 0.02 + 0.01,
          swayOffset: Math.random() * 100,
          glowSize: Math.random() * 15 + 10
        }
      });
    };

    const createBalloon = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      // Soft luxury colors for balloons (rose gold, soft pink, lavender, gold, warm white)
      const colors = [
        'rgba(183, 110, 121, 0.85)', // Rose Gold
        'rgba(243, 203, 209, 0.85)', // Soft Pink
        'rgba(224, 176, 255, 0.85)', // Lavender
        'rgba(212, 175, 55, 0.85)',  // Warm Gold
        'rgba(255, 230, 230, 0.85)'   // Dreamy Ivory
      ];
      const count = 5;
      for (let i = 0; i < count; i++) {
        entitiesRef.current.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 50,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -(Math.random() * 2 + 1.2),
          size: Math.random() * 20 + 20,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.9,
          life: 0,
          maxLife: canvas.height * 2,
          type: 'balloon',
          extra: {
            swaySpeed: Math.random() * 0.03 + 0.01,
            swayOffset: Math.random() * 50,
            hasString: true,
            stringLength: Math.random() * 40 + 50
          }
        });
      }
    };

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Handle Resize
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Populate baseline stars if scene is starfield-related
        if (entitiesRef.current.filter((e) => e.type === 'star').length < 150) {
          populateStarfield();
        }
      };

      const populateStarfield = () => {
        const starCount = window.innerWidth < 768 ? 100 : 250;
        for (let i = 0; i < starCount; i++) {
          entitiesRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: 0,
            vy: 0,
            size: Math.random() * 1.8 + 0.3,
            color: Math.random() > 0.4 ? '#ffffff' : Math.random() > 0.5 ? '#ffd700' : '#f3cbd1',
            alpha: Math.random() * 0.8 + 0.2,
            life: Math.random() * 100,
            maxLife: 100,
            type: 'star',
            extra: {
              twinkleSpeed: Math.random() * 0.02 + 0.005,
              shimmerState: Math.random() * Math.PI
            }
          });
        }
      };

      // Handle Mouse trails
      const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
        mouseRef.current.active = true;

        // Custom subtle rose gold dust trail on mouse move
        if (Math.random() < 0.25) {
          entitiesRef.current.push({
            x: e.clientX,
            y: e.clientY,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 3 + 1,
            color: Math.random() > 0.5 ? '#b76e79' : '#ffd700',
            alpha: 0.8,
            life: 0,
            maxLife: Math.random() * 40 + 20,
            type: 'particle'
          });
        }
      };

      const handleMouseOut = () => {
        mouseRef.current.active = false;
      };

      // Periodic automatic entity generation based on current scene!
      let intervalId: any = setInterval(() => {
        if (!canvasRef.current) return;
        const w = canvasRef.current.width;

        if (scene === 'opening' || scene === 'ending') {
          // Slow background floaters
          if (Math.random() < 0.3) {
            // Heart particle rising
            entitiesRef.current.push({
              x: Math.random() * w,
              y: canvasRef.current.height + 20,
              vx: (Math.random() - 0.5) * 1,
              vy: -(Math.random() * 1.5 + 0.8),
              size: Math.random() * 8 + 4,
              color: Math.random() > 0.5 ? '#b76e79' : '#f3cbd1',
              alpha: 0.7,
              life: 0,
              maxLife: canvasRef.current.height * 1.5,
              type: 'heart',
              extra: {
                angle: Math.random() * Math.PI * 2,
                sway: Math.random() * 0.03 + 0.01
              }
            });
          }
        }

        if (scene === 'sky' || scene === 'ending') {
          // Random sky lantern drifting or shooting star
          if (Math.random() < 0.03) {
            createLantern();
          }

          // Shooting star
          if (Math.random() < 0.005) {
            const startX = Math.random() * w * 0.6;
            const startY = Math.random() * canvasRef.current.height * 0.3;
            entitiesRef.current.push({
              x: startX,
              y: startY,
              vx: Math.random() * 15 + 10,
              vy: Math.random() * 4 + 3,
              size: Math.random() * 2 + 1,
              color: '#ffffff',
              alpha: 1,
              life: 0,
              maxLife: 30,
              type: 'star',
              extra: {
                isShooting: true,
                trail: []
              }
            });
          }
        }
      }, 500);

      window.addEventListener('resize', resizeCanvas);
      window.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseleave', handleMouseOut);

      // Initial Call
      resizeCanvas();

      // RENDER LOOP
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Gradient clean space overlay depending on scene
        if (scene === 'uploader') {
          // Dark ambient glow in uploader mode
          const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 50, canvas.width / 2, canvas.height / 2, canvas.width);
          grad.addColorStop(0, '#0a0614');
          grad.addColorStop(1, '#030208');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const entities = entitiesRef.current;
        const nextEntities: PhysicsEntity[] = [];

        for (let i = 0; i < entities.length; i++) {
          const e = entities[i];
          e.life++;

          if (e.type === 'star') {
            if (e.extra?.isShooting) {
              // Standard shooting star draw
              ctx.beginPath();
              ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, 1 - e.life / e.maxLife))})`;
              ctx.lineWidth = Math.max(0, e.size);
              ctx.moveTo(e.x, e.y);
              ctx.lineTo(e.x - e.vx * 1.5, e.y - e.vy * 1.5);
              ctx.stroke();

              e.x += e.vx;
              e.y += e.vy;

              if (e.life < e.maxLife && e.x < canvas.width && e.y < canvas.height) {
                nextEntities.push(e);
              }
            } else {
              // Twinkle baseline star
              e.extra.shimmerState += e.extra.twinkleSpeed;
              const alphaValue = Math.max(0.1, Math.min(1, e.alpha + Math.sin(e.extra.shimmerState) * 0.3));

              ctx.beginPath();
              ctx.arc(e.x, e.y, Math.max(0, e.size), 0, Math.PI * 2);
              ctx.fillStyle = e.color;
              ctx.globalAlpha = alphaValue;
              ctx.fill();
              ctx.globalAlpha = 1.0;

              nextEntities.push(e); // keep permanent stars
            }
          } else if (e.type === 'particle') {
            // General dust mouse trail
            const percentage = Math.max(0, Math.min(1, 1 - e.life / e.maxLife));
            ctx.beginPath();
            ctx.arc(e.x, e.y, Math.max(0, e.size * percentage), 0, Math.PI * 2);
            ctx.fillStyle = e.color;
            ctx.globalAlpha = Math.max(0, Math.min(1, e.alpha * percentage));
            ctx.fill();
            ctx.globalAlpha = 1.0;

            e.x += e.vx;
            e.y += e.vy;
            e.vy += 0.01; // subtle gravity

            if (e.life < e.maxLife) {
              nextEntities.push(e);
            }
          } else if (e.type === 'heart') {
            const percentage = Math.max(0, Math.min(1, 1 - e.life / e.maxLife));
            // Draw a beautiful heart vector on canvas
            ctx.save();
            ctx.translate(e.x, e.y);
            // Apply scale based on size and fading percentage
            const scale = Math.max(0, (e.size / 10) * percentage);
            ctx.scale(scale, scale);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-5, -5, -15, -5, -15, 5);
            ctx.bezierCurveTo(-15, 12, -5, 18, 0, 25);
            ctx.bezierCurveTo(5, 18, 15, 12, 15, 5);
            ctx.bezierCurveTo(15, -5, 5, -5, 0, 0);
            ctx.fillStyle = e.color;
            ctx.globalAlpha = Math.max(0, Math.min(1, e.alpha * percentage));
            ctx.fill();
            ctx.restore();

            // Heart physics: swing left and right nicely while rising
            e.extra.angle += e.extra.sway;
            e.x += Math.sin(e.extra.angle) * 0.7;
            e.y += e.vy;

            if (e.life < e.maxLife && e.y > -50) {
              nextEntities.push(e);
            }
          } else if (e.type === 'lantern') {
            // Sky lanterns
            const percentage = Math.max(0, Math.min(1.0, 1 - e.life / e.maxLife));
            ctx.save();
            ctx.translate(e.x, e.y);

            // Subtle lanterns sway
            e.extra.swayOffset += e.extra.swaySpeed;
            const sway = Math.sin(e.extra.swayOffset) * 0.8;
            e.x += sway;
            e.y += e.vy;

            // Draw lantern glass container
            const w = e.size;
            const h = e.size * 1.39;

            // Draw shadow/glow ring around lantern
            const glowGrid = ctx.createRadialGradient(0, h / 2, 0, 0, h / 2, Math.max(0, e.extra.glowSize + w));
            glowGrid.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
            glowGrid.addColorStop(0.5, 'rgba(183, 110, 121, 0.1)');
            glowGrid.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = glowGrid;
            ctx.beginPath();
            ctx.arc(0, h / 2, Math.max(0, e.extra.glowSize + w), 0, Math.PI * 2);
            ctx.fill();

            // Lantern shape
            ctx.beginPath();
            ctx.moveTo(-w / 2, 0);
            ctx.lineTo(w / 2, 0);
            ctx.lineTo(w / 2 * 0.8, h);
            ctx.lineTo(-w / 2 * 0.8, h);
            ctx.closePath();
            
            ctx.fillStyle = e.color;
            ctx.globalAlpha = Math.max(0, Math.min(1, e.alpha * percentage));
            ctx.fill();

            // Golden fire center core
            ctx.beginPath();
            ctx.arc(0, h * 0.75, Math.max(0, w * 0.28), 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#fbbf24';
            ctx.fill();

            ctx.restore();
            ctx.shadowBlur = 0; // reset shadow

            if (e.life < e.maxLife && e.y > -100) {
              nextEntities.push(e);
            }
          } else if (e.type === 'balloon') {
            // Balloon with string
            ctx.save();
            ctx.translate(e.x, e.y);

            e.extra.swayOffset += e.extra.swaySpeed;
            e.x += Math.sin(e.extra.swayOffset) * 0.8;
            e.y += e.vy;

            // Draw balloon body
            const r = e.size;
            ctx.beginPath();
            ctx.ellipse(0, 0, r * 0.82, r, 0, 0, Math.PI * 2);
            ctx.fillStyle = e.color;
            ctx.globalAlpha = e.alpha;
            ctx.fill();

            // Tie triangle at bottom
            ctx.beginPath();
            ctx.moveTo(-2, r);
            ctx.lineTo(2, r);
            ctx.lineTo(0, r + 5);
            ctx.closePath();
            ctx.fillStyle = e.color;
            ctx.fill();

            // Reflecting luxury shine spot on balloon
            ctx.beginPath();
            ctx.ellipse(-r * 0.25, -r * 0.4, r * 0.15, r * 0.28, Math.PI / 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fill();

            // String line
            ctx.beginPath();
            ctx.moveTo(0, r + 5);
            // Wave the string
            const stringSway = Math.sin(e.extra.swayOffset * 1.5) * 6;
            ctx.quadraticCurveTo(stringSway, r + e.extra.stringLength * 0.5, stringSway / 2, r + e.extra.stringLength);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();

            if (e.life < e.maxLife && e.y > -150) {
              nextEntities.push(e);
            }
          } else if (e.type === 'confetti') {
            // Confetti falls down & rotates
            const percentage = Math.max(0, Math.min(1, 1 - e.life / e.maxLife));
            ctx.save();
            ctx.translate(e.x, e.y);
            ctx.rotate((e.extra.rotation * Math.PI) / 180);

            ctx.fillStyle = e.color;
            ctx.globalAlpha = percentage;

            if (e.extra.shape === 'circle') {
              ctx.beginPath();
              ctx.arc(0, 0, Math.max(0, e.size / 2), 0, Math.PI * 2);
              ctx.fill();
            } else {
              ctx.fillRect(-e.size / 2, -e.size / 2, e.size, e.size * 0.6);
            }

            ctx.restore();

            // Physics
            e.x += e.vx;
            e.y += e.vy;
            e.vy += 0.22; // gravity
            e.vx *= 0.98; // wind resistance
            e.extra.rotation += e.extra.rotationSpeed;

            if (e.life < e.maxLife && e.y < canvas.height + 20) {
              nextEntities.push(e);
            }
          } else if (e.type === 'firework_projectile') {
            // Climbing projectile for firework
            ctx.beginPath();
            ctx.arc(e.x, e.y, Math.max(0, e.size), 0, Math.PI * 2);
            ctx.fillStyle = e.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = e.color;
            ctx.fill();
            ctx.shadowBlur = 0; // reset

            // Soft trail behind climbing projectile
            e.extra.trailTimer++;
            if (e.extra.trailTimer % 2 === 0) {
              entitiesRef.current.push({
                x: e.x,
                y: e.y,
                vx: (Math.random() - 0.5) * 0.5,
                vy: 0.5,
                size: Math.random() * 2 + 0.5,
                color: 'rgba(251, 191, 36, 0.35)',
                alpha: 0.5,
                life: 0,
                maxLife: 20,
                type: 'particle'
              });
            }

            e.x += e.vx;
            e.y += e.vy;
            e.vy += 0.12; // slow down vertically

            // Peak trigger
            if (e.vy >= -0.25 || e.y <= e.extra.peakY) {
              explodeFirework(e.x, e.y, e.color);
            } else {
              nextEntities.push(e);
            }
          } else if (e.type === 'firework_spark') {
            // Exploding sparks falling down
            const percentage = Math.max(0, Math.min(1, 1 - e.life / e.maxLife));
            ctx.beginPath();
            ctx.arc(e.x, e.y, Math.max(0, e.size * percentage), 0, Math.PI * 2);
            ctx.fillStyle = e.color;
            ctx.globalAlpha = percentage;
            ctx.fill();
            ctx.globalAlpha = 1.0;

            e.x += e.vx;
            e.y += e.vy;
            e.vx *= e.extra.friction;
            e.vy *= e.extra.friction;
            e.vy += e.extra.gravity; // fall-down gravity

            if (e.life < e.maxLife) {
              nextEntities.push(e);
            }
          }
        }

        entitiesRef.current = nextEntities;
        animationFrameId.current = requestAnimationFrame(render);
      };

      render();

      return () => {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
        clearInterval(intervalId);
        window.removeEventListener('resize', resizeCanvas);
        window.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseOut);
      };
    }, [scene]);

    return (
      <canvas
        ref={canvasRef}
        id="particle-canvas"
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      />
    );
  }
);

ParticleCanvas.displayName = 'ParticleCanvas';
