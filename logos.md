(pnpm dlx shadcn@latest add https://reactbits.dev/r/LogoLoop-TS-TW)

usage
(import LogoLoop from './LogoLoop';
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss } from 'react-icons/si';

const techLogos = [
  { node: <SiReact />, title: "React", href: "https://react.dev" },
  { node: <SiNextdotjs />, title: "Next.js", href: "https://nextjs.org" },
  { node: <SiTypescript />, title: "TypeScript", href: "https://www.typescriptlang.org" },
  { node: <SiTailwindcss />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
];

// Alternative with image sources
const imageLogos = [
  { src: "/logos/company1.png", alt: "Company 1", href: "https://company1.com" },
  { src: "/logos/company2.png", alt: "Company 2", href: "https://company2.com" },
  { src: "/logos/company3.png", alt: "Company 3", href: "https://company3.com" },
];

function App() {
  return (
    <div style={{ height: '200px', position: 'relative', overflow: 'hidden'}}>
      <LogoLoop
        logos={techLogos}
        speed={120}
        direction="left"
        logoHeight={48}
        gap={40}
        pauseOnHover
        scaleOnHover
        fadeOut
        fadeOutColor="#ffffff"
        ariaLabel="Technology partners"
      />
    </div>
  );
})

code
(import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type LogoItem =
  | {
      node: React.ReactNode;
      href?: string;
      title?: string;
      ariaLabel?: string;
    }
  | {
      src: string;
      alt?: string;
      href?: string;
      title?: string;
      srcSet?: string;
      sizes?: string;
      width?: number;
      height?: number;
    };

export interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  direction?: 'left' | 'right';
  width?: number | string;
  logoHeight?: number;
  gap?: number;
  pauseOnHover?: boolean;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ANIMATION_CONFIG = {
  SMOOTH_TAU: 0.25,
  MIN_COPIES: 2,
  COPY_HEADROOM: 2
} as const;

const toCssLength = (value?: number | string): string | undefined =>
  typeof value === 'number' ? `${value}px` : (value ?? undefined);

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

const useResizeObserver = (
  callback: () => void,
  elements: Array<React.RefObject<Element | null>>,
  dependencies: React.DependencyList
) => {
  useEffect(() => {
    if (!window.ResizeObserver) {
      const handleResize = () => callback();
      window.addEventListener('resize', handleResize);
      callback();
      return () => window.removeEventListener('resize', handleResize);
    }

    const observers = elements.map(ref => {
      if (!ref.current) return null;
      const observer = new ResizeObserver(callback);
      observer.observe(ref.current);
      return observer;
    });

    callback();

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, dependencies);
};

const useImageLoader = (
  seqRef: React.RefObject<HTMLUListElement | null>,
  onLoad: () => void,
  dependencies: React.DependencyList
) => {
  useEffect(() => {
    const images = seqRef.current?.querySelectorAll('img') ?? [];

    if (images.length === 0) {
      onLoad();
      return;
    }

    let remainingImages = images.length;
    const handleImageLoad = () => {
      remainingImages -= 1;
      if (remainingImages === 0) {
        onLoad();
      }
    };

    images.forEach(img => {
      const htmlImg = img as HTMLImageElement;
      if (htmlImg.complete) {
        handleImageLoad();
      } else {
        htmlImg.addEventListener('load', handleImageLoad, { once: true });
        htmlImg.addEventListener('error', handleImageLoad, { once: true });
      }
    });

    return () => {
      images.forEach(img => {
        img.removeEventListener('load', handleImageLoad);
        img.removeEventListener('error', handleImageLoad);
      });
    };
  }, dependencies);
};

const useAnimationLoop = (
  trackRef: React.RefObject<HTMLDivElement | null>,
  targetVelocity: number,
  seqWidth: number,
  isHovered: boolean,
  pauseOnHover: boolean
) => {
  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (seqWidth > 0) {
      offsetRef.current = ((offsetRef.current % seqWidth) + seqWidth) % seqWidth;
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    }

    if (prefersReduced) {
      track.style.transform = 'translate3d(0, 0, 0)';
      return () => {
        lastTimestampRef.current = null;
      };
    }

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaTime = Math.max(0, timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      const target = pauseOnHover && isHovered ? 0 : targetVelocity;

      const easingFactor = 1 - Math.exp(-deltaTime / ANIMATION_CONFIG.SMOOTH_TAU);
      velocityRef.current += (target - velocityRef.current) * easingFactor;

      if (seqWidth > 0) {
        let nextOffset = offsetRef.current + velocityRef.current * deltaTime;
        nextOffset = ((nextOffset % seqWidth) + seqWidth) % seqWidth;
        offsetRef.current = nextOffset;

        const translateX = -offsetRef.current;
        track.style.transform = `translate3d(${translateX}px, 0, 0)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimestampRef.current = null;
    };
  }, [targetVelocity, seqWidth, isHovered, pauseOnHover]);
};

export const LogoLoop = React.memo<LogoLoopProps>(
  ({
    logos,
    speed = 120,
    direction = 'left',
    width = '100%',
    logoHeight = 28,
    gap = 32,
    pauseOnHover = true,
    fadeOut = false,
    fadeOutColor,
    scaleOnHover = false,
    ariaLabel = 'Partner logos',
    className,
    style
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const seqRef = useRef<HTMLUListElement>(null);

    const [seqWidth, setSeqWidth] = useState<number>(0);
    const [copyCount, setCopyCount] = useState<number>(ANIMATION_CONFIG.MIN_COPIES);
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const targetVelocity = useMemo(() => {
      const magnitude = Math.abs(speed);
      const directionMultiplier = direction === 'left' ? 1 : -1;
      const speedMultiplier = speed < 0 ? -1 : 1;
      return magnitude * directionMultiplier * speedMultiplier;
    }, [speed, direction]);

    const updateDimensions = useCallback(() => {
      const containerWidth = containerRef.current?.clientWidth ?? 0;
      const sequenceWidth = seqRef.current?.getBoundingClientRect?.()?.width ?? 0;

      if (sequenceWidth > 0) {
        setSeqWidth(Math.ceil(sequenceWidth));
        const copiesNeeded = Math.ceil(containerWidth / sequenceWidth) + ANIMATION_CONFIG.COPY_HEADROOM;
        setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, copiesNeeded));
      }
    }, []);

    useResizeObserver(updateDimensions, [containerRef, seqRef], [logos, gap, logoHeight]);

    useImageLoader(seqRef, updateDimensions, [logos, gap, logoHeight]);

    useAnimationLoop(trackRef, targetVelocity, seqWidth, isHovered, pauseOnHover);

    const cssVariables = useMemo(
      () =>
        ({
          '--logoloop-gap': `${gap}px`,
          '--logoloop-logoHeight': `${logoHeight}px`,
          ...(fadeOutColor && { '--logoloop-fadeColor': fadeOutColor })
        }) as React.CSSProperties,
      [gap, logoHeight, fadeOutColor]
    );

    const rootClasses = useMemo(
      () =>
        cx(
          'relative overflow-x-hidden group',
          '[--logoloop-gap:32px]',
          '[--logoloop-logoHeight:28px]',
          '[--logoloop-fadeColorAuto:#ffffff]',
          'dark:[--logoloop-fadeColorAuto:#0b0b0b]',
          scaleOnHover && 'py-[calc(var(--logoloop-logoHeight)*0.1)]',
          className
        ),
      [scaleOnHover, className]
    );

    const handleMouseEnter = useCallback(() => {
      if (pauseOnHover) setIsHovered(true);
    }, [pauseOnHover]);

    const handleMouseLeave = useCallback(() => {
      if (pauseOnHover) setIsHovered(false);
    }, [pauseOnHover]);

    const renderLogoItem = useCallback(
      (item: LogoItem, key: React.Key) => {
        const isNodeItem = 'node' in item;

        const content = isNodeItem ? (
          <span
            className={cx(
              'inline-flex items-center',
              'motion-reduce:transition-none',
              scaleOnHover &&
                'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/item:scale-120'
            )}
            aria-hidden={!!(item as any).href && !(item as any).ariaLabel}
          >
            {(item as any).node}
          </span>
        ) : (
          <img
            className={cx(
              'h-[var(--logoloop-logoHeight)] w-auto block object-contain',
              '[-webkit-user-drag:none] pointer-events-none',
              '[image-rendering:-webkit-optimize-contrast]',
              'motion-reduce:transition-none',
              scaleOnHover &&
                'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/item:scale-120'
            )}
            src={(item as any).src}
            srcSet={(item as any).srcSet}
            sizes={(item as any).sizes}
            width={(item as any).width}
            height={(item as any).height}
            alt={(item as any).alt ?? ''}
            title={(item as any).title}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        );

        const itemAriaLabel = isNodeItem
          ? ((item as any).ariaLabel ?? (item as any).title)
          : ((item as any).alt ?? (item as any).title);

        const inner = (item as any).href ? (
          <a
            className={cx(
              'inline-flex items-center no-underline rounded',
              'transition-opacity duration-200 ease-linear',
              'hover:opacity-80',
              'focus-visible:outline focus-visible:outline-current focus-visible:outline-offset-2'
            )}
            href={(item as any).href}
            aria-label={itemAriaLabel || 'logo link'}
            target="_blank"
            rel="noreferrer noopener"
          >
            {content}
          </a>
        ) : (
          content
        );

        return (
          <li
            className={cx(
              'flex-none mr-[var(--logoloop-gap)] text-[length:var(--logoloop-logoHeight)] leading-[1]',
              scaleOnHover && 'overflow-visible group/item'
            )}
            key={key}
            role="listitem"
          >
            {inner}
          </li>
        );
      },
      [scaleOnHover]
    );

    const logoLists = useMemo(
      () =>
        Array.from({ length: copyCount }, (_, copyIndex) => (
          <ul
            className="flex items-center"
            key={`copy-${copyIndex}`}
            role="list"
            aria-hidden={copyIndex > 0}
            ref={copyIndex === 0 ? seqRef : undefined}
          >
            {logos.map((item, itemIndex) => renderLogoItem(item, `${copyIndex}-${itemIndex}`))}
          </ul>
        )),
      [copyCount, logos, renderLogoItem]
    );

    const containerStyle = useMemo(
      (): React.CSSProperties => ({
        width: toCssLength(width) ?? '100%',
        ...cssVariables,
        ...style
      }),
      [width, cssVariables, style]
    );

    return (
      <div
        ref={containerRef}
        className={rootClasses}
        style={containerStyle}
        role="region"
        aria-label={ariaLabel}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {fadeOut && (
          <>
            <div
              aria-hidden
              className={cx(
                'pointer-events-none absolute inset-y-0 left-0 z-[1]',
                'w-[clamp(24px,8%,120px)]',
                'bg-[linear-gradient(to_right,var(--logoloop-fadeColor,var(--logoloop-fadeColorAuto))_0%,rgba(0,0,0,0)_100%)]'
              )}
            />
            <div
              aria-hidden
              className={cx(
                'pointer-events-none absolute inset-y-0 right-0 z-[1]',
                'w-[clamp(24px,8%,120px)]',
                'bg-[linear-gradient(to_left,var(--logoloop-fadeColor,var(--logoloop-fadeColorAuto))_0%,rgba(0,0,0,0)_100%)]'
              )}
            />
          </>
        )}

        <div
          className={cx('flex w-max will-change-transform select-none', 'motion-reduce:transform-none')}
          ref={trackRef}
        >
          {logoLists}
        </div>
      </div>
    );
  }
);

LogoLoop.displayName = 'LogoLoop';

export default LogoLoop;
)


as techlogos devem ser as seguintes:

AWS: <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g fill="#ffffff"> <path d="M4.51 7.687c0 .197.02.357.058.475.042.117.096.245.17.384a.233.233 0 01.037.123c0 .053-.032.107-.1.16l-.336.224a.255.255 0 01-.138.048c-.054 0-.107-.026-.16-.074a1.652 1.652 0 01-.192-.251 4.137 4.137 0 01-.164-.315c-.416.491-.937.737-1.565.737-.447 0-.804-.129-1.064-.385-.261-.256-.394-.598-.394-1.025 0-.454.16-.822.484-1.1.325-.278.756-.416 1.304-.416.18 0 .367.016.564.042.197.027.4.07.612.118v-.39c0-.406-.085-.689-.25-.854-.17-.166-.458-.246-.868-.246-.186 0-.377.022-.574.07a4.23 4.23 0 00-.575.181 1.525 1.525 0 01-.186.07.326.326 0 01-.085.016c-.075 0-.112-.054-.112-.166v-.262c0-.085.01-.15.037-.186a.399.399 0 01.15-.113c.185-.096.409-.176.67-.24.26-.07.537-.101.83-.101.633 0 1.096.144 1.394.432.293.288.442.726.442 1.314v1.73h.01zm-2.161.811c.175 0 .356-.032.548-.096.192-.064.362-.182.505-.342a.848.848 0 00.181-.341c.032-.129.054-.283.054-.465V7.03a4.43 4.43 0 00-.49-.09 3.996 3.996 0 00-.5-.033c-.357 0-.617.07-.793.214-.176.144-.26.347-.26.614 0 .25.063.437.196.566.128.133.314.197.559.197zm4.273.577c-.096 0-.16-.016-.202-.054-.043-.032-.08-.106-.112-.208l-1.25-4.127a.938.938 0 01-.048-.214c0-.085.042-.133.127-.133h.522c.1 0 .17.016.207.053.043.032.075.107.107.208l.894 3.535.83-3.535c.026-.106.058-.176.101-.208a.365.365 0 01.213-.053h.426c.1 0 .17.016.212.053.043.032.08.107.102.208l.84 3.578.92-3.578a.459.459 0 01.107-.208.347.347 0 01.208-.053h.495c.085 0 .133.043.133.133 0 .027-.006.054-.01.086a.768.768 0 01-.038.133l-1.283 4.127c-.031.107-.069.177-.111.209a.34.34 0 01-.203.053h-.457c-.101 0-.17-.016-.213-.053-.043-.038-.08-.107-.101-.214L8.213 5.37l-.82 3.439c-.026.107-.058.176-.1.213-.043.038-.118.054-.213.054h-.458zm6.838.144a3.51 3.51 0 01-.82-.096c-.266-.064-.473-.134-.612-.214-.085-.048-.143-.101-.165-.15a.38.38 0 01-.031-.149v-.272c0-.112.042-.166.122-.166a.3.3 0 01.096.016c.032.011.08.032.133.054.18.08.378.144.585.187.213.042.42.064.633.064.336 0 .596-.059.777-.176a.575.575 0 00.277-.508.52.52 0 00-.144-.373c-.095-.102-.276-.193-.537-.278l-.772-.24c-.388-.123-.676-.305-.851-.545a1.275 1.275 0 01-.266-.774c0-.224.048-.422.143-.593.096-.17.224-.32.384-.438.16-.122.34-.213.553-.277.213-.064.436-.091.67-.091.118 0 .24.005.357.021.122.016.234.038.346.06.106.026.208.052.303.085.096.032.17.064.224.096a.461.461 0 01.16.133.289.289 0 01.047.176v.251c0 .112-.042.171-.122.171a.552.552 0 01-.202-.064 2.428 2.428 0 00-1.022-.208c-.303 0-.543.048-.708.15-.165.1-.25.256-.25.475 0 .149.053.277.16.379.106.101.303.202.585.293l.756.24c.383.123.66.294.825.513.165.219.244.47.244.748 0 .23-.047.437-.138.619a1.435 1.435 0 01-.388.47c-.165.133-.362.23-.591.299-.24.075-.49.112-.761.112z"></path> <path fill-rule="evenodd" d="M14.465 11.813c-1.75 1.297-4.294 1.986-6.481 1.986-3.065 0-5.827-1.137-7.913-3.027-.165-.15-.016-.353.18-.235 2.257 1.313 5.04 2.109 7.92 2.109 1.941 0 4.075-.406 6.039-1.239.293-.133.543.192.255.406z" clip-rule="evenodd"></path> <path fill-rule="evenodd" d="M15.194 10.98c-.223-.287-1.479-.138-2.048-.069-.17.022-.197-.128-.043-.24 1-.705 2.645-.502 2.836-.267.192.24-.053 1.89-.99 2.68-.143.123-.281.06-.217-.1.212-.53.686-1.72.462-2.003z" clip-rule="evenodd"></path> </g> </g></svg>

Azure: <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g fill="#ffffff"> <path d="M7.47 12.412l3.348-.592.031-.007-1.722-2.049a291.474 291.474 0 01-1.723-2.058c0-.01 1.779-4.909 1.789-4.926a788.95 788.95 0 012.934 5.066l2.95 5.115.023.039-10.948-.001 3.317-.587zM.9 11.788c0-.003.811-1.412 1.803-3.131L4.507 5.53l2.102-1.764C7.765 2.797 8.714 2 8.717 2a.37.37 0 01-.033.085L6.4 6.981 4.16 11.789l-1.63.002c-.897.001-1.63 0-1.63-.003z"></path> </g> </g></svg>

Google Cloud: <svg viewBox="0 -25 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid" fill="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M170.2517,56.8186 L192.5047,34.5656 L193.9877,25.1956 C153.4367,-11.6774 88.9757,-7.4964 52.4207,33.9196 C42.2667,45.4226 34.7337,59.7636 30.7167,74.5726 L38.6867,73.4496 L83.1917,66.1106 L86.6277,62.5966 C106.4247,40.8546 139.8977,37.9296 162.7557,56.4286 L170.2517,56.8186 Z" fill="#c7c7c7"> </path> <path d="M224.2048,73.9182 C219.0898,55.0822 208.5888,38.1492 193.9878,25.1962 L162.7558,56.4282 C175.9438,67.2042 183.4568,83.4382 183.1348,100.4652 L183.1348,106.0092 C198.4858,106.0092 210.9318,118.4542 210.9318,133.8052 C210.9318,149.1572 198.4858,161.2902 183.1348,161.2902 L127.4638,161.2902 L121.9978,167.2242 L121.9978,200.5642 L127.4638,205.7952 L183.1348,205.7952 C223.0648,206.1062 255.6868,174.3012 255.9978,134.3712 C256.1858,110.1682 244.2528,87.4782 224.2048,73.9182" fill="#ffffff"> </path> <path d="M71.8704,205.7957 L127.4634,205.7957 L127.4634,161.2897 L71.8704,161.2897 C67.9094,161.2887 64.0734,160.4377 60.4714,158.7917 L52.5844,161.2117 L30.1754,183.4647 L28.2234,191.0387 C40.7904,200.5277 56.1234,205.8637 71.8704,205.7957" fill="#afb1b0"> </path> <path d="M71.8704,61.4255 C31.9394,61.6635 -0.2366,94.2275 0.0014,134.1575 C0.1344,156.4555 10.5484,177.4455 28.2234,191.0385 L60.4714,158.7915 C46.4804,152.4705 40.2634,136.0055 46.5844,122.0155 C52.9044,108.0255 69.3704,101.8085 83.3594,108.1285 C89.5244,110.9135 94.4614,115.8515 97.2464,122.0155 L129.4944,89.7685 C115.7734,71.8315 94.4534,61.3445 71.8704,61.4255" fill="#ffffff"> </path> </g> </g></svg>

Docker: <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#ffffff" d="M12.342 4.536l.15-.227.262.159.116.083c.28.216.869.768.996 1.684.223-.04.448-.06.673-.06.534 0 .893.124 1.097.227l.105.057.068.045.191.156-.066.2a2.044 2.044 0 01-.47.73c-.29.299-.8.652-1.609.698l-.178.005h-.148c-.37.977-.867 2.078-1.702 3.066a7.081 7.081 0 01-1.74 1.488 7.941 7.941 0 01-2.549.968c-.644.125-1.298.187-1.953.185-1.45 0-2.73-.288-3.517-.792-.703-.449-1.243-1.182-1.606-2.177a8.25 8.25 0 01-.461-2.83.516.516 0 01.432-.516l.068-.005h10.54l.092-.007.149-.016c.256-.034.646-.11.92-.27-.328-.543-.421-1.178-.268-1.854a3.3 3.3 0 01.3-.81l.108-.187zM2.89 5.784l.04.007a.127.127 0 01.077.082l.006.04v1.315l-.006.041a.127.127 0 01-.078.082l-.039.006H1.478a.124.124 0 01-.117-.088l-.007-.04V5.912l.007-.04a.127.127 0 01.078-.083l.039-.006H2.89zm1.947 0l.039.007a.127.127 0 01.078.082l.006.04v1.315l-.007.041a.127.127 0 01-.078.082l-.039.006H3.424a.125.125 0 01-.117-.088L3.3 7.23V5.913a.13.13 0 01.085-.123l.039-.007h1.413zm1.976 0l.039.007a.127.127 0 01.077.082l.007.04v1.315l-.007.041a.127.127 0 01-.078.082l-.039.006H5.4a.124.124 0 01-.117-.088l-.006-.04V5.912l.006-.04a.127.127 0 01.078-.083l.039-.006h1.413zm1.952 0l.039.007a.127.127 0 01.078.082l.007.04v1.315a.13.13 0 01-.085.123l-.04.006H7.353a.124.124 0 01-.117-.088l-.006-.04V5.912l.006-.04a.127.127 0 01.078-.083l.04-.006h1.412zm1.97 0l.039.007a.127.127 0 01.078.082l.006.04v1.315a.13.13 0 01-.085.123l-.039.006H9.322a.124.124 0 01-.117-.088l-.006-.04V5.912l.006-.04a.127.127 0 01.078-.083l.04-.006h1.411zM4.835 3.892l.04.007a.127.127 0 01.077.081l.007.041v1.315a.13.13 0 01-.085.123l-.039.007H3.424a.125.125 0 01-.117-.09l-.007-.04V4.021a.13.13 0 01.085-.122l.039-.007h1.412zm1.976 0l.04.007a.127.127 0 01.077.081l.007.041v1.315a.13.13 0 01-.085.123l-.039.007H5.4a.125.125 0 01-.117-.09l-.006-.04V4.021l.006-.04a.127.127 0 01.078-.082l.039-.007h1.412zm1.953 0c.054 0 .1.037.117.088l.007.041v1.315a.13.13 0 01-.085.123l-.04.007H7.353a.125.125 0 01-.117-.09l-.006-.04V4.021l.006-.04a.127.127 0 01.078-.082l.04-.007h1.412zm0-1.892c.054 0 .1.037.117.088l.007.04v1.316a.13.13 0 01-.085.123l-.04.006H7.353a.124.124 0 01-.117-.088l-.006-.04V2.128l.006-.04a.127.127 0 01.078-.082L7.353 2h1.412z"></path></g></svg>

Kubernetes: <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M2.687 3.21l5.062 4.117c-.477.099-.837.53-.837 1.045 0 .133.024.26.067.377L1.706 4.462a.81.81 0 01-.124-1.126.776.776 0 011.105-.126z" fill="#ffffff"></path> <path d="M7.482 9.322L1.06 10.808a.786.786 0 01-.94-.603.801.801 0 01.592-.958L7.095 7.77a1.076 1.076 0 00-.183.602c0 .414.232.773.57.95z" fill="#ffffff"></path> <path d="M8.429 9.327l-2.905 6.12a.78.78 0 01-1.05.373.807.807 0 01-.365-1.07l2.86-6.028c.143.418.533.718.991.718.169 0 .328-.04.469-.113z" fill="#ffffff"></path> <path d="M8.97 8.66l2.89 6.09a.807.807 0 01-.365 1.07.78.78 0 01-1.05-.372l-2.89-6.091c.124.053.261.083.405.083.481 0 .886-.33 1.01-.78z" fill="#ffffff"></path> <path d="M8.462 9.31a1.07 1.07 0 00.546-.938c0-.233-.073-.448-.198-.624l6.478 1.499a.8.8 0 01.592.958.786.786 0 01-.94.603L8.462 9.31zM8.746.9v6.766a1.037 1.037 0 00-1.572 0V.901c0-.443.352-.801.786-.801.434 0 .786.358.786.8z" fill="#ffffff"></path> <path d="M13.234 3.21a.776.776 0 011.104.126.81.81 0 01-.123 1.126L8.94 8.749c.043-.117.067-.244.067-.377 0-.516-.36-.946-.837-1.045l5.063-4.117z" fill="#ffffff"></path> <path d="M7.96 3.302c-2.75 0-4.978 2.27-4.978 5.07 0 2.8 2.229 5.07 4.978 5.07 2.75 0 4.978-2.27 4.978-5.07 0-2.8-2.229-5.07-4.978-5.07zm-6.55 5.07c0-3.684 2.933-6.67 6.55-6.67 3.618 0 6.55 2.986 6.55 6.67 0 3.685-2.932 6.671-6.55 6.671-3.617 0-6.55-2.986-6.55-6.67z" fill="#ffffff"></path> </g></svg>

Terraform: <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g fill="#ffffff"> <path d="M1 0v5.05l4.349 2.527V2.526L1 0zM10.175 5.344l-4.35-2.525v5.05l4.35 2.527V5.344zM10.651 10.396V5.344L15 2.819v5.05l-4.349 2.527zM10.174 16l-4.349-2.526v-5.05l4.349 2.525V16z"></path> </g> </g></svg>

Jenkins: <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>jenkins</title> <g id="Layer_2" data-name="Layer 2"> <g id="invisible_box" data-name="invisible box"> <rect width="48" height="48" fill="none"></rect> </g> <g id="Q3_icons" data-name="Q3 icons"> <g id="surface1"> <path d="M26.4,2c-5.8,0-9.9,1-12.7,2.6A8.3,8.3,0,0,0,9.4,9.9a4.9,4.9,0,0,0-1.7,1.8c-.9,1.4-1.2,3.7-.4,7.2a5.5,5.5,0,0,0-2.2,3.7,5.9,5.9,0,0,0,1.5,4.9,6.1,6.1,0,0,0,3.2,1.9c.4.1.4,0,.7,0a22.2,22.2,0,0,0,1.8,5L7.6,37.1l-3.5,2-1.2.8-.4.3-.2.2s-.2.1-.2.5v.7L3.8,46H42.5l.2-.8s.2-1.3.5-2.8a23.3,23.3,0,0,0,.4-4.1,1.2,1.2,0,0,0-.2-.7l-.3-.3-.8-.6-2-1.3-2-1.2a15.2,15.2,0,0,0,2-3.6,29.2,29.2,0,0,0,1.8-13.4c-.4-5.6-2.3-9.5-5.2-11.9A15.4,15.4,0,0,0,27.4,2h-1Zm.7,1.9a13.3,13.3,0,0,1,8.6,2.9,12,12,0,0,1,3.1,4.1l-1.1-.3H34.9l.3,1.9a7,7,0,0,1,2.2,0,2.5,2.5,0,0,1,2.4,2.2h.1a9,9,0,0,1,.2,1.8,2,2,0,0,0-.4-.8l-1-1.7-1.6.9a15.6,15.6,0,0,1,.9,1.7,4.1,4.1,0,0,1,.6,1.1,7,7,0,0,1-2.3-.4l-.6,1.9a10.8,10.8,0,0,0,3,.4,2.8,2.8,0,0,0,1.3-.3h.3a26.8,26.8,0,0,1-1.8,10.7,14.6,14.6,0,0,1-2,3.6h0a7.4,7.4,0,0,1-6.2,3c-4.5,0-8.6-2.1-9.9-3.5a7,7,0,0,1-1.6-3.3l-1.9.3A8.4,8.4,0,0,0,19,34.2a11.8,11.8,0,0,0,2.7,2,2.2,2.2,0,0,0-1.4.9.4.4,0,0,0-.1.3,8.7,8.7,0,0,1-4.6-1.6,5.2,5.2,0,0,1-1.2-1.3v-.2a19.1,19.1,0,0,1-1.9-5.1,5.2,5.2,0,0,0,1.5-1.9l-1.7-.9a4.8,4.8,0,0,1-.8,1.2h-.3a1.6,1.6,0,0,1-.9-.1A3.7,3.7,0,0,1,8,26.2a4.3,4.3,0,0,1-1-3.4,3.5,3.5,0,0,1,1.7-2.7h0a3.1,3.1,0,0,1,2.1-.6,1.2,1.2,0,0,1,.8.6,6.6,6.6,0,0,1,.5,2v1.5l3.8-1.9v-.6a7.6,7.6,0,0,0-.5-2.3,4.1,4.1,0,0,1,.3-2.8,21.3,21.3,0,0,0,1.1-3.3,3.7,3.7,0,0,0-.4-2.7,8.8,8.8,0,0,1,1.9-2.6A12.2,12.2,0,0,1,27.1,3.9Zm-8.7.9L16.9,6.1a10.7,10.7,0,0,0-2,2.6h0a29.8,29.8,0,0,0-3.4.6,7,7,0,0,1,3.1-3.1A20.4,20.4,0,0,1,18.4,4.8Zm5.4,5.6a4.9,4.9,0,0,0-3.7,1.5,6,6,0,0,0-1.3,2.3l1.9.4a2.7,2.7,0,0,1,.8-1.4c.6-.6,1.6-1.2,3.8-.7l.4-1.9Zm-9.3.3a1.7,1.7,0,0,1,.5,1.6c-.1.6-.7,1.8-1.1,3a5.8,5.8,0,0,0-.3,4.1,9,9,0,0,1,.3,1.2h-.2a4.4,4.4,0,0,0-.5-1.5,3,3,0,0,0-2-1.6,4.9,4.9,0,0,0-2.3.3c-.5-2.8-.1-4.4.4-5.3l.8-.9h0A24.6,24.6,0,0,1,14.5,10.7Zm12.8,3.4-1.8.7.7,1.8a14.7,14.7,0,0,0,1,2.2,5.2,5.2,0,0,1-2.3-.5l-.8,1.8a6.4,6.4,0,0,0,3.6.6,1.8,1.8,0,0,0,1.3-.8,1.5,1.5,0,0,0,0-1.7,13.8,13.8,0,0,1-1-2.3Zm5.8,1.3H31.2a9.6,9.6,0,0,0,3.2,6.4,11.7,11.7,0,0,1,2,2.2h-.1a7.2,7.2,0,0,1-2.2,1.1,9.3,9.3,0,0,1-2.9.6H31a4.3,4.3,0,0,1,.1-.5l-1.7-.7a3.3,3.3,0,0,0-.3,1.3,2.4,2.4,0,0,0,.5,1.3,2.3,2.3,0,0,0,1.6.6,9.1,9.1,0,0,0,3.5-.7,8.7,8.7,0,0,0,2.9-1.4,2.1,2.1,0,0,0,.7-1.1,1.7,1.7,0,0,0-.1-1.4,11.3,11.3,0,0,0-2.5-2.8A7.6,7.6,0,0,1,33.1,15.4ZM9.6,21.3a4.1,4.1,0,0,0-1.3,3.8l1.9-.3a1.9,1.9,0,0,1,.6-2ZM27,27.1l-1.2,1.5a10.7,10.7,0,0,0,7.5,2.1L33,28.8A8.3,8.3,0,0,1,27,27.1Zm10.2.1A6.1,6.1,0,0,1,34,28.8l.2,1.9a7.2,7.2,0,0,0,4.4-2.2ZM26.4,30.4l-1.9.6a4.3,4.3,0,0,0,2.2,2.4,7.4,7.4,0,0,0,2.9.5,12.4,12.4,0,0,0,3.7-.4l-.4-1.8a12,12,0,0,1-3.2.3,5.1,5.1,0,0,1-2.2-.4A1.9,1.9,0,0,1,26.4,30.4ZM37,35.7,39.3,37l1.9,1.3.5.3c0,.5-.2,2.1-.4,3.5l-.4,2H37.4a2.3,2.3,0,0,0,1.1-1.3,12.4,12.4,0,0,0,.4-1.6,27.8,27.8,0,0,0,0-2.9,3.6,3.6,0,0,0-1.6-2.3H37Zm-23.9.4a11.3,11.3,0,0,0,1.7,2.7,16.4,16.4,0,0,0,5,4c.1.4.1.7.2,1.1a.3.3,0,0,1,.1.2H5.1L4,41.5a5.2,5.2,0,0,1,1.1-.7l3.4-2.1Zm22.4,1.3.9.2a1.2,1.2,0,0,1,.6.9,18.9,18.9,0,0,1,0,2.4,2.5,2.5,0,0,1-.2,1c-.1.3-.2.4-.3.4a5.1,5.1,0,0,1-2.5.2l-1.5-.3H28.9l-2.3.9a15.3,15.3,0,0,1-4,.9h-.5c0-.1-.1-.2-.2-.6a19.6,19.6,0,0,1-.2-4h0a1.7,1.7,0,0,1,.1-1.1l.7-.3a5.5,5.5,0,0,1,2.8.7h0l3.8,1.7h1.5l.3-.3,2.3-1.6,1.3-.7.6-.2h.1C35.2,37.4,35.3,37.4,35.5,37.4Zm-6,.9h0Zm-11.9.5a7.8,7.8,0,0,0,2.2.4v.3h0v1A15.3,15.3,0,0,1,17.6,38.8Z"></path> </g> </g> </g> </g></svg>

GitLab: <svg viewBox="0 0 48 48" id="Layer_2" data-name="Layer 2" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><defs><style>.cls-1{fill:none;stroke:#ffffff;stroke-linecap:round;stroke-linejoin:round;}</style></defs><path id="path50" class="cls-1" d="M24,42h0l7.18-22.1H16.82L24,42Z"></path><path id="path66" class="cls-1" d="M6.76,19.86h0L4.57,26.57a1.5,1.5,0,0,0,.54,1.67L24,42,6.76,19.86Z"></path><path id="path74" class="cls-1" d="M6.76,19.86H16.82L12.49,6.55a.74.74,0,0,0-1.41,0L6.76,19.86Z"></path><path id="path82" class="cls-1" d="M41.25,19.86h0l2.18,6.71a1.5,1.5,0,0,1-.54,1.67L24,42l17.25-22.1Z"></path><path id="path86" class="cls-1" d="M41.25,19.86H31.18L35.51,6.55a.74.74,0,0,1,1.41,0l4.33,13.31Z"></path><polygon class="cls-1" points="24 41.96 31.18 19.86 41.25 19.86 24 41.96"></polygon><polygon class="cls-1" points="24 41.96 6.76 19.86 16.82 19.86 24 41.96"></polygon></g></svg>

Github: <svg viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>github [#ffffff]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-140.000000, -7559.000000)" fill="#ffffff"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M94,7399 C99.523,7399 104,7403.59 104,7409.253 C104,7413.782 101.138,7417.624 97.167,7418.981 C96.66,7419.082 96.48,7418.762 96.48,7418.489 C96.48,7418.151 96.492,7417.047 96.492,7415.675 C96.492,7414.719 96.172,7414.095 95.813,7413.777 C98.04,7413.523 100.38,7412.656 100.38,7408.718 C100.38,7407.598 99.992,7406.684 99.35,7405.966 C99.454,7405.707 99.797,7404.664 99.252,7403.252 C99.252,7403.252 98.414,7402.977 96.505,7404.303 C95.706,7404.076 94.85,7403.962 94,7403.958 C93.15,7403.962 92.295,7404.076 91.497,7404.303 C89.586,7402.977 88.746,7403.252 88.746,7403.252 C88.203,7404.664 88.546,7405.707 88.649,7405.966 C88.01,7406.684 87.619,7407.598 87.619,7408.718 C87.619,7412.646 89.954,7413.526 92.175,7413.785 C91.889,7414.041 91.63,7414.493 91.54,7415.156 C90.97,7415.418 89.522,7415.871 88.63,7414.304 C88.63,7414.304 88.101,7413.319 87.097,7413.247 C87.097,7413.247 86.122,7413.234 87.029,7413.87 C87.029,7413.87 87.684,7414.185 88.139,7415.37 C88.139,7415.37 88.726,7417.2 91.508,7416.58 C91.513,7417.437 91.522,7418.245 91.522,7418.489 C91.522,7418.76 91.338,7419.077 90.839,7418.982 C86.865,7417.627 84,7413.783 84,7409.253 C84,7403.59 88.478,7399 94,7399" id="github-[#ffffff]"> </path> </g> </g> </g> </g></svg>

Prometheus: <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><title>file_type_prometheus</title><path d="M16,30c-2.506,0-4.539-1.674-4.539-3.739h9.077C20.539,28.325,18.507,30,16,30Z" style="fill:#ffffff"></path><polygon points="23.496 25.023 8.503 25.023 8.503 22.304 23.497 22.304 23.497 25.023 23.496 25.023" style="fill:#ffffff"></polygon><path d="M23.443,20.9H8.546c-.05-.057-.1-.113-.148-.171A10.867,10.867,0,0,1,6.15,16.905c-.006-.033,1.861.381,3.185.679,0,0,.681.158,1.677.339a6.225,6.225,0,0,1-1.524-4c0-3.2,2.452-5.992,1.568-8.25.861.07,1.782,1.817,1.844,4.549a9.769,9.769,0,0,0,1.3-4.992c0-1.467.966-3.17,1.933-3.229-.862,1.42.223,2.638,1.188,5.658.362,1.134.316,3.044.595,4.254.093-2.515.525-6.184,2.12-7.45-.7,1.6.1,3.591.657,4.551a8.623,8.623,0,0,1,1.432,4.94,6.17,6.17,0,0,1-1.476,3.983c1.053-.2,1.781-.376,1.781-.376l3.421-.667A9.7,9.7,0,0,1,23.443,20.9Z" style="fill:#ffffff"></path></g></svg>

Grafana: <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#ffffff" d="M13.985 7.175a4.408 4.408 0 00-.138-.802 5.035 5.035 0 00-1.054-1.998 2.96 2.96 0 00-.366-.393c.198-.787-.245-1.468-.245-1.468-.764-.046-1.237.227-1.42.363-.031-.015-.062-.03-.092-.03-.122-.046-.26-.106-.397-.137-.138-.045-.275-.075-.413-.12-.137-.031-.29-.061-.443-.092-.03 0-.046 0-.076-.015C9.005 1.44 8.058 1 8.058 1 7.004 1.666 6.79 2.604 6.79 2.604s0 .015-.016.06l-.183.046c-.076.03-.168.06-.244.076-.077.03-.168.06-.245.09-.153.076-.32.152-.473.228-.153.09-.306.181-.443.272-.016-.015-.03-.015-.03-.015-1.467-.545-2.766.136-2.766.136-.122 1.544.58 2.528.733 2.71-.03.09-.06.196-.091.287a8.104 8.104 0 00-.245 1.09c0 .06-.015.106-.015.166C1.397 8.386 1 9.748 1 9.748c1.13 1.287 2.46 1.377 2.46 1.377.167.303.366.575.58.848.092.106.183.212.29.318a3.014 3.014 0 00.061 2.149c1.268.045 2.093-.545 2.261-.681.122.045.26.076.382.106.382.106.78.151 1.176.181h.49c.595.848 1.634.954 1.634.954.748-.772.779-1.544.779-1.71v-.015-.03-.03c.153-.107.305-.228.443-.35a5.37 5.37 0 00.779-.892c.015-.03.046-.06.061-.09.84.045 1.436-.515 1.436-.515-.138-.863-.642-1.287-.749-1.378l-.015-.015h-.015s-.015 0-.015-.015c0-.045.015-.106.015-.151 0-.091.015-.182.015-.288V9.4v-.166-.076-.152l-.015-.075c-.015-.091-.03-.197-.061-.288a3.506 3.506 0 00-.428-1.044 3.856 3.856 0 00-.718-.848 3.784 3.784 0 00-.901-.575 3.347 3.347 0 00-.993-.272c-.168-.015-.336-.03-.504-.03H9.37 9.204c-.092.015-.169.015-.26.03-.336.06-.642.181-.932.348-.275.166-.52.363-.718.605a2.579 2.579 0 00-.459.757 2.63 2.63 0 00-.183.817v.393c.015.137.046.273.077.394.076.258.183.485.336.666.137.197.32.348.504.485.183.12.382.212.58.272.199.06.382.076.565.076h.244c.031 0 .047 0 .062-.015.015 0 .046-.015.061-.015.046-.016.076-.016.122-.03l.23-.092a.869.869 0 00.198-.12c.015-.016.03-.03.046-.03a.129.129 0 00.015-.198c-.046-.06-.122-.075-.183-.03-.015.015-.03.015-.046.03-.046.03-.107.046-.168.06l-.183.046c-.03 0-.061.015-.092.015H8.73a1.519 1.519 0 01-.825-.378 1.452 1.452 0 01-.306-.378 1.655 1.655 0 01-.168-.485c-.015-.09-.015-.166-.015-.257v-.106-.03c0-.046.015-.091.015-.136.061-.364.26-.727.55-1 .077-.075.153-.136.23-.181.076-.06.167-.106.259-.151.092-.046.183-.076.29-.106a.993.993 0 01.306-.046h.321c.107.015.229.03.336.046.214.045.427.12.626.242.397.212.733.56.947.969.107.211.183.423.214.65.015.06.015.121.015.167v.363c0 .06-.015.121-.015.182 0 .06-.015.12-.03.181l-.046.182c-.03.121-.077.242-.123.363a3.183 3.183 0 01-.366.666 3.002 3.002 0 01-1.91 1.18c-.122.016-.26.03-.382.046h-.198c-.061 0-.138 0-.199-.015a3.637 3.637 0 01-.81-.151 4.068 4.068 0 01-.748-.303 4.098 4.098 0 01-1.696-1.695 4.398 4.398 0 01-.29-.742c-.076-.257-.107-.514-.137-.772v-.302-.091c0-.136.015-.258.03-.394s.046-.272.061-.393c.03-.137.061-.258.092-.394a5.33 5.33 0 01.275-.741c.214-.47.504-.893.855-1.226.092-.091.184-.167.275-.243.092-.075.184-.136.29-.211a5.39 5.39 0 01.306-.182c.046-.03.107-.045.153-.076a.26.26 0 01.076-.03.26.26 0 01.077-.03c.107-.046.229-.091.336-.121.03-.015.06-.015.091-.03.03-.016.061-.016.092-.03.061-.016.122-.031.168-.046.03-.015.061-.015.092-.015.03 0 .06-.016.091-.016.03 0 .061-.015.092-.015l.046-.015h.046c.03 0 .06-.015.091-.015.03 0 .061-.015.107-.015.03 0 .077-.015.107-.015h.764c.23.015.443.03.657.075.428.076.84.212 1.207.394.366.182.702.393.977.636l.046.045.046.045c.03.03.061.061.107.091l.092.091.091.09c.123.122.23.258.336.394.199.258.367.515.49.772.014.015.014.03.03.046.015.015.015.03.015.045l.046.09.046.092.045.09c.046.122.092.228.123.333.06.167.107.318.137.455.015.045.061.09.122.075a.104.104 0 00.107-.106c.092-.227.092-.393.077-.575z"></path></g></svg>