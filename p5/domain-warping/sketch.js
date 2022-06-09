
var sketch = function(p)
{
  let pg;
  let offsets = [];
  let scale = 0.8;
  let row = 0;
  let colorMap;

  p.setup = function() 
  {
    p.createCanvas(400, 400);
    colorMap = new ColorMap();
    reset();
  }

  p.mouseClicked = function()
  {
    reset();
  }

  function reset()
  {
    p.loop();
    row = 0; 
        
    for(let i = 0; i < 30; i++)
    {
      offsets[i] = p.random(-1000, 1000);
    }
    
    pg = p.createGraphics(p.width, p.height); 
    pg.background('#3E4451'); 
    update();
  }

  p.draw = function() 
  {
    //background(100);
    if(row < p.height) 
    {
      update();
    }
    p.image(pg, 0, 0, p.width, p.height);
  }

  function update()
  {
    pg.loadPixels();
    const d = pg.pixelDensity();
    
    let y = row;
    for(let x = 0; x < p.width; x++)
    {
      for (let i = 0; i < d; i++) 
      {
        for (let j = 0; j < d; j++) 
        {
          let index = 4 * ((y * d + j) * p.width * d + (x * d + i));
          let n = getNoise(x, y);
          //n = p.sin(n*n*p.PI/2.0)
          let col = colorMap.getColor(n);
          pg.pixels[index] =   p.red(col);
          pg.pixels[index+1] = p.green(col);
          pg.pixels[index+2] = p.blue(col);
          pg.pixels[index+3] = 255;
        }
      }
    }
    pg.updatePixels(); 
    
    row++;
  }

  function getNoise(x, y)
  {
    let n = noise1(x / p.width, y / p.width);
    
    return p.sin(n*n*p.PI/2.0);
  }

  function noise1(x, y)
  {
    x *= 800;
    y *= 800;
    
    let n1 = p.noise(x * 0.10 * scale + offsets[2], y * 0.10 * scale + offsets[3]);
    let n2 = p.noise(x * 0.12 * scale + offsets[4], y * 0.12 * scale + offsets[5]);
    
    n1 = p.map(p.sin(p.map(n1, 0, 1, 0, p.TWO_PI)), -1, 1, -0.15, 0.15) + noise4(x, y); 
    n2 = p.map(p.sin(p.map(n2, 0, 1, 0, p.TWO_PI)), -1, 1, -0.15, 0.15) + noise4(x, y); 
    
    let r1 = p.noise(x * 0.01 + offsets[6] + n1 + 3*noise2(2*x, 2*y), y * 0.01 + offsets[7] + n2 + 3*noise2(2*x, 2*y));
    
    return r1;
  }

  function noise2(x, y)
  {
    let n1 = p.noise(x * 0.12 * scale + offsets[2], y * 0.12 * scale + offsets[3]);
    let n2 = p.noise(x * 0.10 * scale + offsets[4], y * 0.10 * scale + offsets[5]);
    
    n1 = p.map(n1, 0, 1, -0.1, 0.1); 
    n2 = p.map(n2, 0, 1, -0.1, 0.1); 
    
    let r1 = p.noise(x * 0.01 + n1 + offsets[6], y * 0.01 + n2 + offsets[7]);
    
    return r1;
  }

  function noise3(x, y)
  {
    
    let n1 = p.noise(x * 0.012 * scale + offsets[2], y * 0.012 * scale + offsets[3]);
    let n2 = p.noise(x * 0.010 * scale + offsets[4], y * 0.010 * scale + offsets[5]);
    
    n1 = p.map((n1 * 100) % 17, 0, 6, -0.1, 0.1); 
    n2 = p.map((n2 * 100) % 17, 0, 6, -0.1, 0.1); 
    
    let r1 = p.noise(x * 0.01 + n1 + offsets[6], y * 0.01 + n2 + offsets[7]);
    
    return r1;
  }

  function noise4(x, y)
  {
    
    let n1 = p.noise(x * 0.012 * scale + offsets[2], y * 0.012 * scale + offsets[3]);
    let n2 = p.noise(x * 0.010 * scale + offsets[4], y * 0.010 * scale + offsets[5]);
    
    n1 = p.map(n1, 0, 1, -3, 3); 
    n2 = p.map(n2, 0, 1, -3, 3); 
    
    let r1 = p.noise(x * 0.01 + n1 + offsets[6], y * 0.01 + n2 + offsets[7]);
    
    return r1;
  }

  class ColorMap
  {
    
    getColor(pct)
    {
      let colormap = this.sunrise;
      
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