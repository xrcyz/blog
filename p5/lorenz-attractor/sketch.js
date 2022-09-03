
var sketch = function(p)
{
    'use strict'; 

    const initCamDist = 300;
    const camFOV = 3.1415926535 / 3;
    let camPos, camUp, camFocus;
    let rotation; //rotation about the vertical Y axis
    let inclination; //rotation about the horizontal X axis
    let invZoom;

    let a, d;
    let breadcrumbs = [];

    p.setup = function() 
    {
        let canvas = p.createCanvas(400, 400, p.WEBGL);

        //disable scrolling when mouse is over the canvas
        //let htmlCanvasRef = document.getElementById( canvas.id() );
        //document.addEventListener("wheel", (e)=>{
        //    if(e.target === htmlCanvasRef) 
        //    { 
        //        e.preventDefault(); 
        //    } 
        //}, { passive: false });

        p.colorMode(p.HSB,1,1,1,1);
        
        //camera
        camPos = p.createVector(0, initCamDist, 0);
        camUp = p.createVector(0, 0, 1);
        camFocus = p.createVector(0, 0, 0);
        
        p.camera(camPos.x,   camPos.y,   camPos.z,
                 camFocus.x, camFocus.y, camFocus.z,
                 camUp.x,    camUp.y,    camUp.z);
        
        p.perspective(camFOV, p.width / p.height, 0.1, 1000);
        
        rotation = p.createVector(camUp.x, camUp.z); //vector on a unit circle about the vertical axis (plan view rotation)
        inclination = p.createVector(0, camPos.y); //vector on a unit circle about the easting axis 
        invZoom = 1;
        
        rotation.rotate(p.PI/4);
        inclination.rotate(0.9*p.PI/4);
        
        let distance = p.pow(p.random(1.0), 0.5) * 30.0;
        let theta = p.random(p.TWO_PI);
        let phi = p.random(p.TWO_PI);
        a = p.createVector(
            distance * p.cos(theta) * p.cos(phi),
            distance * p.cos(theta) * p.sin(phi),
            distance * p.sin(theta)
        );
        d = 0;

    }

    p.mouseDragged = function()
    {
        const xSensitivity = 0.01;
        let deltaRotation = xSensitivity * (p.mouseX - p.pmouseX);
        rotation.rotate(deltaRotation);
        
        const ySensitivity = 0.01;
        let deltaInclination = ySensitivity * (p.mouseY - p.pmouseY); 
        inclination.rotate(deltaInclination);     
    }

    p.mouseWheel = function(event) 
    {
        if(p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.width)
        {
            invZoom -= event.delta / 1000;
            if(invZoom < 0.001) invZoom = 0.001;

            //disable browser scrolling
            return false;
        }
    }

    p.draw = function() 
    {
        //camera 
        p.rotateX(inclination.heading());
        p.rotateY(rotation.heading());
        p.scale(invZoom);
                
        //draw stuff
        p.noStroke();
        p.background(0.1);
        
        p.push();
        p.stroke(0.7,0.7,0.7,0.5);
        p.noFill();
        p.box(150);
        
        p.noStroke();
        p.fill(255);
        p.translate(a.x, a.y, a.z);
        p.sphere(1);
        p.pop();
        
        let dx = 10.0 * (a.y - a.x);
        let dy = a.x * (28.0 - a.z) - a.y;
        let dz = a.x*a.y - 8.0/3.0 * a.z;
        
        d += p.sqrt(dx**2+dy**2+dz**2)/1000;
        
        a.x += dx * 0.01;
        a.y += dy * 0.01;
        a.z += dz * 0.01;
        
        breadcrumbs.push(a.copy());
        if(breadcrumbs.length > 1500) breadcrumbs.shift();
        
        p.stroke(255);
        p.strokeWeight(2);
        p.noFill();
        for(let i = 1; i < breadcrumbs.length; i++)
        { 
            p.line(breadcrumbs[i-1].x, breadcrumbs[i-1].y, breadcrumbs[i-1].z, 
                   breadcrumbs[i].x, breadcrumbs[i].y, breadcrumbs[i].z);

        }
    }
}

var myp5 = new p5(sketch, "p5canvas");



/*
document.getElementById( "p5canvas" ).onwheel = function(event){
    event.preventDefault();
};
*/