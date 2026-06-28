"use client";

import { useEffect, useRef } from "react";

export function HeroShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
      return () => resizeObserver.disconnect();
    }
    syncSize();

    const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

    const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;

varying vec2 v_texCoord;

void main() {
    vec2 uv = v_texCoord;
    
    // Create a flowing, ethereal dark background with indigo and violet hues
    float t = u_time * 0.2;
    
    vec3 color1 = vec3(0.05, 0.08, 0.15); // Deep Indigo
    vec3 color2 = vec3(0.1, 0.05, 0.2);  // Deep Violet
    vec3 accent = vec3(0.2, 0.3, 0.5);  // Soft Blue Glow
    
    float noise = sin(uv.x * 3.0 + t) * cos(uv.y * 2.0 - t * 0.5) * 0.5 + 0.5;
    float noise2 = sin(uv.y * 4.0 - t * 0.8) * cos(uv.x * 2.5 + t * 0.3) * 0.5 + 0.5;
    
    vec3 finalColor = mix(color1, color2, noise);
    finalColor += accent * pow(noise2, 3.0) * 0.2;
    
    // Add a slight vignette
    float vignette = 1.0 - length(uv - 0.5) * 0.7;
    finalColor *= vignette;
    
    gl_FragColor = vec4(finalColor, 1.0);
}`;

    function cs(type: number, src: string) {
      if (!gl) return null;
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    const prog = gl.createProgram();
    if (!prog) return;

    const vertShader = cs(gl.VERTEX_SHADER, vs);
    const fragShader = cs(gl.FRAGMENT_SHADER, fs);
    if (!vertShader || !fragShader) return;

    gl.attachShader(prog, vertShader);
    gl.attachShader(prog, fragShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");

    let animationFrameId: number;

    function render(t: number) {
      if (!gl || !canvas) return;
      syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }
    render(0);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full z-[-1] opacity-60">
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
