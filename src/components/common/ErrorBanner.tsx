import { AppError } from 'lib/util-client';
import React, { useEffect, useState } from 'react';
import CircleXIcon from './icons/CircleXIcon';

interface ErrorBannerProps {
  error: AppError;
  location?: string;
  aliveTimeInMs?: number;
}

function ErrorBanner({ error, location, aliveTimeInMs }: ErrorBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    setIsVisible(true);
    const id = setTimeout(() => setIsVisible(false), aliveTimeInMs ?? 5000);
    return () => clearTimeout(id);
  }, [error, aliveTimeInMs]);

  if (!isVisible) return null;
  const locationClass = location ? location : 'left-5 bottom-5';
  const { errors } = error;
  return (
    <div
      className={`fixed text-white ${locationClass} flex flex-col space-y-1`}
    >
      {errors.map((e) => {
        return (
          <div
            className="flex w-fit items-center space-x-3 rounded-lg bg-red-500 px-3 py-2 font-mono"
            key={e}
          >
            <span>Error: {e}</span>
            <button className="w-fit" onClick={() => setIsVisible(false)}>
              <CircleXIcon styles={{ icon: 'w-7 h-7 text-white' }} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ErrorBanner;
