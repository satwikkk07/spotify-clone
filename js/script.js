console.log("Lets write JS");



let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`)
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = []
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
    songUL.innerHTML ="";

  for (const song of songs) {
      songUL.innerHTML +=
      `<li><img class="invert" src="img/music.svg" alt="" >
                <div class="info">
                  <div>${song.replaceAll("%20", " ")}  </div>
                  <div>Arjit Singh</div>
                </div>
                <div class="playnow">
                <span>Play Now</span>
                <img src="img/play1.svg" alt="" class="invert">
                </div></li>`;
  }

  //Attach an event Listener to each song
  Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML)
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

    })


  })

  return songs;
}

const playMusic = (track, pause = false) => {

  currentSong.src = `/${currFolder}/` + track
  if (!pause) {
    currentSong.play()
    play.src = "img/pause.svg"
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

}

async function displayAlbums() {
  console.log("displaying albums");

  let a = await fetch(`/songs/`)
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a")
  let cardContainer = document.querySelector(".cardContainer")
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").filter(Boolean).pop();
      //get metadata of folder
      let a = await fetch(`/songs/${folder}/info.json`)
      let response = await a.json();
      cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 20V4l14 8-14 8Z" stroke="#141B34" fill="black" stroke-width="1.5" stroke-linejoin="round" />
              </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="Happy hit images" width="150px" height="150px" >
            <h2> ${response.title}</h2>
            <p >${response.description}</p>
          </div>`
          


    }
  }
  //load playlist when clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
      playMusic(songs[0])

    })
  })


}





async function main() {


  document.getElementById("searchBtn").addEventListener("click", async () => {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  const response = await fetch(`http://localhost:5000/api/search?q=${query}`);
  const results = await response.json();

  renderSearchResults(results);
});

document.getElementById("searchInput").addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    document.getElementById("searchBtn").click();
  }
});




function renderSearchResults(songsData) {
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];

  songUL.innerHTML = ""; // clear old list

  songsData.forEach(song => {
    let li = document.createElement("li");
    li.innerHTML = `
      <img src="${song.artwork}" alt="">
      <div class="info">
        <div>${song.title}</div>
        <div>${song.artist}</div>
      </div>
      <div class="playnow">
        <span>Play Preview</span>
      </div>
    `;

    li.addEventListener("click", () => {
      playOnlineSong(song.preview, song.title);
    });

    songUL.appendChild(li);
  });
}



  //Get All Songs List
  await getSongs("songs/south");
  playMusic(songs[0], true)

  function playOnlineSong(previewUrl, title) {
  if (!previewUrl) {
    alert("Preview not available for this song");
    return;
  }

  currentSong.src = previewUrl;
  currentSong.play();

  document.querySelector(".songinfo").innerText = title;
  play.src = "img/pause.svg";
}



  //Display all the albums on the page
  await displayAlbums()





  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play()
      play.src = "img/pause.svg"

    }
    else {
      currentSong.pause()
      play.src = "img/play.svg"
    }
  })


  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";


  })

  // 🔥 AUTO PLAY NEXT SONG WHEN CURRENT ENDS
currentSong.addEventListener("ended", () => {
  let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

  if (index + 1 < songs.length) {
    playMusic(songs[index + 1]);
  }
});

  //Add event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100
  })

  //Add event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
  })

  //Add event listener close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%"
  })

  //Add event listener for Previous and next button
  previous.addEventListener("click", () => {
    currentSong.pause()
    console.log("Previous clicked")


    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1])

    }
  })

  next.addEventListener("click", () => {
    currentSong.pause()
    console.log("next clicked")

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1])

    }


  })
  //Add an event to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    console.log("Setting Volume to", e.target.value, "/ 100")
    currentSong.volume = parseInt(e.target.value) / 100
    if (currentSong.volume > 0) {
      document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
    }
  })


  //Add evenet to mute
  document.querySelector(".volume>img").addEventListener("click", e => {


    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg")
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg")
      currentSong.volume = 0.10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;

    }

  })


}

main()