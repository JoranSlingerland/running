import bbox from '@turf/bbox';
import maplibregl from 'maplibre-gl';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import WebMercatorViewport from 'viewport-mercator-project';

import { getMapTilerToken } from '@services/env/maptilertoken';
import { Skeleton } from '@ui/skeleton';
import 'maplibre-gl/dist/maplibre-gl.css';

type Source = {
  id: string;
  source: maplibregl.SourceSpecification;
};

type Layer = {
  layer: maplibregl.LayerSpecification;
  beforeId?: string;
};

type BaseMapProps = {
  className?: string;
  sources?: Source[];
  layers?: Layer[];
  isLoading?: boolean;
};

type MapPropsWithBBox = BaseMapProps & {
  boundingBox: {
    type: string;
    coordinates: number[][];
  };
  initialViewState?: never;
};

type MapPropsWithInitialViewState = BaseMapProps & {
  initialViewState: {
    center: maplibregl.LngLatLike;
    zoom: number;
  };
  boundingBox?: never;
};

type MapProps = MapPropsWithBBox | MapPropsWithInitialViewState;

export default function Map({
  className,
  initialViewState,
  sources = [],
  layers = [],
  boundingBox,
  isLoading = false,
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [mapIsLoading, setMapIsLoading] = useState(isLoading);
  const [maptilertoken, setMaptilertoken] = useState<string | null>(null);

  // Calculate initial viewport based on bounding box
  const { longitude, latitude, zoom } = useMemo(() => {
    if (!boundingBox || !mapContainerRef.current) {
      return { longitude: 0, latitude: 0, zoom: 12 };
    }

    const { offsetWidth, offsetHeight } = mapContainerRef.current;

    const viewport = new WebMercatorViewport({
      width: offsetWidth - 50,
      height: offsetHeight - 50,
    });

    const routeBbox = bbox({
      type: boundingBox.type,
      coordinates: boundingBox.coordinates,
    });

    routeBbox.forEach((value, index) => {
      if (!isFinite(value)) {
        routeBbox[index] = 0;
      }
    });

    try {
      const { longitude, latitude, zoom } = viewport.fitBounds([
        [routeBbox[0], routeBbox[1]],
        [routeBbox[2], routeBbox[3]],
      ]);

      return { longitude, latitude, zoom };
    } catch (error) {
      return { longitude: 0, latitude: 0, zoom: 12 };
    }
  }, [boundingBox]);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getMapTilerToken();
      setMaptilertoken(token);
    };

    fetchToken();
  }, []);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainerRef.current || !maptilertoken) {
      return;
    }

    const newMap = new maplibregl.Map({
      container: mapContainerRef.current || '',
      style: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${maptilertoken}`,
      center: initialViewState
        ? initialViewState.center
        : [longitude, latitude],
      zoom: initialViewState ? initialViewState.zoom : zoom,
    });

    newMap.addControl(new maplibregl.NavigationControl(), 'top-right');
    setMapIsLoading(false);
    newMap.on('load', () => {
      sources.forEach((source) => {
        newMap.addSource(source.id, source.source);
      });

      layers.forEach(({ layer, beforeId }) => {
        newMap.addLayer(layer, beforeId);
      });
    });
    setMap(newMap);

    return () => {
      newMap.remove();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [longitude, latitude, zoom, maptilertoken, mapContainerRef.current]);

  // Update map when sources change
  useEffect(() => {
    let animationId: number | null = null;

    function animateMarker() {
      if (map) {
        sources.forEach((source) => {
          try {
            // @ts-expect-error Weird typing within the mapbox-gl library
            map.getSource(source.id)?.setData(source.source.data); // type-coverage:ignore-line
          } catch (error) {
            console.error('An error occurred:', error);
          }
        });
        animationId = requestAnimationFrame(animateMarker);
      }
    }

    animateMarker();

    return () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [sources, map]);

  return (
    <>
      {mapIsLoading ||
        (isLoading && (
          <Skeleton className={twMerge(['size-full', className])}></Skeleton>
        ))}
      <div
        ref={mapContainerRef}
        className={twMerge([
          'size-full',
          mapIsLoading || isLoading ? 'hidden' : '',
          className,
        ])}
      ></div>
    </>
  );
}
