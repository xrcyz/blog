
var sketch = function(p)
{
  let snake;

  p.setup = function() 
  {
    p.pixelDensity(1);
    p.createCanvas(400, 400);
    
    console.log(p.displayDensity());
    reset();

  }

  p.mouseClicked = function()
  {
    reset();
  }

  function reset()
  {
    snake = new Snake(); 

    update();
  }

  p.draw = function() 
  {
    update();
  }

  function update()
  {
    p.background('#3E4451'); 
    snake.draw();
  }
  
  const SNAKE_SCALE = 1.1;

  class Snake
  {
    constructor()
    {
        this.lerpCentroid = p.createVector(p.width/2, p.height/2); 
        
        this.joints = []; 

        for(let i = 0; i < 30; i++)
        {
            this.joints.push(new Joint(this, i, 50 + i * SNAKE_SCALE * 10, p.height/2));
        }

        this.head = this.joints[this.joints.length-1];

        this.springs = [];
        for(let i = 1; i < this.joints.length; i++)
        {
            this.springs.push(new Spring(this.joints[i-1], this.joints[i], SNAKE_SCALE * 10.0));
        }

        //bracers
        for(let i = 2; i < this.joints.length; i++)
        {
            this.springs.push(new Spring(this.joints[i-2], this.joints[i], SNAKE_SCALE * 35.0));
        }

        this.muscles = [];
        for(let i = 2; i < this.joints.length; i++)
        {
            this.muscles.push(new Muscle(this, this.joints[i-2], this.joints[i-1], this.joints[i]));
        }
    }

    updateCentroid()
    {
        let pos = p.createVector(0,0);
        for(let i = 0; i < this.joints.length; i++)
        {
            pos.add(this.joints[i].position);
        }
        pos.div(this.joints.length);

        this.lerpCentroid = p5.Vector.lerp(this.lerpCentroid, pos, 0.2); 
    }

    update()
    {
        for(let i = 0; i < this.joints.length; i++)
        {
            this.joints[i].update();
        }
        for(let i = 0; i < this.springs.length; i++)
        {
            this.springs[i].update();
        }
        
        for(let i = 0; i < this.muscles.length; i++)
        {
            let flex = p.sin(1.5 * p.millis() / 1000 + 5 * p.PI * i / this.muscles.length);  
            this.muscles[i].update(flex);
        }

        this.updateCentroid();
    }

    draw()
    {
        this.update(); 

        p.translate(p.width/2 - this.lerpCentroid.x, p.height/2 - this.lerpCentroid.y); 

        //grid
        p.fill(255,20);
        let gridUnit = 100;
        let corner = p.createVector(gridUnit * p.floor(this.lerpCentroid.x/gridUnit), gridUnit * p.floor(this.lerpCentroid.y/gridUnit));
        
        for(let i =-3; i <= 3; i ++)
        {
            for(let j =-3; j <= 3; j ++)
            {
                if((p.floor(this.lerpCentroid.x/100) + p.floor(this.lerpCentroid.y/100) + i + j)%2 == 0) 
                {
                    p.rect(corner.x + i * gridUnit, corner.y + j * gridUnit, gridUnit, gridUnit);
                }
                
            }
        }
       
        p.noStroke();
        for(let i = 1; i < this.joints.length; i++)
        {
            p.line(this.joints[i-1].position.x, this.joints[i-1].position.y, this.joints[i].position.x, this.joints[i].position.y);
        }
        p.noStroke();
        p.fill(30);
        for(let i = 0; i < this.joints.length; i++)
        {
            let d = p.map(i, 0, this.joints.length, 4, 16);
            p.ellipse(this.joints[i].position.x, this.joints[i].position.y, d);
        }

        
        p.ellipse(this.head.position.x, this.head.position.y, 10);
        p.noStroke();
        p.fill(250,0,0);
        let v = p5.Vector.sub(this.head.position, this.joints[this.joints.length-2].position)
            .setMag(5).rotate(p.PI/2);
        p.ellipse(this.head.position.x + v.x, this.head.position.y + v.y, 2);
        v.rotate(p.PI);
        p.ellipse(this.head.position.x + v.x, this.head.position.y + v.y, 2);
    }

  }

  class Muscle
  {
      constructor(snake, joint_a, joint_b, joint_c)
      {
        this.snake = snake;
        this.joint_a = joint_a;
        this.joint_b = joint_b;
        this.joint_c = joint_c;
      }

      update(flex)
      {
        let dir_a = p5.Vector.sub(this.joint_a.position, this.joint_b.position)
            .rotate(p.PI/2)
            .setMag(flex * 0.2 * SNAKE_SCALE);
        let dir_c = p5.Vector.sub(this.joint_c.position, this.joint_b.position)
            .rotate(p.PI/2)
            .setMag(-flex * 0.2 * SNAKE_SCALE);

        //if a joint is pushed into the ground
        //the ground pushes back
        //propelling connected joints forward
        if(this.joint_c == this.snake.head) return;

        let dirHead = p5.Vector.sub(this.snake.head.position, this.joint_a.position); 
        
        if(dirHead.dot(this.joint_a.velocity) > 0) //positive dot means same dir
        {
            this.joint_a.applyForce(dir_a);
            this.joint_c.applyForce(dir_c);
            this.joint_b.applyForce(p.createVector(0,0).sub(dir_a).sub(dir_c));
        }
        else //tail moving away from head
        {
            //a resists movement
            let g = dir_a.copy().mult(0.2);
            this.joint_a.applyForce(dir_a.sub(g));
            this.joint_c.applyForce(dir_c.add(g));
            this.joint_b.applyForce(p.createVector(0,0).sub(dir_a).sub(dir_c).add(g));
        }
    }
  }

  class Spring
  {
      constructor(joint_a, joint_b, rest_length)
      {
          this.rest_length = rest_length || 5.0 * SNAKE_SCALE;
          this.k = 0.8 * 0.16; //spring constant
          this.joint_a = joint_a;
          this.joint_b = joint_b;
      }

      update()
      {
          let dir = p5.Vector.sub(this.joint_a.position, this.joint_b.position);
          let stretch = dir.mag() - this.rest_length; 
          
          if(stretch < 0) 
          {
              dir.setMag(-this.k * stretch); //for e against compresion
          }
          else
          {
              dir.setMag(-this.k * stretch); //force against tension
          }

          this.joint_a.applyForce(dir);
          dir.mult(-1);
          this.joint_b.applyForce(dir);

      }
  }

  class Joint
  {
    constructor(snake, index, x, y)
    {
        this.snake = snake; 
        this.index = index;

        this.radius = 1.5;
		this.maxspeed = 200;    // Maximum speed
        this.damping = 0.95;
        this.mass = 0.5;

        this.acceleration = p.createVector(0, 0);
		this.velocity = p5.Vector.random2D().mult(this.maxspeed);
		this.position = p.createVector(x, y);
		
    }

    applyForce(force)
    {
        let f = force.copy().div(this.mass);

        this.acceleration.add(f);
    }

    update()
    {
        //anisotropic friction - damping is greater for nodes against the direction of travel
        let dirHead = p5.Vector.sub(this.snake.head.position, this.position); 
        
        if(this == this.snake.head)
        {
            this.damping = 0.95;
        }
        else if(dirHead.dot(this.velocity) > 0) //positive dot means same dir
        {
            this.damping = 0.95;
        }
        else
        {
            this.damping = 0.85;
        }

        this.velocity.add(this.acceleration);
        this.velocity.mult(this.damping);
		this.velocity.limit(this.maxspeed);
		this.position.add(this.velocity);
		this.acceleration.mult(0);
    }
  }
}

var myp5 = new p5(sketch, "p5canvas");