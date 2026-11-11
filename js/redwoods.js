(() => {
"use strict";
const passage = [
["A","It could be said that the history of modern America is carved in redwood, with calls to save these giant trees being made almost as soon as people began cutting them down. In 1848, when gold was found in California, some businessmen from the East saw an easier way to get rich: they recognised the potential of the reddish, straight-grained, rot-resistant wood in a gold rush that would quadruple California's population in a decade. As San Francisco expanded, the great forests near the city were virtually leveled. Farther north, timber entrepreneurs used fair means and foul to purchase thousands of acres of federal lands dominated by redwoods for $2.50 an acre, beginning an era of corporate logging that continued for decades. By the 1880s, some 400 sawmills north of San Francisco were churning out timber for furniture manufacturers and the construction industry."],
["B","Today less than five percent of the roughly two million acres of virgin redwood forest remains, mostly in reserves where logging is prohibited. Environmentalists mourn the destruction of habitats for animal species such as the spotted owl, but they aren't the only things to have suffered. Harvest rates in the redwoods have fallen since the 1990s, when they were already half what they were in the 1970s. Communities that once boasted several timber enterprises, such as the towns of Korbel and Orick, are now lucky to have one still just about surviving. Unemployment is high in these towns and the effect is felt by everyone. 'The battle to save the redwoods has already been fought, and there aren't many of them left', says Steve Sillett, a forest scientist at Humboldt State University. 'The challenge now is understanding how to improve management of the redwoods that have been replanted and are just starting to grow.'"],
["C","It is hard to assess forestry practices without mentioning the logging company Pacific Lumber (PL), which was started by the Murphy family in 1905. The Murphys, who learned the lumber business from the chain saw up, believed in leaving some old trees, known as 'old growth', standing. Albert Murphy maintained that such conservative logging practices were necessary to sustain production, and perhaps even more importantly, to maintain a high level of employment in the industry for generations to come. In 1985, however, Charles Hurwitz orchestrated the hostile takeover of PL and became its Chief Executive. Under Hurwitz, PL owned roughly 70 percent of the old redwoods remaining in private hands. More importantly for the redwoods, Hurwitz abandoned the Murphys' approach and adopted the controversial business model of clear-cutting, which involved cutting most or all of the trees in a harvest area. This doubled -- and some years even tripled -- the annual amount of timber harvested from the company's holdings."],
["D","Hurwitz's attempts to cut the largest remaining block of old growth on private land, known as the Headwaters Forest, launched armies of young protesters and drew increased scrutiny from timber regulators. But, it was a dangerous time for the protesters. Tree sitters were extracted by force from their platforms hundreds of feet in the air and some were injured. However, PL was then bought by the Mendocino Redwood Company (MRC) and the need for confrontation seemed to be over. Activists who had occupied part of an old-growth section of Headwaters Forest to keep PL from logging it received assurances from MRC's chief forester, Mike Jani, that the redwood trees in this section would not be cut down. However, for many, this was only the beginning. Lindsey Holm, a self-taught naturalist from northern California, says that fighting to save old growth trees is straightforward and easy to gain widespread backing for. 'Trying to get people to oppose sound new-growth logging is more challenging', Holm explains."],
["E","As early as the 1930s, a forestry expert argued that if timber companies still wanted to be making a profit in the long run, they'd better start leaving some trees standing. In line with this thinking, Jani now promises that MRC will return to the earlier practice of selective cutting and thus leaving substantial numbers of old-growth trees. Jani has already implemented this approach on 230,000 acres of heavily logged redwood forest that it purchased. MRC's policy will be to cut less than half of the overall volume of timber grown on its property each year through a variety of selection techniques. By doing this, the company will sacrifice greater short-term profits for a more sustained investment in the forest."],
["F","Some foresters think there's an even better way forward. 'My idea is also to cut down fewer trees, but what's important is how you identify which ones', says Jim Able, a former industrial forester for the logging company Louisiana Pacific who now manages small private timberlands. The key, Able says, is which trees you choose to remove. He and his foresters mark every tree they want to be cut, aiming never to exceed 30 to 35 percent of the forest. Able is most critical of a form of selective logging called high-grading where only the best trees are logged. By contrast, Able harvests weak and poorly formed trees, leaving the straightest and strongest to thrive in the newly available light. And unlike timbermen who routinely clear-cut in a harvest area every few decades, Able comes back once a decade to evaluate whether to cut again. He never takes more wood than the forest has grown over that time, which means that the remaining trees -- what he calls his principal -- continue to increase in height, volume, and quality."]
];
const headings=[
["i","The economic benefit of long-term planning"],
["ii","Adopting a more aggressive policy towards cutting down trees"],
["iii","Targeting the less healthy trees"],
["iv","How demand for a valuable resource grew"],
["v","Living conditions in communities dependent on timber"],
["vi","Groups trying to protect the redwoods"],
["vii","The negative impact on people and wildlife"]
];
const key={A:"iv",B:"vii",C:"ii",D:"vi",E:"i",F:"iii"};
const root=document.querySelector(".test-main"),passageNode=document.getElementById("passageText"),list=document.getElementById("headingList");
let selected=null,dragged=null,submitted=false,timer=null,seconds=1200;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const wordify=value=>esc(value).replace(/([\p{L}]+(?:['’\-][\p{L}]+)*)/gu,'<span class="vocab-word" data-word="$1">$1</span>');
const gate=document.getElementById("modeGate"),popup=document.getElementById("vocabPopup"),modeLabel=document.getElementById("modeLabel");let lookupId=0;
function render(){
 passageNode.innerHTML=passage.map(([letter,body])=>'<p id="para'+letter+'"><span class="para-letter">'+letter+'</span><span class="drop-slot" data-para="'+letter+'" role="button" tabindex="0" aria-label="Drop heading for paragraph '+letter+'"><span class="slot-label">Drop heading</span><span class="slot-answer">No heading selected</span><span class="feedback"></span></span>'+wordify(body)+'</p>').join("");
 list.innerHTML=headings.map(([code,label])=>'<div class="heading-card" draggable="true" tabindex="0" role="button" data-heading="'+code+'" aria-label="Heading '+code+': '+esc(label)+'"><span class="heading-code">'+code+'</span><span>'+esc(label)+'</span></div>').join("");
}
function assignments(){const out={};document.querySelectorAll(".drop-slot").forEach(slot=>{if(slot.dataset.heading)out[slot.dataset.para]=slot.dataset.heading;});return out;}
function used(){return new Set(Object.values(assignments()));}
function refresh(){
 const taken=used();
 document.querySelectorAll(".heading-card").forEach(card=>{const isUsed=taken.has(card.dataset.heading);card.classList.toggle("used",isUsed);card.setAttribute("aria-disabled",String(isUsed));});
 document.querySelectorAll(".drop-slot").forEach(slot=>{const code=slot.dataset.heading;slot.classList.toggle("filled",!!code);slot.querySelector(".slot-label").textContent=code?"Heading placed":"Drop heading";slot.querySelector(".slot-answer").textContent=code?headings.find(h=>h[0]===code)[1]:"No heading selected";});
}
function place(letter,code){
 if(submitted||!letter||!code)return;
 const taken=used();const old=document.querySelector('.drop-slot[data-para="'+letter+'"]');
 if(taken.has(code)&&old.dataset.heading!==code)return;
 old.dataset.heading=code;old.classList.remove("correct","incorrect");old.querySelector(".feedback").textContent="";selected=null;refresh();
}
list.addEventListener("dragstart",e=>{const card=e.target.closest(".heading-card");if(!card||card.classList.contains("used")||submitted){e.preventDefault();return;}dragged=card.dataset.heading;card.classList.add("dragging");e.dataTransfer.setData("text/plain",dragged);e.dataTransfer.effectAllowed="move";});
list.addEventListener("dragend",e=>{e.target.closest(".heading-card")?.classList.remove("dragging");dragged=null;});
passageNode.addEventListener("dragover",e=>{const slot=e.target.closest(".drop-slot");if(slot&&!submitted){e.preventDefault();slot.classList.add("over");}});
passageNode.addEventListener("dragleave",e=>{e.target.closest(".drop-slot")?.classList.remove("over");});
passageNode.addEventListener("drop",e=>{const slot=e.target.closest(".drop-slot");if(!slot||submitted)return;e.preventDefault();slot.classList.remove("over");place(slot.dataset.para,e.dataTransfer.getData("text/plain")||dragged);});
list.addEventListener("click",e=>{const card=e.target.closest(".heading-card");if(!card||card.classList.contains("used")||submitted)return;selected=card.dataset.heading;document.querySelectorAll(".heading-card").forEach(c=>c.style.outline=c===card?"3px solid #39796d55":"");});
passageNode.addEventListener("click",e=>{const slot=e.target.closest(".drop-slot");if(slot&&selected&&!submitted){place(slot.dataset.para,selected);document.querySelectorAll(".heading-card").forEach(c=>c.style.outline="");}});
passageNode.addEventListener("keydown",e=>{const slot=e.target.closest(".drop-slot");if(slot&&(e.key==="Enter"||e.key===" ")&&selected&&!submitted){e.preventDefault();place(slot.dataset.para,selected);}});
const peopleKey={q20:"F",q21:"E",q22:"B",q23:"A"};
const textKey={q24:"gold",q25:"furniture",q26:"unemployment"};
document.getElementById("checkAnswers").addEventListener("click",()=>{
 if(submitted)return;submitted=true;let score=0;const ans=assignments();
 passage.forEach(([letter])=>{const slot=document.querySelector('.drop-slot[data-para="'+letter+'"]'),ok=ans[letter]===key[letter];if(ok)score++;slot.classList.add(ok?"correct":"incorrect");slot.querySelector(".feedback").textContent=ok?"Correct":"Correct: "+key[letter];});
 Object.entries(peopleKey).forEach(([id,correct])=>{const field=document.getElementById(id),ok=field.value===correct;if(ok)score++;field.disabled=true;field.insertAdjacentHTML("afterend",'<span class="answer-feedback">'+(ok?" ✓":" Correct: "+correct)+'</span>');});
 Object.entries(textKey).forEach(([id,correct])=>{const field=document.getElementById(id),ok=field.value.trim().toLowerCase()===correct;if(ok)score++;field.disabled=true;field.insertAdjacentHTML("afterend",'<span class="answer-feedback">'+(ok?" ✓":" Correct: "+correct)+'</span>');});
 const result=document.getElementById("testResult");result.hidden=false;result.innerHTML="<strong>Your score: "+score+" / 13</strong><br>"+(score===13?"Excellent — all answers are correct.":"Review the correct answers shown above, then try again.");document.querySelectorAll(".heading-card").forEach(c=>c.draggable=false);if(timer)clearInterval(timer);window.EnglisityProgress?.recordActivity?.();result.scrollIntoView({behavior:"smooth",block:"center"});
});
document.getElementById("resetTest").addEventListener("click",()=>{submitted=false;selected=null;seconds=1200;if(timer)clearInterval(timer);document.getElementById("testResult").hidden=true;document.querySelectorAll(".match-question select").forEach(x=>{x.disabled=false;x.value="";});document.querySelectorAll(".completion-question input").forEach(x=>{x.disabled=false;x.value="";});document.querySelectorAll(".answer-feedback").forEach(x=>x.remove());render();refresh();closePopup();seconds=1200;showTime();document.body.classList.remove("practice-mode","exam-mode");modeLabel.textContent="Choose a mode to begin";gate.hidden=false;});
function showTime(){document.getElementById("timerDisplay").textContent=String(Math.floor(seconds/60)).padStart(2,"0")+":"+String(seconds%60).padStart(2,"0");}
function startTimer(autoSubmit=false){if(timer)clearInterval(timer);seconds=1200;showTime();timer=setInterval(()=>{if(submitted){clearInterval(timer);return;}seconds=Math.max(0,seconds-1);showTime();if(seconds===0){clearInterval(timer);if(autoSubmit)document.getElementById("checkAnswers").click();}},1000);}
function closePopup(){lookupId++;popup.classList.remove("show");}
function chooseMode(exam){gate.hidden=true;document.body.classList.remove("practice-mode","exam-mode");document.body.classList.add(exam?"exam-mode":"practice-mode");modeLabel.textContent=exam?"Exam mode · 20-minute timer":"Practice mode · Tap a word in the passage for its meaning";startTimer(exam);}
document.getElementById("practiceModeButton").addEventListener("click",()=>chooseMode(false));
document.getElementById("examModeButton").addEventListener("click",async()=>{try{await document.documentElement.requestFullscreen?.();}catch(e){}chooseMode(true);});
passageNode.addEventListener("click",e=>{if(!document.body.classList.contains("practice-mode"))return;const w=e.target.closest(".vocab-word");if(!w||!window.EnglisityLookup)return;const r=w.getBoundingClientRect();const id=++lookupId;window.EnglisityLookup.show(popup,w.dataset.word,r.left,r.bottom+8,null,()=>id===lookupId);});
document.addEventListener("pointerdown",e=>{if(!popup.contains(e.target)&&!e.target.closest(".vocab-word"))closePopup();});
document.getElementById("checkAnswers").addEventListener("click",()=>{if(timer)clearInterval(timer);if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});});
render();refresh();showTime();
const layout=document.getElementById("resizableTest"),divider=document.getElementById("resizeDivider");let resizing=false;
divider.addEventListener("pointerdown",e=>{resizing=true;divider.setPointerCapture(e.pointerId);e.preventDefault();});
divider.addEventListener("pointermove",e=>{if(!resizing)return;const r=layout.getBoundingClientRect(),v=Math.max(30,Math.min(70,(e.clientX-r.left)/r.width*100));layout.style.setProperty("--passage-width",v+"%");});
["pointerup","pointercancel"].forEach(t=>divider.addEventListener(t,()=>resizing=false));
})();