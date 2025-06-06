"use client";

export const smoothEasing = [0.25, 0.46, 0.45, 0.94];

export const patterns = {
  star: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 1000"
      className="w-10 h-10 fill-current"
    >
      <path
        d="M353.8 853.1H147V646.2L.7 500 147 353.8V147h206.8L500 .7 646.2 147h206.9v206.8L999.3 500 853.1 646.2v206.9H646.2L500 999.3 353.8 853.1z"
        fill="#1a1c1e"
      ></path>
    </svg>
  ),
  circle: (
    <svg viewBox="0 0 24 24" className="w-10 h-10 fill-[#1a1c1e]">
      <circle cx="12" cy="12" r="8" />
    </svg>
  ),
  award: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 1000"
      className="w-10 h-10 fill-[#1a1c1e]"
    >
      <path
        d="M500 972.7a80 80 0 0 1-52.9-20l-92-81a304.4 304.4 0 0 0-104.6-60.4l-116.1-39.1a80.2 80.2 0 0 1-53-91.6l24.3-120.2c8-40 8-80.7 0-120.8L81.5 319.4a80.2 80.2 0 0 1 52.9-91.6l116.1-39.1c38.8-13 74-33.4 104.7-60.4l92-81a80 80 0 0 1 105.7 0l92 81c30.6 27 65.8 47.3 104.6 60.4l116.1 39.1a80.2 80.2 0 0 1 53 91.6l-24.3 120.2c-8 40-8 80.7 0 120.8l24.2 120.2a80.2 80.2 0 0 1-52.9 91.6l-116.1 39.1c-38.8 13-74 33.4-104.7 60.4l-92 81a80 80 0 0 1-52.8 20Z"
        fill="#1a1c1e"
      ></path>
    </svg>
  ),
  cloud: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" className="w-10 h-10 fill-current"><path d="M500 913.7c-55.2 0-107-21.5-146-60.5l-.2-.1h-.3C239.7 853 147 760.4 147 646.4v-.2l-.1-.1a206.8 206.8 0 0 1 0-292.2l.1-.2v-.2C147 239.6 239.6 147 353.6 147h.2l.1-.1c39-39 91-60.5 146.1-60.5s107 21.5 146 60.5l.2.1h.2c114 0 206.7 92.7 206.7 206.6v.2l.1.2a206.8 206.8 0 0 1 0 292.2l-.1.1v.2c0 114-92.7 206.7-206.6 206.7h-.3l-.1.1c-39 39-91 60.5-146.1 60.5Z" fill="#1a1c1e"></path></svg>
  )
};

export const generateBallConfigs = () => {
  const configs = [];
  const colors = ["#FFAAAA", "#F79B72", "#ACD3A8", "#ffd698", "#7A73D1"];
  const patternBackgroundColors = ["#ffffff", "#686D76", "#8A8A8A", "#B0B0B0", "#D3D3D3"];

  const sizes = [40, 50, 60, 70, 80];
  const patternKeys = Object.keys(patterns);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const ballCount = isMobile ? 20 : 70;

  for (let i = 0; i < ballCount; i++) {
    const isPatternBall = Math.random() < 0.4;
    const config = {
      id: i + 1,
      x: `${Math.random() * 90 + 5}%`,
      y: `${Math.random() * 80 + 5}%`,
      color: colors[Math.floor(Math.random() * colors.length)],
      diameter: sizes[Math.floor(Math.random() * sizes.length)],
      angle: Math.random() * 360,
      isPattern: isPatternBall,
      pattern: isPatternBall
        ? patternKeys[Math.floor(Math.random() * patternKeys.length)]
        : null,
      patternBackgroundColor: isPatternBall
        ? patternBackgroundColors[Math.floor(Math.random() * patternBackgroundColors.length)]
        : null,
    };
    configs.push(config);
  }

  return configs;
};
