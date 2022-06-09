const ca_frag = `
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

#define WEIGHT_COUNT 25
uniform float iWeights1[WEIGHT_COUNT];
uniform float iWeights2[WEIGHT_COUNT];
uniform float iWeights3[WEIGHT_COUNT];
uniform float iWeights4[WEIGHT_COUNT];

// gl_FragColor is a reserved variable in WebGL 1.0 that specifies the colour at the pixel location	
// gl_FragCoord is the centre coordinate of the current pixel. Example: the bottom left pixel is at [0.5,0.5] (half a pixel distance from the corner [0,0])
// uv represents a location on a texture, it is a 2D vector in a unit square, where [0,0] is one corner and [1,1] is the opposite corner
//   when you texture a triangle, you give each vertex a uv coordinate, and the triangle color (per fragment) is interpolated linearly between those points on the texture.
// uvw is a 3D texture coordinate. 

float rand(float co){ return fract(sin(co*(91.3458)) * (47453.5453 + iSeed + iTime)); }
float rand(vec2 co){ return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * (43758.5453 + iSeed + iTime)); }
float rand(vec3 co){ return rand(co.xy+rand(co.z)); }

void main() 
{		
		vec2 uv = vec2(gl_FragCoord.x, iResolution.y - gl_FragCoord.y) / iResolution; //flip the y axis because p5
		
		vec4 current = texture2D(iChannel0, uv); 
				
		float self = current.r;
		float peers = 0.0;
		
		for(float dx = -1.0; dx <= 1.0; dx++)
		{
			for(float dy = -1.0; dy <= 1.0; dy++)
			{
				if(dx == 0.0 && dy == 0.0) continue;
				vec2 nuv = mod(uv + vec2(dx,dy) / iResolution, 1.0); 
				vec4 peer = texture2D(iChannel0, nuv ); 
				peers += peer.r;
			}	
		}
		
		if(uv.y < 0.5)
		{
			if(uv.x < 0.5)
			{
				float a = 1.0 / (1.0 + exp(iWeights1[0] * self + iWeights1[1]  * peers + iWeights1[2])); 
				float b = 1.0 / (1.0 + exp(iWeights1[3] * self + iWeights1[4]  * peers + iWeights1[5])); 
				float c = 1.0 / (1.0 + exp(iWeights1[6] * self + iWeights1[7]  * peers + iWeights1[8])); 
				float d = 1.0 / (1.0 + exp(iWeights1[9] * self + iWeights1[10] * peers + iWeights1[11])); 
				float f = 1.0 / (1.0 + exp(iWeights1[12] * a   + iWeights1[13] * b     + iWeights1[14] * c + iWeights1[15] * d + iWeights1[16]));
				float g = 1.0 / (1.0 + exp(iWeights1[17] * a   + iWeights1[18] * b     + iWeights1[19] * c + iWeights1[20] * d + iWeights1[21]));
				
				float h = 1.0 / (1.0 + exp(iWeights1[22]*f + iWeights1[23]*g + iWeights1[24] )); 
				gl_FragColor = vec4(h, h, h, 1.0);
			}
			else
			{
				float a = 1.0 / (1.0 + exp(iWeights2[0] * self + iWeights2[1]  * peers + iWeights2[2])); 
				float b = 1.0 / (1.0 + exp(iWeights2[3] * self + iWeights2[4]  * peers + iWeights2[5])); 
				float c = 1.0 / (1.0 + exp(iWeights2[6] * self + iWeights2[7]  * peers + iWeights2[8])); 
				float d = 1.0 / (1.0 + exp(iWeights2[9] * self + iWeights2[10] * peers + iWeights2[11])); 
				float f = 1.0 / (1.0 + exp(iWeights2[12] * a   + iWeights2[13] * b     + iWeights2[14] * c + iWeights2[15] * d + iWeights2[16]));
				float g = 1.0 / (1.0 + exp(iWeights2[17] * a   + iWeights2[18] * b     + iWeights2[19] * c + iWeights2[20] * d + iWeights2[21]));
				
				float h = 1.0 / (1.0 + exp(iWeights2[22]*f + iWeights2[23]*g + iWeights2[24] )); 
				gl_FragColor = vec4(h, h, h, 1.0);
			}
		}
		else
		{
			if(uv.x < 0.5)
			{
				float a = 1.0 / (1.0 + exp(iWeights3[0] * self + iWeights3[1]  * peers + iWeights3[2])); 
				float b = 1.0 / (1.0 + exp(iWeights3[3] * self + iWeights3[4]  * peers + iWeights3[5])); 
				float c = 1.0 / (1.0 + exp(iWeights3[6] * self + iWeights3[7]  * peers + iWeights3[8])); 
				float d = 1.0 / (1.0 + exp(iWeights3[9] * self + iWeights3[10] * peers + iWeights3[11])); 
				float f = 1.0 / (1.0 + exp(iWeights3[12] * a   + iWeights3[13] * b     + iWeights3[14] * c + iWeights3[15] * d + iWeights3[16]));
				float g = 1.0 / (1.0 + exp(iWeights3[17] * a   + iWeights3[18] * b     + iWeights3[19] * c + iWeights3[20] * d + iWeights3[21]));
				
				float h = 1.0 / (1.0 + exp(iWeights3[22]*f + iWeights3[23]*g + iWeights3[24] )); 
				gl_FragColor = vec4(h, h, h, 1.0);
			}
			else
			{
				float a = 1.0 / (1.0 + exp(iWeights4[0] * self + iWeights4[1]  * peers + iWeights4[2])); 
				float b = 1.0 / (1.0 + exp(iWeights4[3] * self + iWeights4[4]  * peers + iWeights4[5])); 
				float c = 1.0 / (1.0 + exp(iWeights4[6] * self + iWeights4[7]  * peers + iWeights4[8])); 
				float d = 1.0 / (1.0 + exp(iWeights4[9] * self + iWeights4[10] * peers + iWeights4[11])); 
				float f = 1.0 / (1.0 + exp(iWeights4[12] * a   + iWeights4[13] * b     + iWeights4[14] * c + iWeights4[15] * d + iWeights4[16]));
				float g = 1.0 / (1.0 + exp(iWeights4[17] * a   + iWeights4[18] * b     + iWeights4[19] * c + iWeights4[20] * d + iWeights4[21]));
				
				float h = 1.0 / (1.0 + exp(iWeights4[22]*f + iWeights4[23]*g + iWeights4[24] )); 
				gl_FragColor = vec4(h, h, h, 1.0);
			}
		}

		if(iMouse.x > 0.0 && iMouse.y > 0.0 && distance(gl_FragCoord.xy, iMouse) < 10.0)
		{
			float h = rand(uv);
			gl_FragColor = vec4(h, h, h, 1.0);
		}
		
	}
`;