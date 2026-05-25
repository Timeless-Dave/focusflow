import { Camera, Mesh, Plane, Program, Renderer, Transform } from 'ogl';
import { useEffect, useRef } from 'react';

import './Ribbons.css';

function normalizeHex(hex) {
  let h = String(hex || '').trim().replace(/^#/, '');
  if (h.length === 3) h = [...h].map(c => `${c}${c}`).join('');
  const n = Number.parseInt(h, 16) || 0x7c3aed;
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** Animated ribbon-esque bands rendered on an ogl fullscreen plane. */
export default function Ribbons({ className = '', colorA = '#7c3aed', colorB = '#a78bfa', intensity = 0.38 }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const dpr = Math.min(window.devicePixelRatio ?? 2, 2);
    const renderer = new Renderer({
      dpr,
      alpha: true,
      antialias: true,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false
    });
    const gl = renderer.gl;
    const canvas = gl.canvas;

    gl.colorMask(true, true, true, true);
    gl.clearColor(0, 0, 0, 0);

    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    while (el.firstChild) el.removeChild(el.firstChild);
    el.appendChild(canvas);

    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.disable(gl.STENCIL_TEST);
    gl.disable(gl.DITHER);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const camera = new Camera(gl);
    camera.position.z = 4;

    const scene = new Transform();

    const program = new Program(gl, {
      vertex: `
        attribute vec2 uv;
        attribute vec3 position;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        varying vec2 vUv;
        uniform vec2 uRes;
        uniform float uTime;
        uniform vec3 uColA;
        uniform vec3 uColB;
        uniform float uIntensity;

        float hash(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        float sn(vec2 uv) {
          vec2 id = floor(uv);
          vec2 f = fract(uv);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(id), hash(id + vec2(1.0, 0.0)), u.x),
                     mix(hash(id + vec2(0.0, 1.0)), hash(id + vec2(1.0, 1.0)), u.x),
                     u.y);
        }

        float ribbon(vec2 uv) {
          float t = uTime * 0.35 + uv.y * 3.85;
          float s = uv.x + sin(uv.y * 5.14 + uTime * 0.45) * 0.14;
          float r = sin(s * 8.62 + uv.y * 9.92 + hash(uv + uTime * 4.73) * 1.92 + t + sn(uv * 13.23 + uTime * 1.72));
          return r * smoothstep(-0.3, 1.92, uv.y + 0.45 * uv.x + 0.18 * sin(uTime + uv.y * 2.72));
        }

        void main() {
          vec2 uv = vUv.xy;
          float mask = ribbon(uv);
          vec3 col = mix(uColB, uColA, clamp(mask * mask, 0.0, 1.0));
          float vign = smoothstep(0.95, 0.14, pow(abs(uv.y - 0.5), 1.9));
          float a = clamp(mask * vign * uIntensity + 0.078, 0.0, 1.06);
          gl_FragColor = vec4(col, a);
        }
      `,
      uniforms: {
        uRes: { value: [1, 1] },
        uTime: { value: 0 },
        uColA: { value: normalizeHex(colorA) },
        uColB: { value: normalizeHex(colorB) },
        uIntensity: { value: intensity }
      },
      transparent: true
    });

    const mesh = new Mesh(gl, {
      geometry: new Plane(gl),
      program
    });
    mesh.scale.set(2.2, 2.2, 1);
    mesh.setParent(scene);

    function resize() {
      const w = el.clientWidth || 320;
      const h = el.clientHeight || 240;

      renderer.setSize(w, h);

      const aspect = Math.max(renderer.width || w, 1) / Math.max(renderer.height || h, 1);

      camera.perspective({
        aspect,
        fov: 46
      });

      program.uniforms.uRes.value = [gl.drawingBufferWidth || w, gl.drawingBufferHeight || h];
    }

    resize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(el);

    let raf = 0;

    const perf = typeof performance !== 'undefined';
    let start = perf ? performance.now() : Date.now();

    function frame(now) {
      program.uniforms.uTime.value = (now - start) / 1000;

      renderer.render({ scene, camera });
      raf = requestAnimationFrame(frame);
    }
    frame(start);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      if (canvas.parentElement === el) el.removeChild(canvas);
    };
  }, [colorA, colorB, intensity]);

  return <div ref={hostRef} className={`ribbons ${className}`.trim()} aria-hidden="true" />;
}
