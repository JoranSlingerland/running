import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const loadingMessages = [
  'Putting on your virtual running shoes...',
  "Warming up the app's muscles...",
  'Stretching the code for optimal performance...',
  'Running through the data tracks...',
  'Tying up the coding laces...',
  'Pacing ourselves for a smooth start...',
  'Finding the perfect stride for your experience...',
  'Counting down the milliseconds to a great run...',
  'Loading the scenic route for your journey...',
  'Inhale. Exhale. Loading...',
  'Lacing up your virtual sneakers...',
  'Tuning up the GPS for precision tracking...',
  'Syncing with the running clouds...',
  'Calibrating the stride algorithm...',
  'Checking the weather for your virtual run...',
  'Fueling up with digital energy...',
  'Optimizing the route for scenic views...',
  'Waving to other virtual runners...',
  'Adjusting the incline for the virtual hills...',
  'Preparing the cheering crowd of 1s and 0s...',
  'Finding the perfect playlist for your run...',
  'Synchronizing with the heartbeat of the code...',
  'Visualizing the finish line in the binary distance...',
  'Elevating the pulse of the loading process...',
  'Creating a pixel-perfect path for your run...',
  "Generating endorphins for a code-runner's high...",
  'Coding a smooth transition to the running experience...',
  "Charging up the app's stamina for a robust run...",
];

export default function FullScreenLoader({ active }: { active: boolean }) {
  const [randomMessage, setRandomMessage] = useState('Loading...');

  useEffect(() => {
    setRandomMessage(
      loadingMessages[Math.floor(Math.random() * loadingMessages.length)],
    );
  }, []);

  useEffect(() => {
    if (active) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [active]);

  return active ? (
    <div className="absolute inset-0 flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="animate-spin mb-4" />
      <p>{randomMessage}</p>
    </div>
  ) : null;
}
