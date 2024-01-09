import React, { memo } from 'react';
import { Separator } from '@ui/separator';
import Typography from '@ui/typography';
import { GitHubLogoIcon } from '@radix-ui/react-icons';

const { Text, Link } = Typography;

function FooterLinks() {
  return (
    <div className="flex justify-center items-center h-5">
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
        <div className="flex text-xs items-center">
          <GitHubLogoIcon className="mr-1" /> API
        </div>
      </Link>
      <Separator orientation="vertical" />
      <Link
        href="https://github.com/JoranSlingerland/running-frontend"
        target="_blank"
        type="muted"
      >
        <span className="flex items-center text-xs">
          <GitHubLogoIcon className="mr-1" />
          Frontend
        </span>
      </Link>
    </div>
  );
}

function Footer({}: {}): JSX.Element {
  return (
    <div className="mt-auto">
      <Separator />
      <div className="flex justify-center mb-4">
        <div className="w-full flex flex-col space-y-2 items-center  justify-center max-w-7xl">
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
