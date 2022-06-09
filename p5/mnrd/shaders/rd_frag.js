const rd_frag = `
//preprocessor macro to set the default precision of floats
#ifdef GL_FRAGMENT_PRECISION_HIGH
		precision highp float;
#else
		precision mediump float;
#endif

#define PI 3.14159265359

// varying variables are assigned a value at each vertex in the vertex shader,
// and then interpolated at each pixel in the fragment shader
varying highp vec3 vPos;

//uniform variables are globally shared across all vertices and pixels
//they are dispatched to the shader with shader.setUniform()
uniform vec2 iResolution;    //p5js pgraphics resolution INCLUDING PIXELDENSITY
uniform vec2 iMouse;         //mouse pixel coords
uniform float iTime;			   //shader playback time (in seconds)
uniform sampler2D iChannel0; //input channel
uniform float iSeed;         //random seed

// gl_FragColor is a reserved variable in WebGL 1.0 that specifies the colour at the pixel location	
// gl_FragCoord is the centre coordinate of the current pixel. Example: the bottom left pixel is at [0.5,0.5] (half a pixel distance from the corner [0,0])
// uv represents a location on a texture, it is a 2D vector in a unit square, where [0,0] is one corner and [1,1] is the opposite corner
//   when you texture a triangle, you give each vertex a uv coordinate, and the triangle color (per fragment) is interpolated linearly between those points on the texture.
// uvw is a 3D texture coordinate. 

float rand(float co){ return fract(sin(co*(91.3458)) * (47453.5453 + iSeed)); }
float rand(vec2 co){ return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453); }
float rand(vec3 co){ return rand(co.xy+rand(co.z)); }

void main() 
{		
		//vec2 uv = (vec2(vPos.x, -vPos.y) + 1.0) / 2.0; 
		
		vec2 uv = vec2(gl_FragCoord.x, iResolution.y - gl_FragCoord.y) / iResolution; //flip the y axis because p5
		
		vec4 current = texture2D(iChannel0, uv); 
		
		//vec2 nuv = mod(uv - 1.0 / res, 1.0);
		//vec4 next = texture2D(iChannel0, nuv);
		
		vec3 peers1 = vec3(0.0);
		vec3 peers2 = vec3(0.0);
		
		
		for(float dx = -20.0; dx <= 20.0; dx++)
		{
			for(float dy = -20.0; dy <= 20.0; dy++)
			{
				float d = sqrt(dx*dx + dy*dy);
				float theta = PI / 3.65;
				
				if(d < 0.5) 
				{
					//skip
				}
				else if(d <= 13.0)
				{
					vec2 nuv = mod(uv + vec2(dx,dy) / iResolution, 1.0); 
					vec4 peer = texture2D(iChannel0, nuv ); 
		
					if(peer.r > 0.5) peers1 += peer.rgb / d*0.5 * ((1.35) * cos(theta) + (-0.2 + 0.0 * uv.y) * sin(theta)); //todo learn mat2 transforms
				}
				else if(d <= 20.0)
				{
					vec2 nuv = mod(uv + vec2(dx,dy) / iResolution, 1.0); 
					vec4 peer = texture2D(iChannel0, nuv ); 
				
					if(peer.r > 0.5) peers2 += peer.rgb / d*0.65 * ((1.35) * sin(theta) - (-0.2 + 0.0 * uv.y) * cos(theta));  
				}
			}	
		}
		
		//if(peers1 > peers2)
		//{
		//	gl_FragColor = vec4( 1.0 );
		//}
		//else
		//{
		//	gl_FragColor = vec4( vec3(0.0), 1.0 );
		//}
		
		float dA = 0.06;
		float dB = 0.02;
		float feed = 0.02;
		float k = 0.008;
		float a = current.r;
		float b = current.b;
		
		if(sin(50.0*length(uv - vec2(0.5,0.5))) > 0.2 && iTime < 6.0)
		{
			a = a + dA * (-peers2.r + peers1.r) - a * b * b + feed * (1.0 - a);
			b = b + dB * (-peers2.r + peers1.r) + a * b * b - (k + feed) * b;
		}
		else
		{
			float delta = (-peers2.r + peers1.r);
			if(peers2.r + peers2.b > 0.6)
			{
				a *= 0.95; b *= 0.95;
			}
			if(peers1.r > 0.75 && peers2.r >=  0.2 && peers2.r <= 8.0 )
			{
				a = a + dA * delta - a * b * b + feed * (1.0 - a);
				b = b + dB * delta + a * b * b - (k + feed) * b;
			}
			else if(peers2.b > 1.0)
			{
				a = a + dA * delta - a * b * b + feed * (1.0 - a);
				b = b + dB * delta + a * b * b - (k + feed) * b;
			}
			else
			{
				a = a - feed;
				b *= 0.9;
			}
		}
				
		a = clamp(a, 0.0, 1.0);
		b = clamp(b, 0.0, 1.0);
		
		gl_FragColor = vec4(a, 0.0, b, 1.0);
		
		//gl_FragColor = vec4( vec3(peers1/8.0), 1.0 );; //current; 
		//gl_FragColor = vec4( uv, 0.0, 1.0); //next; //
}
`;