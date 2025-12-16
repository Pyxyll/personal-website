import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Dylan Collins - Software Developer';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  // Load JetBrains Mono for better ASCII art rendering
  const fontData = await fetch(
    new URL('https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPQ.ttf')
  ).then((res) => res.arrayBuffer());

  const asciiLines = [
    '+---------------------------------------------------------------+',
    '|                                                               |',
    '|   ____        _               ____      _ _ _                 |',
    '|  |  _ \\ _   _| | __ _ _ __   / ___|___ | | (_)_ __  ___       |',
    '|  | | | | | | | |/ _` | \'_ \\ | |   / _ \\| | | | \'_ \\/ __|      |',
    '|  | |_| | |_| | | (_| | | | || |__| (_) | | | | | | \\__ \\      |',
    '|  |____/ \\__, |_|\\__,_|_| |_| \\____\\___/|_|_|_|_| |_|___/      |',
    '|         |___/                                                 |',
    '|                                                               |',
    '+---------------------------------------------------------------+',
  ];

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'JetBrains Mono',
        }}
      >
        {/* ASCII Art Banner */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: '#e0e0e0',
            fontSize: '20px',
            lineHeight: '1.15',
          }}
        >
          {asciiLines.map((line, i) => (
            <div key={i} style={{ display: 'flex', whiteSpace: 'pre' }}>
              {line}
            </div>
          ))}
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '32px',
            fontSize: '26px',
            letterSpacing: '0.1em',
          }}
        >
          <span style={{ color: '#888888' }}>Developer</span>
          <span style={{ color: '#6366f1', margin: '0 16px' }}>/</span>
          <span style={{ color: '#888888' }}>Creator</span>
          <span style={{ color: '#6366f1', margin: '0 16px' }}>/</span>
          <span style={{ color: '#888888' }}>Builder</span>
        </div>

        {/* Website URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            color: '#6366f1',
            fontSize: '22px',
            letterSpacing: '0.05em',
          }}
        >
          dylancollins.me
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'JetBrains Mono',
          data: fontData,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  );
}
