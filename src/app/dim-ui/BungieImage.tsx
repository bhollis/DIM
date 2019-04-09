import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames';
import styles from './BungieImage.m.scss';

/**
 * A relative path to a Bungie.net image asset.
 */
export type BungieImagePath = string;

interface BungieImageProps {
  src: BungieImagePath;
}

/**
 * An image tag that links its src to bungie.net. Other props pass through to the underlying image.
 */
export default function BungieImage(
  props: BungieImageProps & React.ImgHTMLAttributes<HTMLImageElement>
) {
  const { src, ...otherProps } = props;

  const [downloaded, setDownloaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    let image: HTMLImageElement | undefined;
    let observer: IntersectionObserver | undefined = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const { isIntersecting } = entry;

        if (isIntersecting) {
          image = new Image();
          image.onload = () => {
            setDownloaded(true);

            if (observer) {
              observer.disconnect();
              observer = undefined;
            }
          };

          image.src = bungieNetPath(src);
        }
      });
    });

    observer.observe(ref.current!);

    return () => {
      if (observer) {
        observer.disconnect();
      }
      if (image) {
        image.src = '';
      }
    };
  }, []);

  return (
    <img
      ref={ref}
      className={classNames(styles.bungieImage, { [styles.downloaded]: downloaded })}
      src={bungieNetPath(src)}
      {...otherProps}
    />
  );
}

/**
 * Produce a style object that sets the background image to an image on bungie.net.
 */
export function bungieBackgroundStyle(src: BungieImagePath) {
  return { backgroundImage: `url(${bungieNetPath(src)})` };
}

/**
 * Expand a relative bungie.net asset path to a full path.
 */
export function bungieNetPath(src: BungieImagePath): string {
  if (!src) {
    return '';
  }
  if (src.startsWith('~')) {
    const baseUrl = $DIM_FLAVOR === 'dev' ? '' : 'https://beta.destinyitemmanager.com';
    return `${baseUrl}${src.substr(1)}`;
  }
  return `https://www.bungie.net${src}`;
}
