const vert0 = `
// attribute variables have one value per vertex, such as coordinate or color.
// attributes are sent to the vetex shader by p5.Shader.js
attribute vec3 aPosition;

// varying variables are assigned a value at each vertex in the vertex shader,
// and then interpolated at each pixel in the fragment shader
varying highp vec3 vPos;

void main() 
{
	// gl_Position is a reserved variable in WebGL 1.0 that specifies the coordinates of the vertex in the clip coordinate system [-1..1]
	gl_Position = vec4(aPosition, 1.0);
	vPos = gl_Position.xyz;
}
`;