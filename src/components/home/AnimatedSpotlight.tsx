'use client';

export function AnimatedSpotlight() {
  return (
    <div className="orbit-container" suppressHydrationWarning>
      <div className="orbit orbit-left" suppressHydrationWarning>
        <div className="circle red" suppressHydrationWarning></div>
      </div>
      <div className="orbit orbit-right" suppressHydrationWarning>
        <div className="circle cyan" suppressHydrationWarning></div>
      </div>
    </div>
  );
}
