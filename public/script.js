import p5 from "https://cdn.jsdelivr.net/npm/p5@1.11.3/+esm";

const sketch = (p) => {
  let spores = [];
  let mode = "scatter"; // Change to mode instead of state
  let fusePairs = []; // Array to track fused spores

  p.preload = () => {
    // preload function definition goes here (if needed)
  };

  p.setup = () => {
    p.createCanvas(innerWidth, innerHeight);

    // Generate 20 spores at the center of the canvas
    for (let i = 0; i < 150; i++) {
      spores.push(new Spore(p.width / 2, p.height / 2));
    }
  };

  p.draw = () => {
    p.background(20, 30, 20, 25); // Background with some trailing effect

    // Update and display spores based on the current mode
    for (let spore of spores) {
      spore.update();
      spore.display();
    }

    if (mode === "fuse") {
      handleFuseMode();
    } else if (mode === "fracture") {
      handleFractureMode();
    } else if (mode === "reform") {
      handleReformMode();
    }
  };

  // Handle mouse press for interaction
  p.mousePressed = () => {
    if (mode === "scatter") {
      mode = "fuse"; // After scatter, switch to fuse mode
      for (let spore of spores) {
        spore.angle = p.random(p.TWO_PI);
        spore.speed = p.random(2, 5);
      }
    } else if (mode === "fuse") {
      mode = "fracture"; // Switch to fracture mode
    } else if (mode === "fracture") {
      mode = "reform"; // Switch to reform mode
    } else if (mode === "reform") {
      mode = "scatter"; // Go back to scatter mode
    }
  };

  // Handle Fuse Mode: Spore fusion when close enough
  function handleFuseMode() {
    for (let i = 0; i < spores.length; i++) {
      for (let j = i + 1; j < spores.length; j++) {
        let d = p.dist(spores[i].x, spores[i].y, spores[j].x, spores[j].y);
        if (d < 100) {
          // Draw lines between spores within range
          p.stroke(255, 200, 200);
          p.line(spores[i].x, spores[i].y, spores[j].x, spores[j].y);

          // Gradually move spores together
          spores[i].x = p.lerp(spores[i].x, spores[j].x, 0.01);
          spores[i].y = p.lerp(spores[i].y, spores[j].y, 0.01);
          spores[j].x = p.lerp(spores[j].x, spores[i].x, 0.01);
          spores[j].y = p.lerp(spores[j].y, spores[i].y, 0.01);

          // Store the fused pairs
          fusePairs.push([spores[i], spores[j]]);
        }
      }
    }
  }

  // Handle Fracture Mode: Break lines and repel spores
  function handleFractureMode() {
    for (let pair of fusePairs) {
      let spore1 = pair[0];
      let spore2 = pair[1];
      p.stroke(100, 100, 100, 50); // Ghost lines
      p.line(spore1.x, spore1.y, spore2.x, spore2.y);
    }

    // Repel spores randomly
    for (let spore of spores) {
      spore.x += p.random(-5, 5);
      spore.y += p.random(-5, 5);
    }
  }

  // Handle Reform Mode: Slowly reconnect spores
  function handleReformMode() {
    for (let pair of fusePairs) {
      let spore1 = pair[0];
      let spore2 = pair[1];
      p.stroke(255, 100, 100);
      p.line(spore1.x, spore1.y, spore2.x, spore2.y);

      // Slowly move spores back to their initial fused positions
      spore1.x = p.lerp(spore1.x, spore2.x, 0.01);
      spore1.y = p.lerp(spore1.y, spore2.y, 0.01);
      spore2.x = p.lerp(spore2.x, spore1.x, 0.01);
      spore2.y = p.lerp(spore2.y, spore1.y, 0.01);
    }
  }

  // Spore class to represent each individual spore's behavior
  class Spore {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.color = p.color(
        p.random([255, 255, 0, 0]),
        p.random([255, 0, 255, 255]),
        p.random([0, 50, 200])
      ); // Random color for spores
      this.angle = p.random(p.TWO_PI);
      this.speed = p.random(1, 3);
      this.noiseOffsetX = p.random(1000);
      this.noiseOffsetY = p.random(1000);
    }

    update() {
      // Perlin noise-based movement to make it organic
      this.x += p.map(p.noise(this.noiseOffsetX), 0, 1, -2, 2);
      this.y += p.map(p.noise(this.noiseOffsetY), 0, 1, -2, 2);

      // Update noise offsets
      this.noiseOffsetX += 0.01;
      this.noiseOffsetY += 0.01;

      // Boundary logic: if outside canvas, rebound with friction
      if (this.x > p.width + 5 || this.x < -5) {
        this.x = p.constrain(this.x, 5, p.width - 5);
        this.speed *= 0.95;
      }
      if (this.y > p.height + 5 || this.y < -5) {
        this.y = p.constrain(this.y, 5, p.height - 5);
        this.speed *= 0.95;
      }
    }

    display() {
      p.noStroke();
      p.fill(this.color);
      p.ellipse(this.x, this.y, 10, 10); // Render spore
    }
  }
};

// Pass the sketch in to a new p5 instance
new p5(sketch);
