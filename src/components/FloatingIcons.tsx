import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { 
  MdMedicalServices, 
  MdLocalPharmacy,
  MdMonitorHeart,
  MdHealing,
  MdLocalHospital
} from 'react-icons/md';

interface IconConfig {
  name: string;
  color: string;
  size: number;
  startPosition: { x: number; y: number };
  animationDelay: number;
  duration: number;
  floatRange: number;
}

const FloatingIcons = () => {
  // Get window dimensions for positioning
  const getWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window;
    return { width, height };
  };

  const { width, height } = getWindowDimensions();

  const iconConfigs: IconConfig[] = [
    {
      name: 'medical-bag',
      color: '#4F46E5',
      size: 32,
      startPosition: { x: width * 0.1, y: height * 0.2 },
      animationDelay: 0,
      duration: 3000,
      floatRange: 30
    },
    {
      name: 'pill',
      color: '#34D399',
      size: 28,
      startPosition: { x: width * 0.8, y: height * 0.25 },
      animationDelay: 800,
      duration: 3200,
      floatRange: 25
    },
    {
      name: 'heart-pulse',
      color: '#EF4444',
      size: 30,
      startPosition: { x: width * 0.2, y: height * 0.7 },
      animationDelay: 1500,
      duration: 2800,
      floatRange: 35
    },
    {
      name: 'stethoscope',
      color: '#4F46E5',
      size: 34,
      startPosition: { x: width * 0.85, y: height * 0.65 },
      animationDelay: 2000,
      duration: 3400,
      floatRange: 30
    },
    {
      name: 'bandage',
      color: '#FBBF24',
      size: 26,
      startPosition: { x: width * 0.5, y: height * 0.4 },
      animationDelay: 1200,
      duration: 3600,
      floatRange: 40
    },
  ];

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      {iconConfigs.map((config, index) => (
        <FloatingIcon key={index} config={config} />
      ))}
    </div>
  );
};

const FloatingIcon = ({ config }: { config: IconConfig }) => {
  const controls = useAnimation();

  useEffect(() => {
    const startAnimation = async () => {
      // Initial state
      await controls.start({
        opacity: 0,
        y: 0,
        rotate: 0,
        transition: { duration: 0 }
      });

      // Fade in with delay
      await controls.start({
        opacity: 0.7,
        transition: { 
          duration: 1,
          delay: config.animationDelay / 1000,
          ease: "easeInOut"
        }
      });

      // Continuous floating animation (yoyo effect)
      controls.start({
        y: [0, -config.floatRange, 0],
        rotate: [0, 360],
        transition: {
          y: {
            duration: config.duration / 1000,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: config.animationDelay / 1000
          },
          rotate: {
            duration: (config.duration * 2) / 1000,
            repeat: Infinity,
            ease: "linear",
            delay: config.animationDelay / 1000
          }
        }
      });
    };

    startAnimation();
  }, [controls, config]);

  // Map icon names to react-icons components
  const getIconComponent = (name: string) => {
    switch (name) {
      case 'medical-bag':
        return <MdMedicalServices />;
      case 'pill':
        return <MdLocalPharmacy />;
      case 'heart-pulse':
        return <MdMonitorHeart />;
      case 'stethoscope':
        return <MdHealing />;
      case 'bandage':
        return <MdLocalHospital />;
      default:
        return <MdMedicalServices />;
    }
  };

  return (
    <motion.div
      animate={controls}
      initial={{ opacity: 0 }}
      style={{
        position: 'absolute',
        left: `${config.startPosition.x}px`,
        top: `${config.startPosition.y}px`,
      }}
    >
      <div
        style={{
          color: config.color,
          fontSize: config.size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {getIconComponent(config.name)}
      </div>
    </motion.div>
  );
};

export default FloatingIcons;