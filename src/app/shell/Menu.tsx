import React, { useEffect } from 'react';
import { useSpring, animated, config } from 'react-spring';
import useDimensions from 'react-use-dimensions';
import { useDrag } from 'react-use-gesture';

const spring = {
  ...config.stiff,
  clamp: true
};

// The sheet is dismissed if it's flicked at a velocity above dismissVelocity or dragged down more than dismissAmount times the height of the sheet.
const dismissVelocity = 0.8;
const dismissAmount = 0.5;

export default function Menu({
  children,
  open,
  onDropdownOpen
}: {
  children: React.ReactNode;
  open: boolean;
  onDropdownOpen(open: boolean): void;
}) {
  const [ref, { width }] = useDimensions({ liveMeasure: false });

  const [springProps, setSpring] = useSpring(() => ({
    from: {
      transform: `translateX(-250px)`
    },
    to: {
      transform: `translateX(${open || !width ? 0 : 16 - width}px)`
    },
    config: spring
  }));
  useEffect(() => {
    setSpring({
      to: {
        transform: `translateX(${open || !width ? 0 : 16 - width}px)`
      }
    });
  }, [open, width]);

  // This handles all drag interaction. The callback is called without re-render.
  const bindDrag = useDrag(({ active, movement: [dx], vxvy: [vx], last }) => {
    // How far over should we be positioned?
    const xDelta = active ? (open ? Math.min(0, dx) : Math.min(Math.max(0, dx), width - 16)) : 0;

    console.log({ xDelta, active, dx, vx });
    // Set immediate (no animation) if we're in a gesture, so it follows your finger precisely
    setSpring({
      immediate: active,
      to: { transform: `translateX(${xDelta + (open ? 0 : 16 - width)}px)` }
    });

    // Detect if the gesture ended with a high velocity, or with the sheet more than
    // dismissAmount percent of the way down - if so, consider it a close gesture.
    if ((last && Math.abs(dx) > (width || 0) * dismissAmount) || Math.abs(vx) > dismissVelocity) {
      console.log('LAST', { dx, vx });
      onDropdownOpen(!open);
    }
  });

  console.log({ ref, width, springProps, open });

  return (
    <animated.div {...bindDrag()} className="dropdown" role="menu" ref={ref} style={springProps}>
      <div className="dropdown-inner">{children}</div>
    </animated.div>
  );
}
