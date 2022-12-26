let zoom=document.querySelector(".zoom");
let chunks=[];
let mediaRecorder;
let isRecording=false;
let body=document.querySelector("body");
let captureBtn=document.querySelector("#capture");
let videoPlayer=document.querySelector('video');
let recordBtn=document.querySelector("#record");
let galleryBtn=document.querySelector("#gallery");
let filter="";
let currZoom=1;//min=1 & max=3
let zoomIn=document.querySelector(".in");
let zoomOut=document.querySelector(".out")

galleryBtn.addEventListener("click",function(){
    location.assign("gallery.html");
})

zoomIn.addEventListener("click",function(){
    currZoom=currZoom+0.1;
    if(currZoom>3)currZoom=3;

    videoPlayer.style.transform=`scale(${currZoom})`;
})
zoomOut.addEventListener("click",function(){
    currZoom=currZoom-0.1;
    if(currZoom<1)currZoom=1;
    videoPlayer.style.transform=`scale(${currZoom})`;
})

let allFilters=document.querySelectorAll(".filter");


for(let i=0;i<allFilters.length;i++){
    allFilters[i].addEventListener("click",function(e){
        let previousFilter=document.querySelector(".filter-div");
        if(previousFilter)previousFilter.remove();
        let color=e.currentTarget.style.backgroundColor;
        filter=color;
        // console.log(color);
        let div=document.createElement("div");
        div.classList.add("filter-div");
        div.style.backgroundColor=color;
        body.append(div);
    })
}


recordBtn.addEventListener("click",function(){
    let innerSpan=recordBtn.querySelector("div");
    let previousFilter=document.querySelector(".filter-div");
    if(previousFilter)previousFilter.remove();
    filter="";

    if(isRecording){
        mediaRecorder.stop();
        zoom.classList.remove("zoomWhileRecording");
        innerSpan.classList.remove("record-animation");
        isRecording=false;

    }else{
        mediaRecorder.start();
        zoom.classList.add("zoomWhileRecording");
        currZoom=1;
        videoPlayer.style.transform=`scale(${currZoom})`
        innerSpan.classList.add("record-animation");
        isRecording=true;
    }
})

captureBtn.addEventListener("click",function(){
    let innerSpan=captureBtn.querySelector("div");
    innerSpan.classList.add("capture-animation");
    setTimeout(function(){
        innerSpan.classList.remove("capture-animation");
    },1000);
    let canvas=document.createElement("canvas");
    canvas.width=videoPlayer.videoWidth;
    canvas.height=videoPlayer.videoHeight;
    let tool=canvas.getContext("2d");

    tool.translate(canvas.width/2,canvas.height/2);

    tool.scale(currZoom,currZoom);

    tool.translate(-canvas.width/2,-canvas.height/2);

    tool.drawImage(videoPlayer,0,0);

    if(filter!=""){
        tool.fillStyle=filter;
        tool.fillRect(0,0,canvas.width,canvas.height);
    }

    let url=canvas.toDataURL();
    canvas.remove();
    saveMedia(url);
    // let a=document.createElement("a");
    // a.href=url;
    // a.download="image.png";
    // a.click();
    // a.remove();
})

// asking permission to use the camera from browser
let promiseToUseCamera=navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true,
});
// (then) if permission is granted to access the camera   -----(catch) if permission is denied to access the camera
promiseToUseCamera.then(function(mediaStream){
    // mediaStream is a object given by browser of continuous video
    // Since src asks url & but we have mediastream, which is a object
    // so we give mideaStream object in srcObject 
    videoPlayer.srcObject = mediaStream;
    mediaRecorder=new MediaRecorder(mediaStream);

    mediaRecorder.addEventListener("dataavailable",function(e){
        chunks.push(e.data);
    })

    mediaRecorder.addEventListener("stop",function(e){
        let blob=new Blob(chunks,{type:"video/mp4"});
        chunks=[];

        saveMedia(blob);

        // let link=URL.createObjectURL(blob);
        // let a=document.createElement("a");
        // a.href=link;
        // a.download="video.mp4";
        // a.click();
        // a.remove();
    })
    
}).catch(function(){
    console.log("user has denied the access of camera");
})
