var sketch = function(p)
{
  let canvas;
  let ca;

  p.setup = function() 
  {
    canvas = p.createCanvas(400, 400, p.WEBGL);
    ca = new CA();
    p.textureMode(p.NORMAL);
    p.frameRate(10);
  }

  p.mouseClicked = function()
  {
    if(p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height)
    {
      //initWeights();
      initGrids();
    }
  }

  p.keyPressed = function()
  {
    if(p.key == ' ')
    {
      ca.reset();
    }
  }

  p.draw = function() 
  {
    p.background(255);
	  ca.draw();
  }

  class CA
  {
    constructor()
    {
      //one off-screen buffer to do the reaction diffusion
      this.pg = p.createGraphics(100, 100, p.WEBGL); 
      this.pg.noStroke(); 
      canvas.getTexture(this.pg).setInterpolation(p.NEAREST, p.NEAREST);	
      this.pg.pixelDensity(1);
      
      this.shader0 = this.pg.createShader(vert0, init_frag);
      this.shader1 = this.pg.createShader(vert0, ca_frag);
      
      //second off-screen buffer to recolor the image
      this.pg2 = p.createGraphics(this.pg.width, this.pg.height, p.WEBGL); 
      this.pg2.noStroke(); 
      canvas.getTexture(this.pg2).setInterpolation(p.NEAREST, p.NEAREST);	
      this.pg2.pixelDensity(1);
      
      this.shader2 = this.pg2.createShader(vert0, recolor_frag);
      
      this.firstPass = true;
      this.reset();
    }
    
    reset()
    {
      this.doFirstPass();
      
      this.firstPass = false;
    }
    
    doFirstPass()
    {
      let ngol3 = [-7.24,  0, 7.24*0.623, 0, -4.584, 4.584*1.236, 0, -2.869, 2.869*2.945, 0, -7.912, 7.912*3.544, 2.799,  0, -2.799, 2.799, 2.799 * 0.692, -3.848, -3.848, 0, 3.848, 3.848 * 1.022, -9.591, -9.591, 9.591*0.795];
      let ngol6 = [-1.557, 0, 1.557*0.180, 0, -1.5007, 1.5007*1.70015, 0, -2.912,  2.912*3.3981, 0, -7.0018, 7.0018*3.9009, 4.663, 0, -4.663, 4.663,  4.663*0.4996, -8.3288, -8.3288, 0, 8.3288, 8.3288*1.7439, -9.937,  -9.937, 9.937*0.1396];
      let ngol10 = [-4.524,0.000,3.325,0.000,-6.858,10.883,0.000,-1.886,5.791,0.000,-1.294,5.823,7.109,0.000,-7.109,7.109,2.274,-6.383,-6.383,0.000,6.383,8.572,-8.005,-8.005,3.482];
      let ngol13 = [-3.607,-1.4,5.244,0.292,1.5,-4.2,-2.8,-2.287,6.1,1.174,1.871,-6.339,-3.316,5.5,-6.944,7.138,3.4,-4.549,2.4,-6.004,2.4,0.943,10.3,-9.7,2.99];

      //first off-screen buffer to do the reaction diffusion
      this.pg.shader(this.shader0);
      let seed = p.random(10000);
      //print("seed = " + seed);
      this.shader0.setUniform("iSeed", seed);
      this.shader0.setUniform("iResolution", [this.pg.width * this.pg.pixelDensity(), this.pg.height * this.pg.pixelDensity()]);
      
      this.update();
      
      this.pg.shader(this.shader1);
      this.shader1.setUniform("iResolution", [this.pg.width * this.pg.pixelDensity(), this.pg.height * this.pg.pixelDensity()]);
      this.shader1.setUniform("iChannel0", this.pg);
      this.shader1.setUniform("iMouse", [-1.0, -1.0]);
      this.shader1.setUniform("iTime", 0.0);
      this.shader1.setUniform("iSeed", seed);
      this.shader1.setUniform("iWeights1", ngol3);
      this.shader1.setUniform("iWeights2", ngol6);
      this.shader1.setUniform("iWeights3", ngol10);
      this.shader1.setUniform("iWeights4", ngol13);
      
      //second off-screen buffer to recolor the image
      this.pg2.shader(this.shader2);
      this.shader2.setUniform("iResolution", [this.pg.width * this.pg.pixelDensity(), this.pg.height * this.pg.pixelDensity()]);
      this.shader2.setUniform("iChannel0", this.pg);
      this.shader2.setUniform("iMouse", [0.0, 0.0]);
      this.shader2.setUniform("iTime", 0.0);
      this.shader2.setUniform("iSeed", seed);
    }
    
    update()
    {
      this.shader1.setUniform("iTime", p.millis() * 0.001);
      this.shader1.setUniform("iMouse", [p.mouseX/p.width*this.pg.width, (p.height - p.mouseY)/p.height*this.pg.height]);
      
      //this draws a quad fully across the texture1 canvas
      //since calling texture1.shader(myShader) subs in our vertex shader with no transforms
      //and the fragment shader lerps the vertices to figure out the pixels
      //(the default vertex shader for immediate-mode graphics is ./src/webgl/shaders/immediate.vert)
      this.pg.quad(
      -1, -1, 
      1, -1, 
      1,  1, 
      -1,  1);
      
      //feed pg1 into shader2 to draw  a recolored image on pg2
      this.shader2.setUniform("iChannel0", this.pg);
      this.shader2.setUniform("iTime", p.millis() * 0.001);
      this.pg2.quad(
      -1, -1, 
      1, -1, 
      1,  1, 
      -1,  1);
      
    }
    
    draw(x, y)
    {
      let size = p.width;
      
      x = x || -size/2;
      y = y || -size/2;
      
      this.update();
      p.texture(this.pg2);
      p.rect(x, y, size, size * this.pg.height / this.pg.width);
    }
  }

  class ColorMap
  {
    
    getColor(pct)
    {
      let colormap = this.viridis;
      
      let increment = 1.0 / (colormap.length - 1.0);
      let index_fraction = pct / increment; 
      let rgb1 = colormap[p.floor(index_fraction)];
      let rgb2 = colormap[p.ceil(index_fraction)];
      
      let color1 = p.color(255*rgb1[0], 255*rgb1[1], 255*rgb1[2]);
      let color2 = p.color(255*rgb2[0], 255*rgb2[1], 255*rgb2[2]);
      let color3 = p.lerpColor(color1, color2, p.fract(index_fraction));
      
      return color3;
    }
    
    constructor()
    {		
      this.viridis = 
      [
        [0.267, 0.004, 0.329],
        [0.255, 0.267, 0.529],
        [0.165, 0.471, 0.557],
        [0.133, 0.659, 0.518],
        [0.478, 0.82, 0.318],
        [0.992, 0.906, 0.145],
      ];
      
      this.drylake = 
      [
        [0.023529412, 0.305882353, 0.407843137],
        [0.160784314, 0.396078431, 0.462745098],
        [0.266666667, 0.454901961, 0.490196078],
        [0.419607843, 0.525490196, 0.517647059],
        [0.525490196, 0.576470588, 0.549019608],
        [0.635294118, 0.658823529, 0.635294118],
        [0.674509804,	0.701960784,	0.678431373],
        [0.560784314,	0.564705882,	0.568627451],
        [0.521568627,	0.498039216,	0.51372549 ],
        [0.478431373,	0.450980392,	0.470588235],
      ];
      
      this.sunrise = 
      [
        [0.266666667, 0.243137255, 0.521568627],
        [0.392156863, 0.278431373, 0.552941176],
        [0.564705882, 0.337254902, 0.576470588],
        [0.690196078, 0.392156863, 0.615686275],
        [0.917647059, 0.478431373, 0.584313725],
        [1,           0.588235294, 0.521568627],
        [1,           0.807843137, 0.529411765],
        [1,           0.996078431, 0.603921569],
        [1,           1,           0.725490196],
        [1,           1,           0.9],
      ];
    }
  }
}

var myp5 = new p5(sketch, "p5canvas");