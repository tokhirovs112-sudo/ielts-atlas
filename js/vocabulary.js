(() => {
  "use strict";
  const WORDS = [
    {word:"substantial",pos:"adjective",definition:"Large or important enough to have a noticeable effect.",example:"The government should make substantial investments in public education.",context:"Writing",note:"Useful for describing a significant amount, change, effect or investment. It is formal but still natural.",synonyms:"significant · considerable"},
    {word:"compelling",pos:"adjective",definition:"Very convincing or interesting, so that it attracts attention or makes people believe something.",example:"There are compelling reasons to improve access to public transport.",context:"Both",note:"Use it for arguments, evidence, reasons, stories or explanations. Avoid using it simply to mean “good”.",synonyms:"convincing · persuasive"},
    {word:"broaden",pos:"verb",definition:"To make something wider or more varied; to increase the range of something.",example:"Travelling can broaden people's understanding of other cultures.",context:"Both",note:"Common with knowledge, experience, perspective and understanding.",synonyms:"expand · widen"},
    {word:"convenient",pos:"adjective",definition:"Easy to use or suitable for a particular purpose or situation.",example:"Online services are convenient because people can access them from home.",context:"Speaking",note:"A natural everyday word for describing places, services, times and arrangements.",synonyms:"practical · easy to use"},
    {word:"contribute to",pos:"verb phrase",definition:"To help cause something or help make something happen.",example:"Lack of sleep can contribute to poor concentration.",context:"Writing",note:"Use contribute to + noun or -ing form. It usually describes one factor among several.",synonyms:"help cause · play a part in"},
    {word:"tend to",pos:"verb phrase",definition:"To usually behave in a particular way or usually do something.",example:"People tend to rely more on their phones when travelling.",context:"Speaking",note:"A useful way to make generalisations without claiming that something is always true.",synonyms:"often · be likely to"},
    {word:"play a role in",pos:"verb phrase",definition:"To be involved in influencing or causing a situation or result.",example:"Parents play an important role in a child's early education.",context:"Both",note:"Often followed by a noun or -ing form. You can add an adjective: play a major/important role in.",synonyms:"influence · contribute to"}
  ];
  const QUESTIONS = [
    {q:"Which word means “large or important enough to have a noticeable effect”?",options:["Convenient","Substantial","Compelling","Broaden"],answer:1,why:"Substantial means large or important in amount, degree or effect."},
    {q:"Choose the most natural completion: “There is ______ evidence that regular exercise benefits health.”",options:["compelling","convenient","broaden","tend to"],answer:0,why:"Compelling evidence is evidence that is convincing."},
    {q:"Which phrase means “usually do something”?",options:["contribute to","play a role in","tend to","broaden"],answer:2,why:"Tend to describes what usually happens or what people usually do."},
    {q:"Choose the correct sentence.",options:["This may contribute better health.","This may contribute to better health.","This may contribute for better health.","This may contributes to better health."],answer:1,why:"Contribute to is followed by a noun phrase or an -ing form."},
    {q:"Which expression best completes the sentence? “Public transport can ______ reducing traffic congestion.”",options:["play a role in","tend to","broaden","convenient"],answer:0,why:"Play a role in means to be involved in influencing an outcome."},
    {q:"What does “broaden your perspective” mean?",options:["Make your opinion narrower","Make your viewpoint more varied or wider","Prove your opinion is correct","Change the subject"],answer:1,why:"Broaden means to widen or increase the range of something."},
    {q:"Which adjective is especially natural for describing a service that is easy to use?",options:["Substantial","Compelling","Convenient","Broaden"],answer:2,why:"Convenient describes something that is easy or suitable to use."}
  ];
  const STATS_KEY = "englisity-vocab-stats-v1";
  const STREAK_KEY = "englisity-quiz-streak-v1";
  const read = (key,fallback) => { try{return JSON.parse(localStorage.getItem(key)) ?? fallback;}catch{return fallback;} };
  const write = (key,value) => localStorage.setItem(key,JSON.stringify(value));
  const today = () => {const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");};
  const dayIndex = () => {const d=new Date();const start=new Date(d.getFullYear(),0,0);return Math.floor((d-start)/86400000);};
  const daily = WORDS[dayIndex()%WORDS.length];
  const $ = id => document.getElementById(id);
  $("dailyWordText").textContent=daily.word;
  $("dailyPos").textContent=daily.pos;
  $("dailyDefinition").textContent=daily.definition;
  $("dailyExample").textContent="“"+daily.example+"”";
  $("dailyTags").innerHTML='<span class="vocab-tag">'+daily.context+'</span><span class="vocab-tag">'+daily.synonyms+'</span>';
  $("dailyNote").textContent=daily.note;
  function renderWords(filter="all"){
    const list=$("wordList");list.innerHTML="";
    WORDS.filter(w=>filter==="all"||w.context===filter).forEach(w=>{
      const card=document.createElement("article");card.className="word-item";
      const h=document.createElement("h3");h.textContent=w.word;
      const p=document.createElement("p");p.textContent=w.definition;
      const ex=document.createElement("p");ex.textContent="“"+w.example+"”";ex.style.marginTop="8px";ex.style.fontStyle="italic";
      const tag=document.createElement("small");tag.textContent=w.context+" · "+w.pos;
      card.append(h,p,ex,tag);list.append(card);
    });
  }
  renderWords();
  document.querySelectorAll("[data-filter]").forEach(button=>button.addEventListener("click",()=>{
    document.querySelectorAll("[data-filter]").forEach(b=>b.classList.toggle("active",b===button));
    renderWords(button.dataset.filter);
  }));
  const order=[...QUESTIONS].sort((a,b)=>a.q.localeCompare(b.q)).slice(0,5);
  let index=0,score=0,selected=null,finished=false;
  const area=$("quizArea");
  function renderQuestion(){
    selected=null;
    $("quizProgress").textContent="Question "+(index+1)+" of 5 · "+score+" correct so far";
    area.innerHTML="";
    const q=order[index];
    const title=document.createElement("p");title.className="quiz-question";title.textContent=q.q;
    const options=document.createElement("div");options.className="quiz-options";
    q.options.forEach((option,i)=>{
      const button=document.createElement("button");button.type="button";button.className="quiz-option";button.textContent=String.fromCharCode(65+i)+". "+option;
      button.addEventListener("click",()=>{if(finished||selected!==null)return;selected=i;options.querySelectorAll("button").forEach((b,j)=>{b.disabled=true;if(j===i)b.classList.add("selected");});submit.disabled=false;});
      options.append(button);
    });
    const feedback=document.createElement("p");feedback.className="quiz-feedback";feedback.setAttribute("aria-live","polite");
    const submit=document.createElement("button");submit.type="button";submit.className="quiz-submit";submit.textContent=index===4?"Finish quiz":"Check answer";submit.disabled=true;
    submit.addEventListener("click",()=>{
      if(selected===null)return;
      if(selected===q.answer)score++;
      feedback.textContent=(selected===q.answer?"Correct. ":"Not quite. ")+q.why;
      submit.textContent=index===4?"See result":"Next question";
      submit.onclick=()=>{
        index++;
        if(index===5)showResult();else renderQuestion();
      };
    });
    area.append(title,options,feedback,submit);
  }
  function showResult(){
    finished=true;
    const passed=score>=4;
    const result=document.createElement("div");result.className="quiz-result";
    const heading=document.createElement("h3");heading.textContent="Your score: "+score+"/5";
    const message=document.createElement("p");
    if(passed){
      message.textContent="Well done — you passed. Your learning streak has been updated for today.";
      const streak=read(STREAK_KEY,{current:0,longest:0,lastActive:null});
      const date=today();
      if(streak.lastActive!==date){
        const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
        const y=[yesterday.getFullYear(),String(yesterday.getMonth()+1).padStart(2,"0"),String(yesterday.getDate()).padStart(2,"0")].join("-");
        streak.current=streak.lastActive===y?streak.current+1:1;
        streak.longest=Math.max(streak.longest||0,streak.current);
        streak.lastActive=date;write(STREAK_KEY,streak);
      }
      const stats=read(STATS_KEY,{passed:0,words:[]});
      stats.passed=(stats.passed||0)+1;stats.words=[...new Set([...(stats.words||[]),daily.word])];write(STATS_KEY,stats);
      window.dispatchEvent(new CustomEvent("englisity:quiz-passed",{detail:{score,streak}}));
    }else{
      message.textContent="You need at least 4/5 to pass. Review the explanations and try again — this attempt does not change your streak.";
    }
    const retry=document.createElement("button");retry.type="button";retry.className="quiz-submit";retry.textContent="Try again";
    retry.addEventListener("click",()=>{index=0;score=0;finished=false;renderQuestion();});
    result.append(heading,message,retry);area.replaceChildren(result);
    $("quizProgress").textContent=passed?"Passed · 4/5 required":"Not passed · 4/5 required";
  }
  renderQuestion();
})();