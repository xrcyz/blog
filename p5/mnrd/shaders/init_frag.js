const init_frag = `
//preprocessor macro to set the default precision of floats
#ifdef GL_FRAGMENT_PRECISION_HIGH
		precision highp float;
#else
		precision mediump float;
#endif

// varying variables are assigned a value at each vertex in the vertex shader,
// and then interpolated at each pixel in the fragment shader
varying highp vec3 vPos;

//uniform variables are globally shared across all vertices and pixels
//they are dispatched to the shader with shader.setUniform()
uniform vec2 iResolution;    //viewport resolution (in pixels)
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
float rand(vec2 co){ return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * (43758.5453 + iSeed)); }
float rand(vec3 co){ return rand(co.xy+rand(co.z)); }

void main() 
{
		vec2 uv = (vec2(vPos.x, -vPos.y) + 1.0) / 2.0; //gl_FragCoord.xy / iResolution; //
		
		float dist = distance(uv,vec2(1.0));
		
		if(dist < 10.0)
		{
			gl_FragColor = vec4( vec3(rand(uv)), 1.0 );
		}
		else
		{
			gl_FragColor = vec4( vec3(0.0), 1.0 );
		}
		
		//gl_FragColor = vec4( uv.x, uv.y, 0.0, 0.0 ); 
}
`;