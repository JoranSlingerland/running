import { Github } from 'lucide-react';
import React, { memo } from 'react';

import { Separator } from '@ui/separator';
import { Link, Text } from '@ui/typography';

function FooterLinks() {
  return (
    <div className="flex h-5 items-center justify-center">
      <Link
        target="_blank"
        href="https://github.com/JoranSlingerland/running-backend/blob/main/LICENSE"
        type="muted"
        className="text-xs"
      >
        License
      </Link>
      <Separator orientation="vertical" />
      <Link
        href="https://github.com/JoranSlingerland/running-backend"
        target="_blank"
        type="muted"
      >
        <div className="flex items-center text-xs">
          <Github className="mr-1 size-5" /> API
        </div>
      </Link>
      <Separator orientation="vertical" />
      <Link
        href="https://github.com/JoranSlingerland/running-frontend"
        target="_blank"
        type="muted"
      >
        <span className="flex items-center text-xs">
          <Github className="mr-1 size-5" />
          Frontend
        </span>
      </Link>
    </div>
  );
}

function Footer(): JSX.Element {
  return (
    <div className="mt-auto">
      <Separator />
      <div className="mb-4 flex justify-center">
        <div className="flex w-full max-w-7xl flex-col items-center  justify-center space-y-2">
          <Text className="text-xs" type="muted">
            Running by Joran Slingerland
          </Text>
          <div>
            <FooterLinks />
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(Footer);
