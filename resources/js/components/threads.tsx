import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Color } from "ogl";

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;

#define PI 3.1415926538

const int u_line_count = 12; // Reducido de 20 a 12 para mejor rendimiento
const float u_line_width = 100.0; // Reducido de 135 a 100
const float u_line_blur = 0.0;

// Función de ruido simplificada para mejor rendimiento
float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float pixel(float count, vec2 resolution) {
    return (1.0 / max(resolution.x, resolution.y)) * count;
}

vec3 getLineColor(float perc) {
    // Colores simplificados para mejor rendimiento
    vec3 color1 = vec3(0.2, 0.6, 1.0); // Blue
    vec3 color2 = vec3(0.8, 0.3, 1.0); // Purple
    vec3 color3 = vec3(0.0, 1.0, 0.8); // Cyan
    
    float t = mod(perc * 3.0 + iTime * 0.3, 3.0); // Reducida la velocidad
    if (t < 1.0) return mix(color1, color2, t);
    if (t < 2.0) return mix(color2, color3, t - 1.0);
    return mix(color3, color1, t - 2.0);
}

float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
    float split_offset = (perc * 0.3); // Reducido de 0.4 a 0.3
    float split_point = 0.1 + split_offset;

    float amplitude_normal = smoothstep(split_point, 0.7, st.x);
    float amplitude_strength = 0.6; // Reducido de 0.8 a 0.6
    float finalAmplitude = amplitude_normal * amplitude_strength
                           * amplitude * (1.0 + (mouse.y - 0.5) * 0.2); // Reducido de 0.3 a 0.2

    float time_scaled = time / 12.0 + (mouse.x - 0.5) * 1.0; // Reducida la velocidad

    // Usar ruido simplificado en lugar de Perlin2D
    float xnoise = smoothNoise(vec2(time_scaled * 2.0, st.x + perc) * 2.0) * 0.5;

    float y = 0.5 + (perc - 0.5) * distance + xnoise * finalAmplitude;

    float line_start = smoothstep(
        y + (width / 2.0),
        y,
        st.y
    );

    float line_end = smoothstep(
        y,
        y - (width / 2.0),
        st.y
    );

    return clamp(
        (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))), // Ajustado de 0.2 a 0.3
        0.0,
        1.0
    );
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    vec3 finalColor = vec3(0.0);
    float totalAlpha = 0.0;
    
    for (int i = 0; i < u_line_count; i++) {
        float p = float(i) / float(u_line_count);
        float lineAlpha = lineFn(
            uv,
            u_line_width * pixel(1.0, iResolution.xy) * (1.8 - p * 0.1), // Reducido de 2.2 a 1.8
            p,
            (PI * 1.0) * p, // Reducido de 1.2 a 1.0
            uMouse,
            iTime,
            uAmplitude,
            uDistance
        );
        
        vec3 lineColor = getLineColor(p);
        float crystalline = sin(p * 30.0 + iTime * 1.0) * 0.2 + 0.8; // Reducida la frecuencia y amplitud
        lineColor *= crystalline;
        
        finalColor += lineColor * lineAlpha;
        totalAlpha = max(totalAlpha, lineAlpha);
    }

    // Efecto de resplandor simplificado
    float glow = sin(iTime * 0.3) * 0.05 + 0.95; // Reducida la velocidad y amplitud
    finalColor *= glow;
    
    fragColor = vec4(finalColor, totalAlpha * 0.8); // Reducido de 0.9 a 0.8
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

interface ThreadsProps {
  color?: [number, number, number];
  amplitude?: number;
  distance?: number;
  enableMouseInteraction?: boolean;
  className?: string;
}

const Threads = ({
  color = [1, 1, 1],
  amplitude = 1,
  distance = 0,
  enableMouseInteraction = false,
  className = "",
  ...rest
}: ThreadsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | undefined>(undefined);
  const lastTime = useRef<number>(0);
  const frameCount = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    try {
      // Optimizaciones para Edge
      const renderer = new Renderer({ 
        alpha: true,
        antialias: false, // Desactivar antialiasing para mejor rendimiento
        powerPreference: "high-performance" // Forzar modo de alto rendimiento
      });
      const gl = renderer.gl;
      
      // Optimizaciones adicionales para WebGL
      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      
      // Optimizaciones específicas para Edge
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.CULL_FACE);
      
      container.appendChild(gl.canvas);

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          iTime: { value: 0 },
          iResolution: {
            value: new Color(
              gl.canvas.width,
              gl.canvas.height,
              gl.canvas.width / gl.canvas.height
            ),
          },
          uColor: { value: new Color(...color) },
          uAmplitude: { value: amplitude },
          uDistance: { value: distance },
          uMouse: { value: new Float32Array([0.5, 0.5]) },
        },
      });

      const mesh = new Mesh(gl, { geometry, program });

      function resize() {
        const { clientWidth, clientHeight } = container;
        renderer.setSize(clientWidth, clientHeight);
        program.uniforms.iResolution.value.r = clientWidth;
        program.uniforms.iResolution.value.g = clientHeight;
        program.uniforms.iResolution.value.b = clientWidth / clientHeight;
      }
      window.addEventListener("resize", resize);
      resize();

      let currentMouse = [0.5, 0.5];
      let targetMouse = [0.5, 0.5];

      function handleMouseMove(e: MouseEvent) {
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = 1.0 - (e.clientY - rect.top) / rect.height;
        targetMouse = [x, y];
      }
      function handleMouseLeave() {
        targetMouse = [0.5, 0.5];
      }
      if (enableMouseInteraction) {
        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", handleMouseLeave);
      }

      function update(t: number) {
        // Control de FPS para mejor rendimiento
        const deltaTime = t - lastTime.current;
        const targetFPS = 60;
        const targetFrameTime = 1000 / targetFPS;
        
        if (deltaTime < targetFrameTime) {
          animationFrameId.current = requestAnimationFrame(update);
          return;
        }
        
        lastTime.current = t;
        frameCount.current++;

        if (enableMouseInteraction) {
          const smoothing = 0.03; // Reducido de 0.05 a 0.03 para suavizar
          currentMouse[0] += smoothing * (targetMouse[0] - currentMouse[0]);
          currentMouse[1] += smoothing * (targetMouse[1] - currentMouse[1]);
          program.uniforms.uMouse.value[0] = currentMouse[0];
          program.uniforms.uMouse.value[1] = currentMouse[1];
        } else {
          program.uniforms.uMouse.value[0] = 0.5;
          program.uniforms.uMouse.value[1] = 0.5;
        }
        
        // Reducir la velocidad de la animación para mejor rendimiento
        program.uniforms.iTime.value = t * 0.0008; // Reducido de 0.001 a 0.0008

        renderer.render({ scene: mesh });
        animationFrameId.current = requestAnimationFrame(update);
      }
      animationFrameId.current = requestAnimationFrame(update);

      return () => {
        if (animationFrameId.current)
          cancelAnimationFrame(animationFrameId.current);
        window.removeEventListener("resize", resize);

        if (enableMouseInteraction) {
          container.removeEventListener("mousemove", handleMouseMove);
          container.removeEventListener("mouseleave", handleMouseLeave);
        }
        if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    } catch (error) {
      console.error('Error initializing WebGL:', error);
      // Fallback mejorado
      container.style.backgroundColor = 'rgba(0, 100, 255, 0.3)';
      const fallbackDiv = document.createElement('div');
      fallbackDiv.className = 'text-white text-center p-8';
      fallbackDiv.textContent = 'WebGL Effect (Fallback)';
      container.appendChild(fallbackDiv);
    }
  }, [color, amplitude, distance, enableMouseInteraction]);

  return (
    <div 
      ref={containerRef} 
      className={`${className}`} 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0
      }}
      {...rest} 
    />
  );
};

export default Threads;
