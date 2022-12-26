let req=indexedDB.open("gallery",1);

let database;
let NumberOfMedia=0;
req.addEventListener("success",function(){
    database=req.result;
    // console.log(database);
});
req.addEventListener("upgradeneeded",function(){
    let db=req.result;
    console.log(1);
    db.createObjectStore("media",{keyPath: "mId"});
});
req.addEventListener("error",function(){});
function saveMedia(media){
    if(! database) return;

    let data={
        mId:Date.now(),
        mediaData: media,
    };

    let tx=database.transaction("media","readwrite");
    let mediaObjectStore=tx.objectStore("media");
    mediaObjectStore.add(data);
}
function viewMedia(){
    if(!database)return;
    let tx=database.transaction("media", "readonly");
    let mediaObjectStore=tx.objectStore("media");
    let req=mediaObjectStore.openCursor();

    req.addEventListener("success",function(){
        let cursor=req.result;
        let galleryContainer=document.querySelector(".gallery-container");
        if(cursor){
            NumberOfMedia++;
            let mediaCard=document.createElement("div");
            mediaCard.classList.add("media-card");
            mediaCard.innerHTML=`<div class="actual-media"></div>
            <div class="media-buttons">
                <button class="media-download">Download</button>
                <button data-mid=${cursor.value.mId} class="media-delete">Delete</button>
            </div>`
            let actualMedia=mediaCard.querySelector(".actual-media");
            let downloadBtn=mediaCard.querySelector(".media-download");
            let deleteBtn=mediaCard.querySelector(".media-delete");
            let data=cursor.value.mediaData;
            let type=typeof(data);
            // console.log(type);
            if(type=="string"){
                let img=document.createElement("img");
                img.src=data;
                downloadBtn.addEventListener("click",function(){
                    downloadMedia(data,"image");
                });
                actualMedia.append(img);
            }else if(type=="object"){
                let video=document.createElement("video")
                let url=URL.createObjectURL(data);
                video.src=url;
                video.autoplay=true;
                video.controls=true;
                video.muted=true;
                video.loop=true;
                downloadBtn.addEventListener("click",function(){
                    downloadMedia(url,"video");
                });
                actualMedia.append(video);
            }
            deleteBtn.addEventListener("click",function(){
                deleteMedia(Number(deleteBtn.getAttribute("data-mid")));
                deleteBtn.parentElement.parentElement.remove();
            })
            galleryContainer.append(mediaCard);
            cursor.continue();
        }else{
            if(NumberOfMedia==0){
                alert("No Photo/Video present at the moment");
            }
        }
    })
}

function downloadMedia(url,type){
    let anchor=document.createElement("a");
    anchor.href=url;
    if(type=="image"){
        anchor.download="image.png";
    }else if(type=="video"){
        anchor.download="video.mp4"
    }
    anchor.click();
    anchor.remove();
}

function deleteMedia(mId){
    let tx=database.transaction("media","readwrite");
    let mediaStore=tx.objectStore("media");
    mediaStore.delete(mId);
}
let backBtn=document.querySelector(".back");
backBtn.addEventListener("click",function(){
    location.assign("index.html");
})
