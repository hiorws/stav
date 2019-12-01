let bgColor = 0;
let randColor;
let colorList = [];

let CheatSheet = ["davul", "melodi", "bas", "piyano",
    "ritim arttır", "ritim düşür", "söyle"];

var ritimarttir;
var ritimdusur;

// KICK
var playKick;
var kick;
var kickLoop;


// SYNTH MELODY
var playSynthMelody;
var synthMelody;
var synthPattern;

// BASS
var playBass;
var bass;
var bassLoop;

// PIANO
var playPiano;
var piano;
var pianoLoop;

// analyser
var analyserKick;

var analyserSynthMelody;
let amplitudesSynthMelody;

var anaylserBass;
var amplitudesBass;

// speecher
var vocal = new p5.Speech();
var lyrics = "Yalnızlık kaplandı odam Anlatınca ben sana, \
        bakmazdın Olan umutlarım yok olunca yaşlardı \
        dolan İşte bende ağlamaya başlardım o an \
        İstediğim benim senin benim kadar ağlamaman \
        Senin gibi gülmesemde bi gün kahkahalar attığımı \
        Görürsen şayet o gün aşka tama etmediğim gündür \
        ve başka sana \
        Yalnızlıkların ardında yine sen varsın her zaman yanımda \
        Yok olmadı olmaz bu hatıralar yine sahipsiz günlerde kalınca..";

// speech recognizer
let speechRec;

let lastCommand = "";

let perform = false;

let bpm = 120;

let arpeggios = ["up", "down", "upDown", "downUp", "random", "alternateUp", "alternateDown", "randomWalk", "randomOnce"];

var NATURAL_MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10, 12];
var HARMONIC_MINOR_SCALE = [0, 2, 3, 5, 7, 8, 11, 12];
var MELODIC_MINOR_SCALE = [0, 2, 3, 5, 7, 9, 11, 12];

var ALPHA_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

let arpej = [
    ["C4", "D#4", "G4", "C5", "G4", "D#4"],
    ["B3", "D4", "G4", "B4", "G4", "D4"],
    ["A#3", "D4", "F4", "A#4", "F4", "D4"],
    ["A3", "C4", "F4", "A4", "F4", "C4"],
    ["G#3", "C4", "D#4", "G#4", "D#2", "C4"],
    ["G3", "C4", "D#4", "G4", "D#4", "C4"],
    ["F#3", "C4", "D#4", "F#4", "D#4", "C4"],
    ["G3", "C4", "D4", "G4", "D4", "B3"]
];


let ritaMarkov;
let data;
let lines;

function getScaleFormula() {
    let minorType = Math.floor(Math.random() * 3);
    if (minorType == 0) {
        return NATURAL_MINOR_SCALE;
    } else if (minorType == 1) {
        return HARMONIC_MINOR_SCALE;
    } else if (minorType == 2) {
        return MELODIC_MINOR_SCALE;
    } else {
        return NATURAL_MINOR_SCALE;
    }
}

function unlockAudioContext(audioCtx) {
    if (audioCtx.state === 'suspended') {
        var events = ['touchstart', 'touchend', 'mousedown', 'keydown'];
        var unlock = function unlock() {
            events.forEach(function (event) {
                document.body.removeEventListener(event, unlock)
            });
            audioCtx.resume();
        };

        events.forEach(function (event) {
            document.body.addEventListener(event, unlock, false)
        });
    }
}

function preload() {
    unlockAudioContext(Tone.context);
    data = loadStrings("data/corpus.txt");
}

function prepare() {

    let rootNoteValue = ALPHA_NAMES[Math.floor(Math.random() * ALPHA_NAMES.length)];
    let rootNoteOctave = 2 + Math.floor(Math.random() * 3);
    let rootNote = rootNoteValue + rootNoteOctave;
    // rootNoteValue = "C";
    console.log("Root note: " + rootNote);

    // KICK
    let kickRootNote = rootNote;
    generateKick(kickRootNote, "8n");

    // SYNTH MELODY
    // let pat = ['C3', 'E3', 'F3', 'G3'];
    let pat = arpej[Math.floor(Math.random() * arpej.length)];
    let melodyPattern = pat.slice(0, 5);
    generateSynthMelody(melodyPattern);

    // BASS
    let bassRootNote = rootNoteValue + rootNoteOctave - 2;
    bassRootNote = rootNoteValue + Math.floor(Math.random() * 3).toString();
    generateBass(bassRootNote, "4n");

    // PIANO

    let pianoOctave = 3 + Math.floor(Math.random() * 5);
    let pianoRootNote = rootNoteValue + pianoOctave.toString(10);
    // console.log("Pinao Root Note: " + pianoRootNote);
    pianoRootNote = "C4";
    let pianoTime = "4n";
    generatePiano(pianoRootNote, pianoTime);

}

function generateKick(note, time) {
    playKick = false;
    kick = new Tone.MembraneSynth().toMaster();
    kickLoop = new Tone.Loop(function (time) {
        kick.triggerAttackRelease(note, "8n");
    }, time).start(0);
    kickLoop.loop = true;
    let interVal = 1 + Math.floor(Math.random() * 3);
    kickLoop.interval = 2 * interVal + "n";

    // send to analysis
    analyserKick = new Tone.Analyser("waveform", 2048);
    kick.connect(analyserKick);
    kick.volume.value = -10;
    console.log("kick vol: " + kick.volume.value);
}

function generateSynthMelody(notesArray) {
    playSynthMelody = false;
    synthMelody = new Tone.PolySynth().toMaster();

    let synthPatternArpeggio = arpeggios[Math.floor(Math.random() * arpeggios.length)];
    console.log(synthPattern);
    synthPattern = new Tone.Pattern(function (time, note) {
        synthMelody.triggerAttackRelease(note, "4n");
    }, notesArray, synthPatternArpeggio);

    synthPattern.loop = true;
    let interVal = 1 + Math.floor(Math.random() * 3);
    synthPattern.interval = 2 * interVal + "n";

    // send to analysis
    analyserSynthMelody = new Tone.Analyser("fft", 1024);
    amplitudesSynthMelody = new Array(analyserSynthMelody.size).fill(0);
    synthMelody.connect(analyserSynthMelody);
    synthMelody.volume.value = -10;
    console.log("synth vol: " + synthMelody.volume.value);
}

function generateBass(note, time) {
    playBass = false;
    bass = new Tone.PolySynth().toMaster();
    bassLoop = new Tone.Loop(function (time) {
        bass.triggerAttackRelease(note, "8n");
    }, time).start(0);

    bassLoop.loop = true;
    let interVal = 1 + Math.floor(Math.random() * 3);
    bassLoop.interval = 2 * interVal + "n";

    // send to analysis
    anaylserBass = new Tone.Analyser("fft", 1024);
    amplitudesBass = new Array(anaylserBass.size).fill(0);
    bass.connect(anaylserBass);
    bass.volume.value = -10;
    console.log("bass vol: " + bass.volume.value);

}

function generatePiano(note, time) {
    playPiano = false;
    piano = new Tone.Synth().toMaster();
    piano.oscillator.type = "sine";

    var keyName = "C";
    var scaleFormula = getScaleFormula();
    // TODO: choose according to key
    // var myScale = makeScale(scaleFormula, keyName);
    var myScale = arpej[Math.floor(Math.random() * arpej.length)];
    let randomPatternType = Math.floor(Math.random() * 10);
    console.log("DEBUG PIANO: " + note);
    pianoLoop = new Tone.Pattern(function (time, note) {
        piano.triggerAttackRelease(note, '4n', time);
        // piano.triggerAttackRelease(note, '4n', time);
    }, myScale, arpeggios[randomPatternType]);

    pianoLoop.loop = true;
    let interVal = 1 + Math.floor(Math.random() * 3);
    pianoLoop.interval = 2 * interVal + "n";
    piano.volume.value = -10;
    console.log("piano vol: " + piano.volume.value);
}

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    background(bgColor);

    // sketch configurations
    textAlign(CENTER, CENTER);

    colorList = [color('#aabf12'), color('#33ab12'), color('#165512'), color('#fe3fa2'), color('#a345cd')];
    randColor = colorList[int(random(0, colorList.length))];

    // start transport
    let lang = 'tr';
    speechRec = new p5.SpeechRec(lang, gotSpeech);

    let continuous = true;
    // let interim = true;
    let interim = false;
    speechRec.start(continuous, interim);
    console.log("[+] Speech recognition started.");

    vocal.setLang('tr');
    vocal.setVoice("Cem");
    vocal.setRate(1.2);
    markov = new RiMarkov(3);
    markov.loadText(data.join(" "));

}

function draw() {
    background(bgColor);
    if (perform) {
        playSounds();
    }

    noStroke();
    fill(255);
    textSize(32);
    // text(lastCommand, width / 2, height / 2);

    CheatSheetText();

    drawVisuals();

    // if (getAudioContext().state !== 'running') {
    //     text('click to start audio', width / 2, height / 2 + 50);
    // } else {
    //     text('audio is enabled', width / 2, height / 2 + 50);
    // }

    // if (Tone.context.state !== 'running') {
    //     text('click to start audio', width / 2, height / 2 + 100);
    // } else {
    //     text('audio is enabled', width / 2, height / 2 + 100);
    // }

}
function CheatSheetText() {
    fill(255);
    textSize(18);
    text(int(bpm), width * 0.9, height * 0.1);

    if (playKick) {
        textSize(32);
        fill(randColor);
    } else {
        textSize(26);
        fill(255, 255, 255, 150);
    }
    text(CheatSheet[0], width * 0.08, height * 0.1);

    if (playSynthMelody) {
        textSize(32);
        fill(randColor);
    } else {
        textSize(26);
        fill(255, 255, 255, 150);
    }
    text(CheatSheet[1], width * 0.08, height * 0.2);

    if (playBass) {
        textSize(32);
        fill(randColor);
    } else {
        textSize(26);
        fill(255, 255, 255, 150);
    }
    text(CheatSheet[2], width * 0.08, height * 0.3);

    if (playPiano) {
        textSize(32);
        fill(randColor);
    } else {
        textSize(26);
        fill(255, 255, 255, 150);
    }
    text(CheatSheet[3], width * 0.08, height * 0.4);

    if (ritimarttir) {
        textSize(32);
        fill(randColor);
    } else {
        textSize(26);
        fill(255, 255, 255, 150);
    }
    text(CheatSheet[4], width * 0.9, height * 0.2);

    if (ritimdusur) {
        textSize(32);
        fill(randColor);
    } else {
        textSize(26);
        fill(255, 255, 255, 150);
    }
    text(CheatSheet[5], width * 0.9, height * 0.3);

}

function drawVisuals() {
    if (perform) {

        if (playKick) {
            drawWaveForm();
        }

        if (playSynthMelody) {
            drawFFTBasic();
        }

        if (playBass) {
            drawFFT();
        }


    }

}

function drawFFT() {
    const dim = Math.min(width, height);

    // Black background
    // background(0);

    strokeWeight(dim * 0.0175);
    stroke(randColor);
    noFill();


    const valuesBass = anaylserBass.getValue();
    const dt = deltaTime / 1000;
    const power = 250;
    for (let i = 0; i < amplitudesBass.length; i++) {
        // Previous value
        const a = amplitudesBass[i];

        // Here we take the decibels and map it to some 0..1 value
        const minDb = -150;
        const maxDb = -10;
        const db = max(minDb, min(maxDb, valuesBass[i]));

        // New target (i.e. from audio)
        const b = inverseLerp(minDb, maxDb, db);

        // Spring toward
        amplitudesBass[i] = spring(a, b, power, dt);
    }

    // Draw FFT values
    stroke(255);
    strokeWeight(dim * 0.0175);
    noFill();
    const maxRadius = dim * 0.3;
    const minRadius = dim * 0.175;
    const bands = 10;
    const L = amplitudesBass.length;
    for (let i = 0; i < bands; i++) {
        const tStart = i / bands;
        const tEnd = tStart + (1 / bands);
        const bandStart = min(L, floor(tStart * L));
        const bandEnd = min(L, floor(tEnd * L));
        const avg = average(amplitudesBass, bandStart, bandEnd);

        const r = minRadius + maxRadius * tStart;

        // Min and max line thickness
        const maxThickness = maxRadius / bands * 1;
        const minThickness = maxRadius / bands * 0.1;
        const signal = max(0, min(1, avg));
        const thickness = lerp(minThickness, maxThickness, signal);

        strokeWeight(thickness);
        stroke(randColor);
        noFill();
        // draw an arc
        const d = r * 2; // diameter
        arc(width / 2, height / 2, d, d, 0, PI * 2);
        stroke(randColor);

        fill(randColor);
        triangle(width * 0.55, height * 0.5, width * 0.45, height * 0.45, width * 0.45, height * 0.55);
    }

}

function average(list, startIndex, endIndex) {
    let sum = 0;
    const count = endIndex - startIndex;
    if (count <= 0) return 0;
    for (let i = startIndex; i < endIndex; i++) {
        sum += list[i];
    }
    return sum / count;
}

// Inverse of lerp()
// t = inverseLerp(min, max, current)
function inverseLerp(min, max, current) {
    if (Math.abs(min - max) < 1e-10) return 0;
    else return (current - min) / (max - min);
}

// Springs A toward B with a power, accepting deltaTime
function spring(a, b, power, dt) {
    return lerp(a, b, 1 - Math.exp(-power * dt));
}

function drawWaveForm() {
    const dim = Math.min(width, height);

    // Black background
    background(0, 0, 0, 20);
    strokeWeight(dim * 0.0175);
    stroke(randColor);
    noFill();

    // Draw waveform if playing
    if (perform) {
        const values = analyserKick.getValue();
        const radius = dim * 0.3;

        beginShape();
        for (let i = 0; i < analyserKick.size; i++) {
            const t = i / analyserKick.size;

            const angle = t * PI * 2;
            const amplitude = values[i];

            const r = radius + radius * 0.5 * amplitude;

            // Center the waveform
            const cx = width / 2;
            const cy = height / 2;

            // Draw points around a circle
            const x = cx + cos(angle) * r;
            const y = cy + sin(angle) * r;

            // Place vertex
            vertex(x, y);
        }
        endShape(CLOSE);
    }
}

function drawFFTBasic() {
    strokeWeight(2);
    const spectrum = analyserSynthMelody.getValue();
    noStroke();
    push();
    translate(width / 2, height / 2);
    for (var i = 0; i < spectrum.length; i++) {
        var angle = map(i, 0, spectrum.length, 0, 360);
        var amp = spectrum[i];
        var r = map(amp, 0, 256, 50, 120);
        //fill(i, 255, 255);
        var x = r * cos(angle);
        var y = r * sin(angle);
        stroke(20, i, 150);
        noFill();
        rect(0, 0, x * 8, y * 8);
    }
    pop();
}

function gotSpeech() {
    if (perform) {
        // Tone.Transport.start();
        console.log("[+] Got speech.");
        let textValue = speechRec.resultString;
        if (textValue) {
            console.log(textValue);
            if (textValue.includes("davul")) {
                if (textValue.includes("değiştir")) {
                    kickLoop.stop();
                    let rootNoteValue = ALPHA_NAMES[Math.floor(Math.random() * ALPHA_NAMES.length)];
                    let rootNoteOctave = 2 + Math.floor(Math.random() * 3);
                    let rootNote = rootNoteValue + rootNoteOctave;
                    generateKick(rootNote, "8n");
                } else {
                    if (playKick) {
                        playKick = false;
                    } else {
                        randColor = colorList[int(random(0, colorList.length))];
                        playKick = true;
                    }
                }
            }

            if (textValue.includes("melodi")) {
                if (textValue.includes("değiştir")) {
                    let pat = arpej[Math.floor(Math.random() * arpej.length)];
                    let melodyPattern = pat.slice(0, 5);
                    generateSynthMelody(melodyPattern);

                } else {
                    if (playSynthMelody) {
                        playSynthMelody = false;
                    } else {
                        randColor = colorList[int(random(0, colorList.length))];
                        playSynthMelody = true;
                    }
                }
            }

            if (textValue.includes("bas") || textValue.includes("bus") || textValue.includes("Bass")) {
                if (textValue.includes("değiştir")) {
                    let rootNoteValue = ALPHA_NAMES[Math.floor(Math.random() * ALPHA_NAMES.length)];
                    let rootNoteOctave = 2 + Math.floor(Math.random() * 3);
                    let bassRootNote = rootNoteValue + rootNoteOctave - 2;
                    bassRootNote = rootNoteValue + Math.floor(Math.random() * 3).toString();
                    generateBass(bassRootNote, "4n");
                } else {
                    if (playBass) {
                        playBass = false;
                    } else {
                        randColor = colorList[int(random(0, colorList.length))];
                        playBass = true;
                    }
                }
            }

            if (textValue.includes("piyano")) {
                if (textValue.includes("değiştir")) {
                    pianoRootNote = "C4";
                    let pianoTime = "4n";
                    generatePiano(pianoRootNote, pianoTime);
                } else {
                    if (playPiano) {
                        playPiano = false;
                    } else {
                        randColor = colorList[int(random(0, colorList.length))];
                        playPiano = true;
                    }
                }
            }

            if (textValue.includes("ritim arttır")) {
                ritimarttir = true;
                ritimdusur = false;
                increaseBPM();
            }

            if (textValue.includes("ritim düşür")) {
                ritimarttir = false;
                ritimdusur = true;
                decreaseBPM();
            }

            if (textValue.includes("söyle")) {
                // vocal.speak(lyrics);
                lines = markov.generateSentences(10);
                console.log(lines);
                vocal.speak(lines);
            }


            lastCommand = textValue;

            // createP(speechRec.resultString);

        }

    }
}


function keyPressed() {
    console.log("[+] Key pressed.")

    // kick
    if (key == 'k') {
        if (playKick) {
            playKick = false;
        } else {
            playKick = true;
        }
    }

    // synth
    if (key == 's') {
        if (playSynthMelody) {
            playSynthMelody = false;
        } else {
            playSynthMelody = true;
        }
    }

    // bass
    if (key == 'b') {
        if (playBass) {
            playBass = false;
        } else {
            playBass = true;
        }
    }

    if (key == 'p') {
        if (playPiano) {
            playPiano = false;
        } else {
            playPiano = true;
        }
    }

    if (key == 'q') {
        kickLoop.stop();
        synthPattern.stop();
        bassLoop.stop();
        pianoLoop.stop();
        prepare();
    }

    if (key == 'g') {
        lines = markov.generateSentences(10);
        console.log(lines);
    }
}

function playSounds() {
    Tone.Transport.start();
    bpm = Tone.Transport.bpm.value;

    if (playKick) {
        kickLoop.start(0);
    } else {
        kickLoop.stop();
    }

    if (playSynthMelody) {
        synthPattern.start(0);
    } else {
        synthPattern.stop();
    }

    if (playBass) {
        bassLoop.start(0);
    } else {
        bassLoop.stop();
    }

    if (playPiano) {
        pianoLoop.start(0);
    } else {
        pianoLoop.stop();
    }
}



function touchStarted() {
    console.log("[+] Screen touched.");
    // Tone.context.resume();

    if (getAudioContext().state !== 'running') {
        getAudioContext().resume();
    }

    if (Tone.context.state !== 'running') {
        Tone.context.resume();
    }


    if (!perform) {
        prepare();
        perform = true;
    }

}

function mousePressed() {
    console.log("[+] Mouse pressed.")
    if (!perform) {
        prepare();
        perform = true;
    }
}



function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function increaseBPM() {
    Tone.Transport.bpm.value += 10;
}

function decreaseBPM() {
    Tone.Transport.bpm.value -= 10;
}