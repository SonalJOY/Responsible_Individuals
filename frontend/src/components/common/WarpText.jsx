import { useState, useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle, Texture } from 'ogl';
import './WarpText.css';

const vertex = `#version 300 es
in vec2 position;
in vec2 uv;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;

uniform sampler2D uTextTexture;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uTime;
uniform float uWarpStrength;
uniform float uWarpScale;
uniform float uSpeed;
uniform float uPointerInfluence;
uniform float uPointerStrength;
uniform float uRefraction;
uniform float uRipple;
uniform float uMotion;

in vec2 vUv;
out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p *= 2.02;
    amplitude *= 0.5;
  }
  return value;
}

vec4 sampleText(vec2 uv) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    return vec4(0.0);
  }
  return texture(uTextTexture, uv);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float time = uTime * uSpeed;
  float scale = max(uWarpScale, 0.001);

  // Moderate, organic ambient wave drift
  vec2 drift = vec2(time * 0.055, -time * 0.045);
  float n1 = fbm(uv * scale * 2.8 + drift);
  float n2 = fbm((uv + vec2(19.17, 7.31)) * scale * 3.1 - drift.yx * 1.1);
  vec2 ambient = (vec2(n1, n2) - 0.5) * uWarpStrength * 0.22 * uMotion;

  // Interactive cursor lens & bulge
  vec2 pointerDelta = uv - uPointer;
  vec2 aspectDelta = vec2(pointerDelta.x * aspect, pointerDelta.y);
  float dist = length(aspectDelta);
  float radius = max(uPointerInfluence, 0.001);
  float t = clamp(dist / radius, 0.0, 1.0);
  float lens = smoothstep(radius, 0.0, dist) * uPointerActive;
  float bulge = t * (1.0 - t) * (1.0 - t) * 6.75 * uPointerActive;
  vec2 dir = dist > 0.0001 ? vec2(aspectDelta.x / aspect, aspectDelta.y) / dist : vec2(0.0);

  // Concentric ripple wave around pointer
  float rippleWave = sin(dist * 24.0 - time * 3.6) * 0.5 + 0.5;
  float rippleRing = (rippleWave - 0.5) * uRipple;
  vec2 pointerWarp = -dir * bulge * uPointerStrength * 0.18;
  pointerWarp += dir * rippleRing * bulge * uPointerStrength * 0.06;

  // Displaced sampling coordinate
  vec2 displaced = uv + ambient + pointerWarp;
  vec2 splitDir = ambient + pointerWarp;
  float splitLen = length(splitDir);
  splitDir = splitLen > 0.00001 ? splitDir / splitLen : vec2(0.7071, 0.7071);
  vec2 split = splitDir * uRefraction * 0.28 * (0.35 + lens * 1.4);

  vec4 base = sampleText(displaced);
  vec4 sampR = sampleText(displaced + split);
  vec4 sampB = sampleText(displaced - split);

  // Clean chromatic refraction preserving original color fidelity
  float r = mix(base.r, sampR.r, 0.4);
  float g = base.g;
  float b = mix(base.b, sampB.b, 0.4);
  float a = max(base.a, max(sampR.a, sampB.a) * 0.6);

  // Living glass specular luminescence on hover
  vec3 color = vec3(r, g, b) + lens * base.a * 0.04;
  fragColor = vec4(color, a);
}
`;

const measureLine = (ctx, line, letterSpacing) => {
  const chars = Array.from(line);
  const textWidth = chars.reduce((width, char) => width + ctx.measureText(char).width, 0);
  return textWidth + Math.max(0, chars.length - 1) * letterSpacing;
};

const drawLine = (ctx, line, x, y, letterSpacing, align = 'left') => {
  const chars = Array.from(line);
  const lineWidth = measureLine(ctx, line, letterSpacing);
  let cursor = align === 'left' ? x : (align === 'right' ? x - lineWidth : x - lineWidth / 2);

  chars.forEach((char, index) => {
    ctx.fillText(char, cursor, y);
    cursor += ctx.measureText(char).width + (index === chars.length - 1 ? 0 : letterSpacing);
  });
};

const buildTextCanvas = ({ container, width, height, dpr, props }) => {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(width * dpr));
  canvas.height = Math.max(1, Math.floor(height * dpr));

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  let fontSizePx = 54;
  let fontFamily = "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  let letterSpacing = 0;
  let fontWeight = String(props.fontWeight || '800');

  try {
    const computed = window.getComputedStyle(container);
    const parentComputed = container.parentElement ? window.getComputedStyle(container.parentElement) : computed;
    const h1Computed = container.closest('h1') ? window.getComputedStyle(container.closest('h1')) : parentComputed;

    const rawSize = parseFloat(parentComputed.fontSize) || parseFloat(h1Computed.fontSize) || parseFloat(computed.fontSize);
    if (Number.isFinite(rawSize) && rawSize > 0) {
      fontSizePx = rawSize;
    }
    const computedFamily = parentComputed.fontFamily || h1Computed.fontFamily || computed.fontFamily;
    if (computedFamily && computedFamily !== 'inherit') {
      fontFamily = computedFamily;
    }
    const computedWeight = parentComputed.fontWeight || h1Computed.fontWeight || computed.fontWeight;
    if (computedWeight && computedWeight !== 'inherit' && !props.fontWeight) {
      fontWeight = computedWeight;
    }
    const rawSpacing = parseFloat(parentComputed.letterSpacing) || parseFloat(h1Computed.letterSpacing) || parseFloat(computed.letterSpacing);
    if (Number.isFinite(rawSpacing)) {
      letterSpacing = rawSpacing;
    }
  } catch (err) {
    void err;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = props.color || '#FFFFFF';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const applyFont = () => {
    ctx.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`;
    if (ctx.font === '10px sans-serif' && fontSizePx > 10) {
      ctx.font = `800 ${fontSizePx}px sans-serif`;
    }
  };
  applyFont();

  const lineText = String(props.text || '');
  const textWidth = measureLine(ctx, lineText, letterSpacing);
  const fit = Math.min(1, (width - 2) / Math.max(textWidth, 1));

  if (fit < 1 && fit > 0.1) {
    fontSizePx *= fit;
    letterSpacing *= fit;
    applyFont();
  }

  const align = props.align || 'left';
  const startX = align === 'left' ? 0 : (align === 'right' ? width : width / 2);
  const startY = height / 2;
  drawLine(ctx, lineText, startX, startY, letterSpacing, align);

  return canvas;
};

const syncUniforms = (program, props) => {
  const uniforms = program.uniforms;
  uniforms.uWarpStrength.value = props.warpStrength;
  uniforms.uWarpScale.value = props.warpScale;
  uniforms.uSpeed.value = props.speed;
  uniforms.uPointerInfluence.value = props.pointerInfluence;
  uniforms.uPointerStrength.value = props.pointerStrength;
  uniforms.uRefraction.value = props.refraction;
  uniforms.uRipple.value = props.ripple ? 1 : 0;
};

const WarpText = ({
  text = 'Bend the moment',
  color = '#FFFFFF',
  warpStrength = 0.055,
  warpScale = 1.6,
  speed = 0.32,
  pointerInfluence = 0.40,
  pointerStrength = 0.28,
  refraction = 0.012,
  ripple = true,
  fontSize = 'inherit',
  fontWeight = 800,
  fontFamily = 'inherit',
  letterSpacing = 'inherit',
  lineHeight = 1.05,
  align = 'left',
  className = '',
  style
}) => {
  const containerRef = useRef(null);
  const [webglError, setWebglError] = useState(false);
  const propsRef = useRef({
    text,
    color,
    fontSize,
    fontWeight,
    fontFamily,
    letterSpacing,
    lineHeight,
    warpStrength,
    warpScale,
    speed,
    pointerInfluence,
    pointerStrength,
    refraction,
    ripple,
    align
  });
  const contextRef = useRef(null);

  useEffect(() => {
    propsRef.current = {
      text,
      color,
      fontSize,
      fontWeight,
      fontFamily,
      letterSpacing,
      lineHeight,
      warpStrength,
      warpScale,
      speed,
      pointerInfluence,
      pointerStrength,
      refraction,
      ripple,
      align
    };

    if (contextRef.current) {
      syncUniforms(contextRef.current.program, propsRef.current);
      contextRef.current.rasterize();
    }
  }, [
    text,
    color,
    fontSize,
    fontWeight,
    fontFamily,
    letterSpacing,
    lineHeight,
    warpStrength,
    warpScale,
    speed,
    pointerInfluence,
    pointerStrength,
    refraction,
    ripple,
    align
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === 'undefined') return undefined;

    let renderer;
    let gl;
    let program;
    let geometry;
    let mesh;
    let texture;
    let resizeObserver;
    let intersectionObserver;
    let raf = 0;
    let disposed = false;
    let contextLost = false;
    let visible = true;
    let pageVisible = !document.hidden;
    let reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    let rasterVersion = 0;

    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: 0, activeTarget: 0 };
    const startTime = performance.now();

    try {
      renderer = new Renderer({
        webgl: 2,
        alpha: true,
        premultipliedAlpha: false,
        antialias: true,
        dpr: Math.min(window.devicePixelRatio || 1, 2)
      });
      gl = renderer.gl;
      if (!gl) {
        throw new Error('WebGL 2 context unavailable');
      }
    } catch (error) {
      console.warn('WarpText: WebGL fallback triggered.', error);
      setWebglError(true);
      return undefined;
    }

    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas;
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);

    texture = new Texture(gl, {
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
      wrapS: gl.CLAMP_TO_EDGE,
      wrapT: gl.CLAMP_TO_EDGE
    });

    geometry = new Triangle(gl);
    program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTextTexture: { value: texture },
        uResolution: { value: new Float32Array([1, 1]) },
        uPointer: { value: new Float32Array([0.5, 0.5]) },
        uPointerActive: { value: 0 },
        uTime: { value: 0 },
        uWarpStrength: { value: propsRef.current.warpStrength },
        uWarpScale: { value: propsRef.current.warpScale },
        uSpeed: { value: propsRef.current.speed },
        uPointerInfluence: { value: propsRef.current.pointerInfluence },
        uPointerStrength: { value: propsRef.current.pointerStrength },
        uRefraction: { value: propsRef.current.refraction },
        uRipple: { value: propsRef.current.ripple ? 1 : 0 },
        uMotion: { value: reduceMotion ? 0 : 1 }
      }
    });
    mesh = new Mesh(gl, { geometry, program });

    const renderOnce = () => {
      if (disposed || contextLost) return;
      renderer.render({ scene: mesh });
    };

    const loop = now => {
      if (disposed || contextLost) return;

      const elapsed = (now - startTime) * 0.001;
      const idleX = 0.5 + Math.sin(elapsed * 0.42) * 0.22;
      const idleY = 0.5 + Math.cos(elapsed * 0.32) * 0.16;
      const targetX = pointer.activeTarget > 0 ? pointer.tx : idleX;
      const targetY = pointer.activeTarget > 0 ? pointer.ty : idleY;
      const damping = pointer.activeTarget > 0 ? 0.14 : 0.04;

      pointer.x += (targetX - pointer.x) * damping;
      pointer.y += (targetY - pointer.y) * damping;
      pointer.active += ((pointer.activeTarget > 0 ? 1 : 0.16) - pointer.active) * 0.08;

      program.uniforms.uPointer.value[0] = pointer.x;
      program.uniforms.uPointer.value[1] = pointer.y;
      program.uniforms.uPointerActive.value = reduceMotion ? pointer.active * 0.25 : pointer.active;
      program.uniforms.uTime.value = reduceMotion ? 0 : elapsed;

      renderOnce();
      raf = requestAnimationFrame(loop);
    };

    const rasterize = async () => {
      const version = ++rasterVersion;
      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch (error) {
          void error;
        }
      }
      if (disposed || contextLost || version !== rasterVersion) return;

      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const textCanvas = buildTextCanvas({
        container,
        width: rect.width,
        height: rect.height,
        dpr,
        props: propsRef.current
      });
      texture.image = textCanvas;
      texture.needsUpdate = true;
      renderOnce();

      if (!raf && visible && pageVisible) {
        raf = requestAnimationFrame(loop);
      }
    };

    const resize = () => {
      if (disposed || contextLost) return;
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      renderer.dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setSize(rect.width, rect.height);
      program.uniforms.uResolution.value[0] = gl.drawingBufferWidth;
      program.uniforms.uResolution.value[1] = gl.drawingBufferHeight;
      rasterize();
      if (!raf && visible && pageVisible) {
        raf = requestAnimationFrame(loop);
      }
    };

    const onPointerMove = event => {
      if (event.pointerType === 'touch') return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      pointer.tx = (event.clientX - rect.left) / rect.width;
      pointer.ty = 1 - (event.clientY - rect.top) / rect.height;
      pointer.activeTarget = 1;
    };

    const onPointerLeave = () => {
      pointer.activeTarget = 0;
    };

    const onContextLost = event => {
      event.preventDefault();
      contextLost = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const onVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible && visible && !raf) raf = requestAnimationFrame(loop);
      if (!pageVisible && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const onReducedMotion = event => {
      reduceMotion = event.matches;
      program.uniforms.uMotion.value = reduceMotion ? 0 : 1;
      renderOnce();
    };

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && pageVisible && !raf) raf = requestAnimationFrame(loop);
        if (!visible && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(container);

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('webglcontextlost', onContextLost, false);
    document.addEventListener('visibilitychange', onVisibility);
    mediaQuery?.addEventListener('change', onReducedMotion);

    syncUniforms(program, propsRef.current);
    contextRef.current = { program, rasterize };
    resize();
    raf = requestAnimationFrame(loop);

    return () => {
      disposed = true;
      contextRef.current = null;
      if (raf) cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      document.removeEventListener('visibilitychange', onVisibility);
      mediaQuery?.removeEventListener('change', onReducedMotion);

      if (!contextLost) {
        try {
          if (texture?.texture) gl.deleteTexture(texture.texture);
          geometry?.remove?.();
          program?.remove?.();
          gl.getExtension('WEBGL_lose_context')?.loseContext();
        } catch (error) {
          void error;
        }
      }

      if (canvas.parentNode === container) container.removeChild(canvas);
    };
  }, []);

  if (webglError) {
    return (
      <span
        className={`warp-text-fallback ${className}`.trim()}
        style={{ color, ...style }}
      >
        {text}
      </span>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`warp-text ${className}`.trim()}
      style={style}
      role="img"
      aria-label={String(text || '').replace(/\n+/g, ' ')}
    />
  );
};

export default WarpText;
