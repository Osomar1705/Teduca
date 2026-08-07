"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { APP_ROUTES } from '@/lib/constants';
import { getOnboardingStatus } from '@/lib/onboarding/service';
import { Logo } from '@/components/common/Logo';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

export default function ModernLoginSignup({ defaultMode = 'sign-in' }: { defaultMode?: 'sign-in' | 'sign-up' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(defaultMode === 'sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = isLogin
      ? await authClient.signIn.email({ email, password })
      : await authClient.signUp.email({ email, password, name });

    setLoading(false);

    if (error) {
      setError(error.message ?? 'Ocurrió un error. Intentá de nuevo.');
      return;
    }

    const onboarding = await getOnboardingStatus().catch(() => null);
    const dest = onboarding?.completed ? APP_ROUTES.DASHBOARD : APP_ROUTES.ONBOARDING;
    router.push(dest);
    router.refresh();
  };

  const switchMode = (toLogin: boolean) => {
    setIsLogin(toLogin);
    setError(null);
    setName('');
    setEmail('');
    setPassword('');
  };

  useEffect(() => {
    let active = true;
    let renderer: any;
    let geometry: any;
    let material: any;
    let scene: any;
    let camera: any;
    let animationId: number;

    const initThree = (THREE: any) => {
      if (!canvasRef.current || !active) return;
      const canvas = canvasRef.current;
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);

      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      const uniforms = {
        u_time: { value: 0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth * 2, window.innerHeight * 2) },
        u_opacities: { value: [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1.0] },
        u_colors: { value: [
          new THREE.Vector3(1, 1, 1),
          new THREE.Vector3(1, 1, 1),
          new THREE.Vector3(1, 1, 1),
          new THREE.Vector3(1, 1, 1),
          new THREE.Vector3(1, 1, 1),
          new THREE.Vector3(1, 1, 1),
        ]},
        u_total_size: { value: 20.0 },
        u_dot_size: { value: 6.0 },
        u_reverse: { value: 0 },
      };

      material = new THREE.ShaderMaterial({
        vertexShader: `
          precision mediump float;
          uniform vec2 u_resolution;
          out vec2 fragCoord;
          void main() {
            gl_Position = vec4(position, 1.0);
            fragCoord = (position.xy + 1.0) * 0.5 * u_resolution;
            fragCoord.y = u_resolution.y - fragCoord.y;
          }
        `,
        fragmentShader: `
          precision mediump float;
          in vec2 fragCoord;
          uniform float u_time;
          uniform float u_opacities[10];
          uniform vec3 u_colors[6];
          uniform float u_total_size;
          uniform float u_dot_size;
          uniform vec2 u_resolution;
          uniform int u_reverse;
          out vec4 fragColor;

          float PHI = 1.61803398874989484820459;
          float random(vec2 xy) {
            return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
          }

          void main() {
            vec2 st = fragCoord.xy;
            st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
            st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));

            float opacity = step(0.0, st.x) * step(0.0, st.y);
            vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

            float frequency = 5.0;
            float show_offset = random(st2);
            float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
            opacity *= u_opacities[int(rand * 10.0)];
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
            opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

            vec3 color = u_colors[int(show_offset * 6.0)];

            float animation_speed_factor = 3.0;
            vec2 center_grid = u_resolution / 2.0 / u_total_size;
            float dist_from_center = distance(center_grid, st2);
            float timing_offset_intro = dist_from_center * 0.01 + (random(st2) * 0.15);

            opacity *= step(timing_offset_intro, u_time * animation_speed_factor);
            opacity *= clamp((1.0 - step(timing_offset_intro + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);

            fragColor = vec4(color, opacity);
            fragColor.rgb *= fragColor.a;
          }
        `,
        uniforms,
        glslVersion: THREE.GLSL3,
        blending: THREE.CustomBlending,
        blendSrc: THREE.SrcAlphaFactor,
        blendDst: THREE.OneFactor,
        transparent: true,
      });

      geometry = new THREE.PlaneGeometry(2, 2);
      scene.add(new THREE.Mesh(geometry, material));

      const startTime = performance.now();
      const animate = () => {
        if (!active) return;
        animationId = requestAnimationFrame(animate);
        uniforms.u_time.value = (performance.now() - startTime) / 1000.0;
        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        uniforms.u_resolution.value.set(window.innerWidth * 2, window.innerHeight * 2);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    };

    const cleanup = () => {
      active = false;
      if (animationId) cancelAnimationFrame(animationId);
      if (renderer) renderer.dispose();
      if (geometry) geometry.dispose();
      if (material) material.dispose();
    };

    if ((window as any).THREE) {
      const cleanUp = initThree((window as any).THREE);
      return () => { cleanup(); if (cleanUp) cleanUp(); };
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.async = true;
      script.onload = () => {
        if ((window as any).THREE) initThree((window as any).THREE);
      };
      document.head.appendChild(script);
    }

    return cleanup;
  }, []);

  const socialBtn: React.CSSProperties = {
    width: '100%', padding: '0.65rem', borderRadius: 6,
    border: '1px solid #333', background: 'transparent', color: '#fff',
    fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    marginBottom: '0.4rem',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.65rem 0.85rem', borderRadius: 6,
    border: '1px solid #333', background: '#0a0a0a', color: '#fff',
    fontSize: '0.875rem', outline: 'none',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', background: '#000', color: '#fff',
      fontFamily: "'Inter',-apple-system,sans-serif",
    }}>
      {/* WebGL dot canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(circle at center,rgba(0,0,0,0.75) 0%,rgba(0,0,0,0) 100%)',
      }} />

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 2, background: '#111', borderRadius: 14,
        padding: '2rem', width: '100%', maxWidth: 400,
        boxShadow: '0 10px 40px rgba(0,0,0,0.9)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        border: '1px solid #222', margin: '0 1rem',
      }}>
        <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

          <Logo className="mb-4 h-10 w-auto" />

          <h1 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '0.2rem', letterSpacing: '-0.025em' }}>
            {isLogin ? 'Bienvenido de nuevo' : 'Creá tu cuenta'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem', lineHeight: 1.5 }}>
            {isLogin ? 'Iniciá sesión para continuar.' : 'Registrate para empezar a aprender.'}
          </p>

          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {!isLogin && (
              <input
                style={inputStyle}
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                minLength={2}
                autoComplete="name"
              />
            )}
            <input
              style={inputStyle}
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...inputStyle, paddingRight: '2.5rem' }}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={!isLogin ? 8 : undefined}
                autoComplete={!isLogin ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                style={{
                  position: 'absolute', top: '50%', right: '0.75rem',
                  transform: 'translateY(-50%)', background: 'none', border: 'none',
                  cursor: 'pointer', color: '#666', padding: 0, display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {!isLogin && (
              <p style={{ fontSize: '0.75rem', color: '#555', textAlign: 'left' }}>
                Mínimo 8 caracteres, con mayúsculas, minúsculas y números.
              </p>
            )}

            {error && (
              <p style={{ fontSize: '0.8rem', color: '#f87171', textAlign: 'left' }} role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.65rem', borderRadius: 6, border: 'none',
                background: loading ? '#555' : '#ededed', color: '#000',
                fontWeight: 600, fontSize: '0.875rem',
                cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.2rem',
              }}
            >
              {loading ? 'Procesando...' : isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </form>

          {/* Google Sign In — visible solo si el backend lo habilita */}
          <div style={{ width: '100%', marginTop: '0.5rem' }}>
            <GoogleSignInButton onError={setError} />
          </div>

          <div style={{ height: 1, background: '#222', width: '100%', margin: '1rem 0' }} />

          <p style={{ fontSize: '0.875rem', color: '#888' }}>
            {isLogin ? '¿No tenés cuenta? ' : '¿Ya tenés cuenta? '}
            <button
              onClick={() => switchMode(!isLogin)}
              style={{ color: '#fff', fontWeight: 500, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
            >
              {isLogin ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>
          </p>

          <div style={{ marginTop: '0.85rem', fontSize: '0.75rem', color: '#555', lineHeight: 1.5, textAlign: 'center' }}>
            Al continuar aceptás nuestros{' '}
            <a href="#" style={{ color: '#777' }}>Términos de servicio</a>{' '}
            y{' '}
            <a href="#" style={{ color: '#777' }}>Política de privacidad</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
