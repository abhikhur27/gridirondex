# GridironDex design direction

An interactive football film room for fans learning to see the structure behind a play. The diagram is the primary object, with a concept library on the left and explanation on the right. 


Display: Barlow Condensed (600/700); body: DM Sans (400/500/600); telemetry: IBM Plex Mono (400/500). Base 4px spacing; restrained 6px radii on controls, 10px on workspace boundaries. Flat surfaces and hairline separators, no decorative shadows. Cyan identifies offense, amber highlights a key read, crimson identifies defense, purple distinguishes coverage space. Slate field grid uses 5% white.

Signature: curved vector routes over a full-width football field, paired with a numbered quarterback read. Route movement is tied to the play clock and scrubber. Motion is functional; reduced motion removes entrance and ambient animation. No fabricated performance metrics, ratings or testimonials.

Implementation: Vite + React + TypeScript, Tailwind CSS, Lucide, Framer Motion. UI is composed in src/App.tsx, src/components/Field.tsx, src/components/FilmModal.tsx; content in src/data; tokens in src/tokens.css. Keyboard focus, dialog trapping, narrow-screen layout and local preferences are included.
