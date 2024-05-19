/* eslint-disable jsx-a11y/alt-text */
import Image, { ImageProps } from 'next/image';
import React from 'react';

import { Skeleton } from './skeleton';

interface Props extends ImageProps {
  isLoading: boolean;
}

export const ImageWithSkeleton = React.forwardRef<HTMLImageElement, Props>(
  ({ width, height, className, isLoading, ...props }, ref) => {
    if (isLoading) {
      return (
        <Skeleton
          style={{
            width: `${width}px`,
            height: `${height}px`,
          }}
          className={className}
        />
      );
    }

    return (
      <Image
        ref={ref}
        width={width}
        height={height}
        className={className}
        {...props}
      />
    );
  },
);
ImageWithSkeleton.displayName = 'ImageWithSkeleton';
