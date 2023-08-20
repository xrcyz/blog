
var sketch = function(p)
{
    //references
    //[Tarrou's Chalk Talk](https://www.youtube.com/watch?v=561VtgXaEYo)

    let A1, A2, B1, B2, M, P, Q, S, C;
    // A, B for tangent lines
    // M for point on bisector
    // P for point on circumference
    // Q for intersect
    // S for bisector
    // C for circle

    let bisector_slope, bisector_intercept, edge_slope, edge_intercept;
    let x1, y1, r1, x2, y2, r2;
    let time = 0;
    let theta = 0;
    let myvec;
    let invA2, invB2;

    p.setup = function() 
    {
        p.createCanvas(400, 400);
	
        A1 = p.createVector(p.width/2, p.height/2);
        B1 = A1.copy();
        theta = p.map(p.sin(time), -1, 1, p.PI / 12, 1.5*p.PI);
        myvec = p5.Vector.fromAngle(theta).setMag(1000);
        A2 = p.createVector(A1.x + 1000, A1.y );
        B2 = p.createVector(B1.x + myvec.x, B1.y - myvec.y);
        P = p.createVector(p.width/2, p.height/2);
        
        invA2 = p.createVector(A1.x - 1000, A1.y);
        invB2 = p.createVector(0,0);

        update_circumcentre();
    }

    p.mouseClicked = function()
    {
        console.log(p.mouseX, p.mouseY);
    }

    function update_circumcentre()
    {
        // P.x = 305; P.y = 173; 
        // theta=p.PI/6;
        
        theta = p.map(p.sin(time), -1, 1, p.PI / 4, 0.6*p.PI);
        myvec = p5.Vector.fromAngle(theta).setMag(1000);
        
        B2.x = B1.x + myvec.x;
        B2.y = B1.y - myvec.y;

        invB2.x = B1.x - myvec.x;
        invB2.y = B1.y + myvec.y;

        // Define direction vectors for lines A and B
        let dirA = p5.Vector.sub(A2, A1);
        let dirB = p5.Vector.sub(B2, B1);

        // Calculate determinants
        let detAB = dirA.x * dirB.y - dirA.y * dirB.x;

        // Find intersection point Q
        let t = ((B1.x - A1.x) * dirB.y - (B1.y - A1.y) * dirB.x) / detAB;
        Q = p5.Vector.add(A1, p5.Vector.mult(dirA, t));
        
        dirA.normalize();
        dirB.normalize();

        // Calculate the bisecting direction
        S = p5.Vector.add(dirA, dirB).normalize();
        M = get_point_on_line(Q, p5.Vector.add(Q,S), P);
        
        // Express bisector as a*x+b*y+c==0
        bisector_slope = (M.y - Q.y) / (M.x - Q.x); //rise over run
        // y = bisector_slope * x + b
        // substitute one of the point
        // y_Q = bisector_slope * x_Q + b
        bisector_intercept = Q.y - bisector_slope * Q.x;
        // then the centre of the circle is on the line:
        // (C.x, bisector_slope * C.x + bisector_intercept)
        
        //Get squared distance P to C
        // r**2 == (P.x - x)**2 + (P.y - y)**2 
        let [bm, bc] = [bisector_slope, bisector_intercept]; 
        // r**2 == (P.x - x)**2 + (P.y - (bm * x + bc))**2 
        // r**2 == P.x**2 -2*x*P.x + x**2 + P.y**2 - 2*P.y*(bm * x + bc) + (bm * x + bc)**2
        // r**2 == P.x**2 -2*x*P.x + x**2 + P.y**2 - 2*P.y*(bm * x + bc) + (bm * x)**2 + 2*bm*bc*x + bc**2
        // r**2 == (bm**2+1)*x**2+ (2*bm*bc - 2*P.x - 2*P.y*bm)*x + P.x**2 + P.y**2 + bc**2 - 2*P.y*bc
            
        // Express tangent A as a*x+b*y+c==0
        edge_slope = (A2.y - A1.y) / (A2.x - A1.x); //rise over run
        edge_intercept = A1.y - edge_slope * A1.x;
        // y = A_slope * x + A_intercept
        // A_slope * x - 1.0*y + A_intercept == 0
        
        //Get squared distance A to C
        // where tangent line is a*x+b*y+c==0
        // r**2 = (a*C.x + b*C.y + c)**2 / (a**2+b**2)
        let [em, ec] = [edge_slope, edge_intercept] // 'e' for 'edge'
        // r**2 = (em*C.x + -1*C.y + ec)**2 / (em**2+(-1)**2)
        // r**2 = (em*C.x -C.y + ec)**2 / (em**2+1)
        // substitute C.y = bm * C.x + bc
        // r**2 = (em*C.x - (bm * C.x + bc) + ec)**2 / (em**2+1)
        // r**2 = ((em-bm)*C.x - bc + ec)**2 / (em**2+1)
        // r**2 = ((em-bm)**2*C.x**2 + 2*(-bc+ec)*(em-bm)*C.x + ec**2) / (em**2+1)
            
        // set distances AP and CP equal and solve for C.x
        // (bm**2+1)*C.x**2+ (2*bm*bc - 2*P.x - 2*P.y*bm)*C.x + P.x**2 + P.y**2 + bc**2 - 2*P.y*bc == ((em-bm)**2*C.x**2 + 2*(-bc+ec)*(em-bm)*C.x + (-bc+ec)**2) / (em**2+1)
        // (em**2+1)*(bm**2+1)*x**2 + (em**2+1)*(2*bm*bc - 2*P.x - 2*P.y*bm)*x + (em**2+1)*(P.x**2 + P.y**2 + bc**2 - 2*P.y*bc) == ((em-bm)**2*C.x**2 + 2*(-bc+ec)*(em-bm)*C.x + (-bc+ec)**2)
        // ((em**2+1)*(bm**2+1) - (em-bm)**2)*x**2 + ((em**2+1)*(2*bm*bc - 2*P.x - 2*P.y*bm)-2*(-bc+ec)*(em-bm))*x + (em**2+1)*(P.x**2 + P.y**2 + bc**2 - 2*P.y*bc)-(-bc+ec)**2 == 0
        // use the quadratic formula x = (-b +- sqrt(b**2 - 4*a*c)) / (2*a)
        // let a = ((em**2+1)*(bm**2+1) - (em-bm)**2)
        // let b = ((em**2+1)*(2*bm*bc - 2*P.x - 2*P.y*bm)-2*(-bc+ec)*(em-bm))
        // let c = (em**2+1)*(P.x**2 + P.y**2 + bc**2 - 2*P.y*bc)-(-bc+ec)**2
        //solve for x
        let a = ((em**2+1)*(bm**2+1) - (em-bm)**2);
        let b = ((em**2+1)*(2*bm*bc - 2*P.x - 2*P.y*bm)-2*(-bc+ec)*(em-bm))
        let c = (em**2+1)*(P.x**2 + P.y**2 + bc**2 - 2*P.y*bc)-(-bc+ec)**2
        x1 = (-b + p.sqrt(b**2 - 4*a*c)) / (2*a);
        x2 = (-b - p.sqrt(b**2 - 4*a*c)) / (2*a);
        y1 = bm * x1 + bc;
        y2 = bm * x2 + bc;
        r1 = p.sqrt((P.x - x1)**2 + (P.y - y1)**2 );
        r2 = p.sqrt((P.x - x2)**2 + (P.y - y2)**2 );
    }

    p.draw = function() 
    {
        P.x = p.mouseX;
        P.y = p.mouseY;
        update_circumcentre();
        
        p.background(60);

        p.noStroke();
        p.fill(30);
        let _s = 10;
        for(let i = 0; i < _s; i++)
        {
            for(let j = 0; j < _s; j++)
            {
                if((i+j)%2==0) {
                    p.rect(p.width/_s * i, p.height/_s * j, p.width/_s, p.height/_s)
                }
            }
        }
        
        // draw tangents 
        p.fill(0);
        p.noStroke();
        p.beginShape();
        p.vertex(A1.x, A1.y);
        p.vertex(A2.x, A2.y);
        p.vertex(p.width, 0);
        p.vertex(B2.x, B2.y);
        p.endShape(p.CLOSE);
        p.beginShape();
        p.vertex(A1.x, A1.y);
        p.vertex(invA2.x, invA2.y);
        p.vertex(0, p.height);
        p.vertex(invB2.x, invB2.y);
        p.endShape(p.CLOSE);

        //draw circles
        if(x1) {
            p.stroke(255);
            p.fill(0,0,160,160);
            p.ellipse(x1, y1, 2*r1);
            p.fill(160,0,0,160);
            p.ellipse(x2, y2, 2*r2);
        }
        else 
        {
            // console.log("no solution")
        }
        
        //draw query point
        p.stroke(255);
        p.fill(255);
        p.ellipse(P.x, P.y, 10);
        // p.ellipse(Q.x, Q.y, 10);
        
        time += 0.01;
    }

    function get_point_on_line(line_start, line_end, query_point)
    {
        let SE = p5.Vector.sub(line_end, line_start);	
        let SQ = p5.Vector.sub(query_point, line_start);

        let sqmagSE = SE.magSq(); 
        if(sqmagSE == 0) 
        {
            throw new Error("A line cannot have zero length");
        }

        let SESQproduct = p5.Vector.dot(SQ, SE);
        let distance = SESQproduct / sqmagSE;

        return p5.Vector.add(line_start, SE.mult(distance));
    }


}

var myp5 = new p5(sketch, "p5canvas");