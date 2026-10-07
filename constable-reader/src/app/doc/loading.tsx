export default function Loading() {
  const widths = [96, 100, 92, 98, 60, 0, 100, 94, 99, 88, 72, 0, 97, 100, 90, 45];
  return (
    <div className="reader-body">
      <header className="navbar" data-scrolled="false" />
      <main className="reader" aria-busy="true" aria-label="Loading notes">
        <div className="reader-hero">
          <div className="skeleton" style={{ maxWidth: 180 }}>
            <span />
          </div>
          <div className="skeleton" style={{ maxWidth: 320, marginTop: 14 }}>
            <span style={{ height: 44 }} />
          </div>
        </div>
        <div className="skeleton">
          {widths.map((width, i) => (width ? <span key={i} style={{ width: `${width}%` }} /> : <i key={i} />))}
        </div>
      </main>
    </div>
  );
}
