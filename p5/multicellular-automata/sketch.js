
var sketch = function(p)
{
  const STEP = 8,
        SIZE = 50,
        DIM = STEP * SIZE;

  let grid = [];
  let indexer = [0, 1];
  let coords = [];
  let peers = [];
  let peers2 = [];
  let colormap;

  let layer1_values = [];
  let layer1_weights = [];
  let layer2_weights = [];

  p.setup = function() 
  {
    p.createCanvas(DIM, DIM);
    //p.colorMode(p.RGB, 1, 1, 1);
    p.noStroke();
    colormap = new ColorMap(); 
      
    initWeights();
    
    initGrids();
    initCoords();
    initPeers();
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
    if (p.key == ' ')
    {
      //initWeights();
      initGrids();
    }
  }

  function initGrids()
  {
    //read and write grids
    grid[0] = []; //read
    grid[1] = []; //write
    grid[2] = []; //lerp
    
    for(let i = 0; i < SIZE; i++)
    {
      grid[0][i] = [];
      grid[1][i] = [];
      grid[2][i] = [];
      
      for(let j = 0; j < SIZE; j++)
      {
        //let d = p.dist(i, j, SIZE/2, SIZE/2);
        //let n = p.noise(i, j);
        let val = p.random(1);//(d > SIZE / 4) ? 0 : (n < 0.2 || n > 0.8) ? random(1) : 0;
        grid[0][i][j] = val;
        grid[1][i][j] = 0;
        grid[2][i][j] = val;
        
      }
    }
  }

  function initWeights()
  {
    layer1_weights = [10.973058626415716,-6.882420393076358,-6.472697193683041,-6.225740538860715,1.9855038796214672,-8.311172029731155,2.913092729426837,7.165373125413817,3.7388418791459257,8.32348106805982,-1.3621789601004946,1.7338018041002154,2.190137906213837,6.5666361569174505,0.6598772185188633,-0.23700594708888625,3.624890623380968,-1.9432823112943622,4.602413773576723,4.781895348175026,10.227980856413296,9.204566665230162,-4.644734074365102,-9.944958415424956,-0.9639914216029231,-1.6974928320798741,-7.8359120688803365,0.9280999039871425,-5.559501492937156,3.4767442591262796,3.6662689903055123,-6.942929980654792,-9.551965800136614,-8.49015825444981,7.918839696420882,2.1179018161737178,-4.430117688554398,7.747260335215446,1.1849968620307927,-2.5650701627679644,1.4150605002626582,0.4580694927317549,7.393274787748762,-8.485593839289292,0.8915560085690521,7.810115964794862,7.77747968589598,6.111766357938148];
    layer2_weights = [-4.465715849452671,4.421196348692869,2.2020236109608264,0.21264902315756426,-2.4558418341679955,0.9805381885297899,-2.11202564931822,-1.1776746246807934,-5.207194342974382,6.86710793316994,7.264028310013627,6.358086200730302,7.214597870604088];
  }

  function initCoords()
  {
    for(let i = 0; i < SIZE; i++)
    {
      for(let j = 0; j < SIZE; j++)
      {
        coords.push([i,j]);
      }
    }
  }

  function initPeers()
  {
    for(let x = -1; x <= 1; x++)
    {
      for(let y = -1; y <= 1; y++)
      {
        if(x == 0 && y == 0) continue;
        peers.push([x, y]);
      }
    }
    
    for(let x = -2; x <= 2; x++)
    {
      for(let y = -2; y <= 2; y++)
      {
        if(p.abs(x) != 2 && p.abs(y) != 2) continue; //second ring around cell
        peers2.push([x, y]);
      }
    }
  }

  p.draw = function() 
  {
    for(let i = 0; i < SIZE; i++)
    {
      for(let j = 0; j < SIZE; j++)
      {
        let val = grid[2][i][j];
        
        p.fill(colormap.getColor(val));
        p.square(i * STEP, j * STEP, STEP);
        
        if(p.dist(p.mouseX / p.width * SIZE, p.mouseY / p.width * SIZE, i, j) < SIZE / 10)
        {
          grid[indexer[0]][i][j] = p.random(1);
        }
      }
    }
    updateGridsNeural();
    updateGridsNeural();
  }

  function updateGridsNeural()
  {
    let self = 0;
    let nh1 = 0;
    let nh2 = 0;
    
    for(let coord of coords) //for each cell
    {
      self = grid[indexer[0]][coord[0]][coord[1]];
      //neighborhood 1
      nh1 = 0;
      for(let peer of peers)
      {
        let i = (coord[0] + peer[0] + SIZE) % SIZE;
        let j = (coord[1] + peer[1] + SIZE) % SIZE;
        nh1 += grid[indexer[0]][i][j]; 
      }
      //neighborhood 2
      nh2 = 0;
      for(let peer of peers2)
      {
        let i = (coord[0] + peer[0] + SIZE) % SIZE;
        let j = (coord[1] + peer[1] + SIZE) % SIZE;
        nh2 += grid[indexer[0]][i][j]; 
      }
      //layer 1
      for(let i = 0; i < 12; i++)
      {
        layer1_values[i] = 1 / (1 + p.exp(layer1_weights[4 * i + 0] * self + 
                                          layer1_weights[4 * i + 1] * nh1 + 
                                          layer1_weights[4 * i + 2] * nh2 + 
                                          layer1_weights[4 * i + 3] * 1)); 
      }
      //output
      let cross_product = 0;
      for(let i = 0; i < layer1_values.length; i++)
      {
        cross_product += layer1_values[i] * layer2_weights[i];
      }
      cross_product += layer2_weights[layer1_values.length]; //bias
      
      let output = 1 / (1 + p.exp( cross_product )); 
      //let amt = 0.04 * output;
      //output = constrain(output + amt * (random(1) > 0.5 ? 1 : -1), 0, 1);
      //let d = 0.045 * dist(coord[0], coord[1], SIZE/2, SIZE/2); 
      //if(d > 1) output /= (d * d);
      
      grid[indexer[1]][coord[0]][coord[1]] = output;
      if(indexer[0] == 0)
      {
        grid[2][coord[0]][coord[1]] = p.lerp(grid[2][coord[0]][coord[1]], output, 0.5); //lerp the accumulated value
      }
    }
    
    indexer[0] = 1 - indexer[0];
    indexer[1] = 1 - indexer[1];
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