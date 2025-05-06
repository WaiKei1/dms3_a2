// p5 file and p5.min.js are already loaded inside the HTML file
// My idea is to show the mycelial cycle of a fungus
// The cycle = scatter → fracture → reform (looping endlessly)

const sketch = (p) => {
  //array to store spore object (dots)
  let spores = [];

  //the default mode when the sketch starts
  let mode = "scatter";

  //variables to store the sound effects for each mode
  let soundScatter, soundFracture, soundReform;

  //used to check if audio context has been started
  let audioStarted = false;

  // tracks whether the user has clicked to begin
  let interactionStarted = false;

  //preload sound files before anything starts
  p.preload = () => {
    soundScatter = p.loadSound("music/1.wav"); //scatter sound
    soundFracture = p.loadSound("music/2.wav"); //fracture sound
    soundReform = p.loadSound("music/3.wav"); //reform sound
  };

  //setup runs once when the sketch loads
  p.setup = () => {
    //create fullscreen canvas
    p.createCanvas(innerWidth, innerHeight);

    //create 50 spores at center of canvas
    for (let i = 0; i < 50; i++) {
      spores.push(new Spore(p.width / 2, p.height / 2));
    }
  };

  //draw function runs every frame
  p.draw = () => {
    //semi-transparent background to creates motion trail effect
    //to track the movement of each spores
    p.background(20, 30, 20, 25);

    //check if the user clicked to begin interaction
    //go through each spore one by one
    for (let spore of spores) {
      //if the user has clicked to start
      //let the spores move
      if (interactionStarted) {
        // handle the movement of spore
        spore.update();
      }

      // display spore
      spore.display();
    }

    // if the interaction has started
    // check which mode it's in
    if (interactionStarted) {
      // show the fracture effect
      if (mode === "fracture") {
        handleFractureMode();

        // show the reform behavior
      } else if (mode === "reform") {
        handleReformMode();
      }
    }

    // include the word to guide user
    // "click to begin" words will appear on landing page
    // if the user hasn’t clicked yet,
    // show “Click to Begin”
    if (!interactionStarted) {
      //set the colour of the text to white
      p.fill(255);

      //set the text display at the center of canva
      p.textAlign(p.CENTER, p.CENTER);

      //set the text size into 24
      p.textSize(24);

      //center the text and move it slightly above the spores
      p.text("Click to Begin", p.width / 2, p.height / 2 - 100);
    }
  };

  //runs when the user clicks on the canvas
  p.mousePressed = () => {
    //the audioStarted = false innitially
    //check if audio played
    if (!audioStarted) {
      //A REQUIRED FUNCTION in p5.js
      //that enables audio context after a user gesture (click/tap)
      //only run this once to start the audio
      p.userStartAudio().then(() => {
        //play the scatter sound and loop it
        soundScatter.loop();

        //ensure the audio and interaction has been initialized
        //so it wont run again
        audioStarted = true;
        interactionStarted = true;
      });

      //exits the function after it start (so it wont overlap)
      return;
    }

    //stop all current sounds before switching
    soundScatter.stop();
    soundFracture.stop();
    soundReform.stop();

    //cycle modes with sound
    if (mode === "scatter") {
      mode = "fracture";
      soundFracture.loop();
    } else if (mode === "fracture") {
      mode = "reform";
      soundReform.loop();
    } else if (mode === "reform") {
      mode = "scatter";
      soundScatter.loop();
    }
  };

  //set what happens in fracture mode
  function handleFractureMode() {
    // check every unique pair of spores
    for (let i = 0; i < spores.length; i++) {
      for (let j = i + 1; j < spores.length; j++) {
        //calculate the distance between two spores
        let d = p.dist(spores[i].x, spores[i].y, spores[j].x, spores[j].y);

        //if the spores are closer than 100 pixels
        if (d < 100) {
          //draw a semi-transparent gray line to connect them
          p.stroke(100, 100, 100, 50);
          p.line(spores[i].x, spores[i].y, spores[j].x, spores[j].y);
        }
      }
    }

    //apply chaotic motion
    //moves each spore randomly to simulate chaos/fracture
    for (let spore of spores) {
      spore.x += p.random(-5, 5);
      spore.y += p.random(-5, 5);
    }
  }

  //set what happens in reform mode
  function handleReformMode() {
    //same with the previous one
    //scan through each pair of spores
    for (let i = 0; i < spores.length; i++) {
      for (let j = i + 1; j < spores.length; j++) {
        //calculate the distance between two spores
        let d = p.dist(spores[i].x, spores[i].y, spores[j].x, spores[j].y);

        //if the distance is close than 100
        if (d < 100) {
          //draw a red line between them
          p.stroke(255, 100, 100);
          p.line(spores[i].x, spores[i].y, spores[j].x, spores[j].y);

          //move spores closer together using lerp
          spores[i].x = p.lerp(spores[i].x, spores[j].x, 0.01);
          spores[i].y = p.lerp(spores[i].y, spores[j].y, 0.01);
          spores[j].x = p.lerp(spores[j].x, spores[i].x, 0.01);
          spores[j].y = p.lerp(spores[j].y, spores[i].y, 0.01);
        }
      }
    }
  }

  //class that defines what each spore is
  class Spore {
    //set the spore's position
    constructor(x, y) {
      this.x = x;
      this.y = y;

      //assigns a random colour from the palette
      this.color = p.color(
        p.random([255, 255, 0, 0]),
        p.random([255, 0, 255, 255]),
        p.random([0, 50, 200])
      );

      //set random angle and speed for future use
      this.angle = p.random(p.TWO_PI);
      this.speed = p.random(1, 3);

      //add some Perlin noise offset for organic movement
      this.noiseOffsetX = p.random(1000);
      this.noiseOffsetY = p.random(1000);
    }

    //set how the spore moves
    update() {
      this.x += p.map(p.noise(this.noiseOffsetX), 0, 1, -2, 2);
      this.y += p.map(p.noise(this.noiseOffsetY), 0, 1, -2, 2);
      this.noiseOffsetX += 0.01;
      this.noiseOffsetY += 0.01;

      //keep them from going too far off screen
      const margin = 50;
      const correction = 0.5;
      if (this.x < margin) this.x += correction;
      if (this.x > p.width - margin) this.x -= correction;
      if (this.y < margin) this.y += correction;
      if (this.y > p.height - margin) this.y -= correction;
    }

    //display spore according to what we set
    display() {
      //no stroke
      p.noStroke();

      //fill random colour
      //based on the colour palette that we set
      p.fill(this.color);

      //set the position and size
      p.ellipse(this.x, this.y, 10, 10);
    }
  }
};

//launch the sketch
new p5(sketch);
