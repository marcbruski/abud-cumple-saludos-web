
import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
}

const Confetti: React.FC<ConfettiProps> = ({ isActive, duration = 5000 }) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    speedX: number;
    speedY: number;
    rotation: number;
    rotationSpeed: number;
  }>>([]);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    // Crear partículas de confetti
    const newParticles = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -10,
      color: ['#3B82F6', '#EAB308', '#10B981', '#F59E0B', '#8B5CF6'][Math.floor(Math.random() * 5)],
      size: Math.random() * 8 + 4,
      speedX: (Math.random() - 0.5) * 4,
      speedY: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 6,
    }));

    setParticles(newParticles);

    // Animar las partículas
    const animateParticles = () => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.speedX,
          y: particle.y + particle.speedY,
          rotation: particle.rotation + particle.rotationSpeed,
          speedY: particle.speedY + 0.1, // Gravedad
        })).filter(particle => particle.y < window.innerHeight + 50)
      );
    };

    const intervalId = setInterval(animateParticles, 16);

    // Limpiar después de la duración especificada
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      setParticles([]);
    }, duration);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [isActive, duration]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            borderRadius: '2px',
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
