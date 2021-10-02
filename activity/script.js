let videoPlayer = document.querySelector("video");
let recordButton = document.querySelector("#record-video");
let photoButton = document.querySelector("#capture-photo");
let zoomIn = document.querySelector("#in");
let zoomOut = document.querySelector("#out");


let recordingState = false;
let constraints = { video: true  };
let recordedData;
let mediaRecorder;


let maxZoom = 3;
let minZoom = 1;
let currZoom = 1;


(async function () {
  let mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
  videoPlayer.srcObject = mediaStream;
  mediaRecorder = new MediaRecorder(mediaStream);
  mediaRecorder.onstart = function (e) {
    console.log("Inside on start !!");
    console.log(e);
  };

  mediaRecorder.ondataavailable = function (e) {
    console.log("Inside on data available !!");
    console.log(e.data);
    recordedData = e.data;
    saveVideoToFs();
  };

  mediaRecorder.onstop = function (e) {
    console.log("Inside on stop !!");
    console.log(e);
  };

  recordButton.addEventListener("click", function () {
    if (recordingState) {
      mediaRecorder.stop();
      recordButton.querySelector("div").classList.remove("record-animate");
    } else {
      mediaRecorder.start();
      recordButton.querySelector("div").classList.add("record-animate");
    }
    recordingState = !recordingState;
  });

  photoButton.addEventListener("click", capturePhotos);

  zoomIn.addEventListener("click" , function(){
    if(currZoom + 0.1 <= maxZoom){
      currZoom += 0.1;
      videoPlayer.style.transform = `scale(${currZoom})`;
    }
  });
  zoomOut.addEventListener("click" , function(){
    if(currZoom - 0.1 >= minZoom){
      currZoom -= 0.1;
      videoPlayer.style.transform = `scale(${currZoom})`;
    }
  });
})();

function saveVideoToFs() {
  console.log("Saving Video");
  let blob = new Blob( [recordedData] , {type:"video/mp4"} );


  let iv = setInterval( function(){
    if(db){
      saveMedia("video" , blob);
      clearInterval(iv);
    }
  }  , 100 );
}

function capturePhotos() {
  photoButton.querySelector("div").classList.add("capture-animate");
  setTimeout(function(){
    photoButton.querySelector("div").classList.remove("capture-animate");
  } , 1000);

  let canvas = document.createElement("canvas");
  canvas.height = videoPlayer.videoHeight;
  canvas.width = videoPlayer.videoWidth;
  let ctx = canvas.getContext("2d");

  
  if(currZoom != 1){
    ctx.translate(canvas.width/2 , canvas.height/2);
    ctx.scale(currZoom , currZoom);
    ctx.translate(-canvas.width/2 , -canvas.height/2)
  }

  ctx.drawImage(videoPlayer, 0, 0);
  let imageUrl = canvas.toDataURL("image/jpg"); 

  let iv = setInterval( function(){
    if(db){
      saveMedia("image" , imageUrl);
      clearInterval(iv);
    }
  }  , 100 );
}