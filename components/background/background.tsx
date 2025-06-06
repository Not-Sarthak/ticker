import { generateBallConfigs, patterns } from "@/lib/animation"
import Gravity, { MatterBody } from "./gravity"
import { useState, useEffect } from "react"

export default function Preview() {
  const [ballConfigs, setBallConfigs] = useState(() => generateBallConfigs())

  useEffect(() => {
    const handleResize = () => {
      setBallConfigs(generateBallConfigs())
    }

    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  return (
    <div className="w-dvw h-dvh flex flex-col relative font-azeret-mono bg-transparent">
      <Gravity 
        gravity={{ x: 0, y: 0.5 }} 
        className="w-full h-full"
        repulsionRadius={100}
        repulsionStrength={0.03}
        grabCursor={false}
      >
        {ballConfigs.map((ball) => (
          <MatterBody
            key={ball.id}
            matterBodyOptions={{ friction: 0.5, restitution: 0.95 }}
            x={ball.x}
            y={ball.y}
            bodyType="circle"
            angle={ball.angle}
          >
            <div 
              className="rounded-full hover:cursor-grab flex items-center justify-center"
              style={{ 
                width: `${ball.diameter}px`,
                height: `${ball.diameter}px`,
                backgroundColor: ball.isPattern ? (ball.patternBackgroundColor || '#686D76') : ball.color,
                color: ball.isPattern ? '#000' : '#fff'
              }}
                         >
               {ball.isPattern && ball.pattern ? patterns[ball.pattern as keyof typeof patterns] : ''}
             </div>
          </MatterBody>
        ))}
      </Gravity>
    </div>
  )
}
