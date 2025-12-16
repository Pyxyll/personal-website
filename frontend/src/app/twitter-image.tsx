import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Dylan Collins - Software Developer';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
        }}
      >
        {/* ASCII Art Banner */}
        <pre
          style={{
            color: '#e0e0e0',
            fontSize: '24px',
            lineHeight: '1.2',
            letterSpacing: '0px',
            whiteSpace: 'pre',
            textAlign: 'center',
          }}
        >
{`+---------------------------------------------------------------+
|                                                               |
|   ____        _               ____      _ _ _                 |
|  |  _ \\ _   _| | __ _ _ __   / ___|___ | | (_)_ __  ___       |
|  | | | | | | | |/ _\` | '_ \\ | |   / _ \\| | | | '_ \\/ __|      |
|  | |_| | |_| | | (_| | | | || |__| (_) | | | | | | \\__ \\      |
|  |____/ \\__, |_|\\__,_|_| |_| \\____\\___/|_|_|_|_| |_|___/      |
|         |___/                                                 |
|                                                               |
+---------------------------------------------------------------+`}
        </pre>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '24px',
            fontSize: '28px',
            letterSpacing: '0.2em',
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
            letterSpacing: '0.1em',
          }}
        >
          dylancollins.me
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
