/**
 * Created by Malvina Pushkova <lady3mlnm@gmail.com>
 * Date: 2017
 */

var AR = ['ga', 'gi', 'gu', 'ge', 'go', 'za', 'ji', 'zu', 'ze', 'zo', 'da', 'ji2', 'zu2',
          'de', 'do', 'ba', 'bi', 'bu', 'be', 'bo', 'pa', 'pi', 'pu', 'pe', 'po'],
    iAR = 0,                                              // index of current element in array AR
    vlmShow = document.getElementById('vlmShow'),         // volume Show
    btnPlay = document.getElementById('btnPlay'),         // button Play-Stop
    audioPlayer = document.getElementById('audioPlayer'), // elements for audio output
    srcMp3 = document.getElementById('srcMp3'),           // source of MP3
    srcOgg = document.getElementById('srcOgg'),
    gVoice,               // variant of voice acting, current current 0 and 1
    gLoops,               // number of voice repeats
    iLoops = 1,           // counter for voice repeats
    gPause,               // pause between voice acting
    gVolume,              // volume of audio, array
    gKana,                // kana type: 'H'-hiragana or 'K'-katakana
    gCorner,              // syllable type in the left bottom corner: 'R'-romaji, 'H'-hiragana, 'K'-katakana
    firstMove = true;     // is this the first move in session


//*********************************************************
//   LOAD / UNLOAD
//*********************************************************

function fLoad() {      // Whenever possible, I tried to secure against simple errors during loading
  var j;
  if (localStorage.tt_cbHeadings == 'true')              // is table headings shown
    document.getElementById('cbHeadings').checked = true
  else
    document.getElementById('cbHeadings').checked = false;
  fChangeHeadings();

  j = Number(localStorage.tt_gVoice);                    // variant of voice acting, current 0, 1, 2
  gVoice = (isNaN(j))?0:j;
  document.getElementById('rAudio'+gVoice).checked = true;
  srcMp3.src = 'audio-'+gVoice+'/ga.mp3';
  srcOgg.src = 'audio-'+gVoice+'/ga.ogg';
  audioPlayer.load();

  j = Number(localStorage.tt_gLoops);                    // number of voice repeats
  gLoops = (isNaN(j))?1:j;
  document.getElementById('repeatNumber').value = gLoops;

  j = Number(localStorage.tt_gPause);                    // pause between voice acting
  gPause = (isNaN(j))?800:j;
  document.getElementById('repeatPause').value = gPause/1000;

  if (localStorage.tt_gVolume !== undefined && localStorage.tt_gVolume !== 'undefined')  // volume of audio, array
    gVolume = localStorage.tt_gVolume.split(',')
  else
    gVolume = [0.5, 0.9, 0.5];
  vlmShow.innerHTML = '( '+gVolume[gVoice]*100+'% )';
  document.getElementById('vlmRange').value = gVolume[gVoice];
  audioPlayer.volume = gVolume[gVoice];

  if (localStorage.tt_gKana == 'K')                                      // kana type major
    gKana = 'K'
  else
    gKana = 'H';
  document.getElementById('radio'+gKana).checked = true;
  fChangeBigKana(gKana);

  if (localStorage.tt_gCorner == 'K' || localStorage.tt_gCorner == 'H')  // kana type auxiliary
    gCorner = localStorage.tt_gCorner
  else
    gCorner = 'R';
  document.getElementById('corner'+gCorner).checked = true;
  fChangeCorner(gCorner);

  document.body.addEventListener('keydown',fKeyDown,true);
}

function fUnload() {
  localStorage.setItem('tt_gVoice', gVoice);
  localStorage.setItem('tt_gLoops', gLoops);
  localStorage.setItem('tt_gPause', gPause);
  localStorage.setItem('tt_gVolume', gVolume);
  localStorage.setItem('tt_gKana', gKana);
  localStorage.setItem('tt_gCorner', gCorner);
  localStorage.setItem('tt_cbHeadings', document.getElementById('cbHeadings').checked);
}


//*********************************************************
//   CONTROL PANEL
//*********************************************************

/* when user changes major type of kana */
function fChangeBigKana(newValue) {
  var oV = document.getElementsByClassName('big'+gKana)      // oV - Old Value
  var nV = document.getElementsByClassName('big'+newValue);  // nV - New Value
  for (var i=0; i<25; i++) {
    oV[i].style.display = 'none';
    nV[i].style.display = 'block'; }
  gKana = newValue;
}

/* when user clicks ExchangeKanaType button */
function fExchangeKanaType(){
  var baseH = document.getElementById('radioH'),
      baseK = document.getElementById('radioK'),
      cornerH = document.getElementById('cornerH'),
      cornerK = document.getElementById('cornerK');
      
  if (baseH.checked) {
    baseK.checked = true;
    fChangeBigKana('K');
    cornerH.checked = true; 
    fChangeCorner('H'); }
  else if(baseK.checked) {
    baseH.checked = true;
    fChangeBigKana('H');
    cornerK.checked = true;
    fChangeCorner('K'); }
    
  fChangeKanaImages();
}

/* when user changes type of voiceover */
function fChangeVoice(j) {
  gVoice = j;
  fLoadNewAudio(AR[iAR]);
  audioPlayer.volume = gVolume[gVoice];
  if (document.getElementById('repeatNumber').value != 0) {
    audioPlayer.play();
    fChangeBtnPlay('on'); }
  vlmShow.innerHTML = '( '+gVolume[gVoice]*100+'% )';
  document.getElementById('vlmRange').value = gVolume[gVoice];
}

/* when user changes number of repeats of voiceover */
function fChangeRepeat(j) {
  gLoops = j;
}

/* when user changes duration of pause between repeats */
function fChangePause(j) {
  gPause = j*1000;
}

/* when user changes volume of voiceover */
function fChangeVolume(j) {
  audioPlayer.volume = j;
  vlmShow.innerHTML = '( '+j*100+'% )';
  gVolume[gVoice] = j;
}

/* when user releases a mouse button over regulator of volume */
function fChangeVolumeMouseUp() {
  audioPlayer.play();
}

/* when user click on Play/Stop button */
function fPlayStop() {
  if (btnPlay.value == 'off') {
    iLoops = 1;                       // launch Player
    audioPlayer.play();
    fChangeBtnPlay('on'); }
  else {
    fChangeBtnPlay('off');            // stop Player
    iLoops = gLoops;
    audioPlayer.pause();
    audioPlayer.currentTime = 0; }
}

/* when user changes auxiliary type of kana (that are shown in the corner),
   directly or via ExchangeKanaType button */
function fChangeCorner(newValue) {
  var oV = document.getElementsByClassName('syl'+gCorner);   // ov - Old Value
  var nV = document.getElementsByClassName('syl'+newValue);  // nv - New Value
  for (var i=0; i<25; i++) {
    oV[i].style.visibility = 'hidden';
    nV[i].style.visibility = 'visible'; }
  gCorner = newValue;
}

/* when user alters checkbox "show table heading" */
function fChangeHeadings() {
  var b = document.getElementById('cbHeadings').checked,
      tbl = document.getElementsByTagName('table')[0],
      aTh = tbl.getElementsByTagName('th'),
      j,
      lng = aTh.length;
  if (b) {
    for (j=0; j<lng; j++)
      aTh[j].style.display = 'table-cell'; }
  else {
    for (j=0; j<lng; j++)
      aTh[j].style.display = 'none'; }
}


//*********************************************************
//   FUNCTIONS FOR KANA TABLE
//*********************************************************

/* when user clicks on kana in the kana table */
function fShowDatails(elem) {
  document.getElementById(AR[iAR]).lastChild.style.borderColor = 'transparent';
  elem.lastChild.style.borderColor = 'papayawhip';
  var newKana = elem.id;
  fLoadNewAudio(newKana);
  iAR = AR.indexOf(newKana);
  if (gLoops>0) {
    iLoops = 1;
    audioPlayer.play();
    fChangeBtnPlay('on'); }
  firstMove = false;
}

/* if user press arrow key or Esc */
function fKeyDown(e){
  var k = e.keyCode;
  if (k===39 || k===37 || k===40 || k===38 || k===13 || k===32 || k===27) { 
    e.preventDefault();
    if (firstMove) {
        firstMove = false;
        if (k===39 || k===40) iAR = 0                // if → or ↓
        else if (k===37 || k===38) iAR = 24          // if ← or ↑
        else if (k===27) {fEmptyCell(); return; } }  // if Esc
    else {
      document.getElementById(AR[iAR]).lastChild.style.borderColor = 'transparent';
      switch (k) {
        case 39:                                     // if →
          iAR++;
          if (iAR>=25) iAR = 0;
          break;
        case 37:                                     // if ←
          iAR--;
          if (iAR<0) iAR = 24;
          break;
        case 40:                                     // if ↓
          iAR+=5;
          if (iAR==29) iAR = 0
          else if (iAR>=25) iAR-=24;
          break;
        case 38:                                     // if ↑
          iAR-=5;
          if (iAR==-5) iAR = 24
          else if (iAR<0) iAR+=24;
          break;
        case 27:                                     // if Esc
          document.getElementById(AR[iAR]).lastChild.style.borderColor = 'transparent';
          return;
      } }
    document.getElementById(AR[iAR]).lastChild.style.borderColor = 'papayawhip';
    fLoadNewAudio(AR[iAR]);
    if (gLoops>0) {
      iLoops = 1;
      audioPlayer.play();
      fChangeBtnPlay('on');}
  }
}


//*********************************************************
//   WORKING FUNCTIONS
//*********************************************************

/* when audioplayer finishes playing of track */
function fAudioEnded(){
  if (iLoops<gLoops) {
    iLoops++;
    setTimeout(function(){audioPlayer.play()}, gPause); }
  else
    fChangeBtnPlay('off');
}

/* load new audio track in audio player and launch it */
function fLoadNewAudio(k){
  srcMp3.src = 'audio-'+gVoice+'/'+k+'.mp3';
  srcOgg.src = 'audio-'+gVoice+'/'+k+'.ogg';
  audioPlayer.load();
}

/* change appearance of Play/Stop button */
function fChangeBtnPlay(newState) {
  if (newState == 'on')
    btnPlay.lastChild.style.backgroundPosition = 'right -18px'  // set 'stop' symbol
  else
    btnPlay.lastChild.style.backgroundPosition = 'right 0'      // set 'play' symbol
  btnPlay.value = newState;
}