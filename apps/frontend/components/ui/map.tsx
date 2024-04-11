import bbox from '@turf/bbox';
import maplibregl from 'maplibre-gl';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import WebMercatorViewport from 'viewport-mercator-project';

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
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  // Calculate initial viewport based on bounding box
  const { longitude, latitude, zoom } = useMemo(() => {
    if (!boundingBox || !mapContainerRef.current) {
      return { longitude: 0, latitude: 0, zoom: 12 };
    }

    const { offsetWidth: windowWidth, offsetHeight: windowHeight } =
      mapContainerRef.current;

    const viewport = new WebMercatorViewport({
      width: windowWidth - 50,
      height: windowHeight - 50,
    });

    const routeBbox = bbox({
      type: boundingBox.type,
      coordinates: boundingBox.coordinates,
    });

    return viewport.fitBounds([
      [routeBbox[0], routeBbox[1]],
      [routeBbox[2], routeBbox[3]],
    ]);
  }, [boundingBox]);

  // Initialize map when component mounts
  useEffect(() => {
    const newMap = new maplibregl.Map({
      container: mapContainerRef.current || '',
      style: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILERTOKEN}`,
      center: initialViewState
        ? initialViewState.center
        : [longitude, latitude],
      zoom: initialViewState ? initialViewState.zoom : zoom,
    });

    newMap.addControl(new maplibregl.NavigationControl(), 'top-right');

    newMap.on('load', () => {
      sources.forEach((source) => {
        newMap.addSource(source.id, source.source);
      });

      layers.forEach(({ layer, beforeId }) => {
        newMap.addLayer(layer, beforeId);
      });
    });

    setMap(newMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [longitude, latitude, zoom]);

  // Update map when sources change
  useEffect(() => {
    if (map) {
      sources.forEach((source) => {
        try {
          // @ts-expect-error Weird typing within the mapbox-gl library
          map.getSource(source.id)?.setData(source.source.data);
        } catch (error) {
          console.error('An error occurred:', error);
        }
      });
    }
  }, [sources, map]);

  return (
    <div ref={mapContainerRef} className={twMerge(['size-full', className])} />
  );
}
