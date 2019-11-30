let bgColor = 0;

// KICK
var playKick;
var kick;
var kickLoop;

// KICK

// SYNTH MELODY
var playSynthMelody;
var synthMelody;
var synthPattern;

// SYNTH MELODY

// speecher
var vocal = new p5.Speech();
var rap = "Yalnızlık kaplandı odam Anlatınca ben sana, \
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

}

function prepare() {
    // KICK
    playKick = false;
    kick = new Tone.MembraneSynth().toMaster()
    kickLoop = new Tone.Loop(function (time) {
        kick.triggerAttackRelease("C2", "8n");
    }, "8n").start(0);
    // KICK

    // SYNTH MELODY
    playSynthMelody = false;
    synthMelody = new Tone.PolySynth().toMaster();
    synthPattern = new Tone.Pattern(function (time, note) {
        synthMelody.triggerAttackRelease(note, "4n");
    }, ['E2', 'D4', 'C3', 'D3'], "upDown");

    synthPattern.loop = true;
    synthPattern.interval = "8n";
    // SYNTH MELODY
}


function setup() {
    let canvas =  createCanvas(windowWidth, windowHeight);
    background(bgColor);

    // sketch configurations
    textAlign(CENTER, CENTER);

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
}

function draw() {
    background(bgColor);
    if (perform) {
        playSounds();
    }


    noStroke();
    fill(255);
    textSize(32);
    text(lastCommand, width / 2, height / 2);
    if (getAudioContext().state !== 'running') {
        text('click to start audio', width / 2, height / 2 + 50);
    } else {
        text('audio is enabled', width / 2, height / 2 + 50);
    }

    if (Tone.context.state !== 'running') {
        text('click to start audio', width / 2, height / 2 + 100);
    } else {
        text('audio is enabled', width / 2, height / 2 + 100);
    }

}

function gotSpeech() {
    if (perform) {
        // Tone.Transport.start();
        console.log("[+] Got speech.");
        let textValue = speechRec.resultString;
        if (textValue) {
            console.log(textValue);
            if (textValue.includes("davul")) {
                if (playKick) {
                    playKick = false;
                } else {
                    playKick = true;
                }
            }

            if (textValue.includes("melodi")) {
                if (playSynthMelody) {
                    playSynthMelody = false;
                } else {
                    playSynthMelody = true;
                }
            }

            if (textValue.includes("söyle")) {
                vocal.speak(rap);
            }
            lastCommand = textValue;

            // createP(speechRec.resultString);

        }

    }
}


function keyPressed() {
    console.log("[+] Key pressed.")
    // Tone.Transport.start();
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
}

function playSounds() {
    Tone.Transport.start();
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