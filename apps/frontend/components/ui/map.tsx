import maplibregl from 'maplibre-gl';
import React, { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import 'maplibre-gl/dist/maplibre-gl.css';

type Source = {
  id: string;
  source: maplibregl.SourceSpecification;
};

type Layer = {
  layer: maplibregl.LayerSpecification;
  beforeId?: string;
};

type MapProps = {
  className?: string;
  initialViewState: {
    center: maplibregl.LngLatLike;
    zoom: number;
  };
  sources?: Source[];
  layers?: Layer[];
};

export default function Map({
  className,
  initialViewState,
  sources = [],
  layers = [],
}: MapProps) {
  if (process.env.NEXT_PUBLIC_MAPTILERTOKEN == null) {
    throw new Error('You have to configure env REACT_APP_API_KEY, see README');
  }

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!map) {
      const newMap = new maplibregl.Map({
        container: mapContainerRef.current || '',
        style: `https://api.maptiler.com/maps/outdoor-v2/style.json?key=${process.env.NEXT_PUBLIC_MAPTILERTOKEN}`,
        center: initialViewState.center,
        zoom: initialViewState.zoom,
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
    }

    return () => {
      map && map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
