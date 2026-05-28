import { useEffect, useState, useRef } from 'react';
import { Player } from '@lordicon/react';

// Import minimal, line-style weather Lottie animations from meteocons
import clearDay from '@meteocons/lottie/line/clear-day.json';
import partlyCloudyDay from '@meteocons/lottie/line/partly-cloudy-day.json';
import cloudyIcon from '@meteocons/lottie/line/cloudy.json';
import rainIcon from '@meteocons/lottie/line/rain.json';
import thunderstormsIcon from '@meteocons/lottie/line/thunderstorms.json';
import fogIcon from '@meteocons/lottie/line/fog.json';
import snowIcon from '@meteocons/lottie/line/snow.json';

const WMO_CODES: Record<number, { text: string, icon: string }> = {
  0: { text: 'Clear Sky', icon: 'clear_day' },
  1: { text: 'Mainly Clear', icon: 'partly_cloudy_day' },
  2: { text: 'Partly Cloudy', icon: 'partly_cloudy_day' },
  3: { text: 'Overcast', icon: 'cloud' },
  45: { text: 'Fog', icon: 'foggy' },
  48: { text: 'Rime Fog', icon: 'foggy' },
  51: { text: 'Light Drizzle', icon: 'rainy' },
  53: { text: 'Moderate Drizzle', icon: 'rainy' },
  55: { text: 'Dense Drizzle', icon: 'rainy' },
  56: { text: 'Light Freezing Drizzle', icon: 'weather_mix' },
  57: { text: 'Dense Freezing Drizzle', icon: 'weather_mix' },
  61: { text: 'Slight Rain', icon: 'rainy' },
  63: { text: 'Moderate Rain', icon: 'rainy' },
  65: { text: 'Heavy Rain', icon: 'rainy' },
  66: { text: 'Light Freezing Rain', icon: 'weather_mix' },
  67: { text: 'Heavy Freezing Rain', icon: 'weather_mix' },
  71: { text: 'Slight Snow', icon: 'snowing' },
  73: { text: 'Moderate Snow', icon: 'snowing' },
  75: { text: 'Heavy Snow', icon: 'snowing' },
  77: { text: 'Snow Grains', icon: 'snowing' },
  80: { text: 'Slight Rain Showers', icon: 'rainy' },
  81: { text: 'Moderate Rain Showers', icon: 'rainy' },
  82: { text: 'Violent Rain Showers', icon: 'rainy' },
  85: { text: 'Slight Snow Showers', icon: 'snowing' },
  86: { text: 'Heavy Snow Showers', icon: 'snowing' },
  95: { text: 'Thunderstorm', icon: 'thunderstorm' },
  96: { text: 'Thunderstorm + Hail', icon: 'thunderstorm' },
  99: { text: 'Heavy Thunderstorm + Hail', icon: 'thunderstorm' },
};

const ICON_MAPPING: Record<string, any> = {
  clear_day: clearDay,
  partly_cloudy_day: partlyCloudyDay,
  cloud: cloudyIcon,
  rainy: rainIcon,
  weather_mix: rainIcon,
  snowing: snowIcon,
  thunderstorm: thunderstormsIcon,
  foggy: fogIcon,
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState<{ temp: number, text: string, icon: string } | null>(null);
  const playerRef = useRef<Player>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=32.0972768&longitude=77.1028326&current=temperature_2m,weather_code');
        const data = await res.json();
        const temp = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;
        const mapped = WMO_CODES[code] || { text: 'Unknown', icon: 'cloud' };
        setWeather({ temp, ...mapped });
      } catch (err) {
        console.error("Failed to fetch weather:", err);
      }
    }
    fetchWeather();
  }, []);

  const handleReady = () => {
    playerRef.current?.playFromBeginning();
  };

  // Re-play the animation when the icon changes
  useEffect(() => {
    if (weather) {
      playerRef.current?.playFromBeginning();
    }
  }, [weather]);

  if (!weather) return null;

  return (
    <div className="flex items-center weather-widget" style={{ marginLeft: '12px', gap: '8px' }}>
      <div className="weather-icon-container" style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Player
          ref={playerRef}
          icon={ICON_MAPPING[weather.icon] || cloudyIcon}
          size={42}
          onReady={handleReady}
          onComplete={() => {
            playerRef.current?.playFromBeginning();
          }}
        />
      </div>
      <div className="flex-col" style={{ alignItems: 'flex-start', gap: '2px' }}>
        <span className="font-headline label-md text-on-surface-variant" style={{ textTransform: 'none', fontVariantNumeric: 'lining-nums', fontWeight: 600 }}>{weather.temp}°C</span>
        <span className="font-headline label-md text-on-surface-variant weather-desc" style={{ textTransform: 'none', fontSize: '13px', opacity: 0.9 }}>{weather.text}</span>
      </div>
    </div>
  );
}

