
var sketch = function(p)
{
  let canvas;
  let rd;

  p.setup = function() 
  {
    canvas = p.createCanvas(400, 400, p.WEBGL);
    rd = new RD();
    p.frameRate(10);
  }

  p.mouseClicked = function()
  {
    console.log(frameRate());
  }

  p.keyPressed = function()
  {
    if(p.key == ' ')
    {
      rd.reset();
    }
  }

  p.draw = function() 
  {
    p.background(255);
	  rd.draw();
  }

  class RD
  {
    constructor()
    {
      //one off-screen buffer to do the reaction diffusion
      this.pg = p.createGraphics(150, 150, p.WEBGL); 
      this.pg.noStroke(); 
      canvas.getTexture(this.pg).setInterpolation(p.NEAREST, p.NEAREST);	
      this.pg.pixelDensity(1);
      
      this.shader0 = this.pg.createShader(vert0, init_frag);
      this.shader1 = this.pg.createShader(vert0, rd_frag);
      
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
      //first off-screen buffer to do the reaction diffusion
      this.pg.shader(this.shader0);
      let seed = p.random(10000);
      //print("seed = " + seed);
      this.shader0.setUniform("iSeed", seed);
      this.shader0.setUniform("iResolution", [this.pg.width * this.pg.pixelDensity(), this.pg.height * this.pg.pixelDensity()]);
      
      this.update();
      
      //feed pg1 into shader2 to draw  a recolored image on pg2
      this.shader2.setUniform("iChannel0", this.pg);
      this.shader2.setUniform("iTime", p.millis() * 0.001);
      this.pg2.quad(
      -1, -1, 
      1, -1, 
      1,  1, 
      -1,  1);
      

      this.pg.shader(this.shader1);
      this.shader1.setUniform("iResolution", [this.pg.width * this.pg.pixelDensity(), this.pg.height * this.pg.pixelDensity()]);
      this.shader1.setUniform("iChannel0", this.pg); 
      this.shader1.setUniform("iMouse", [0.0, 0.0]);
      this.shader1.setUniform("iTime", 0.0);
      this.shader1.setUniform("iSeed", seed);
      
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
}

var myp5 = new p5(sketch, 'p5canvas');