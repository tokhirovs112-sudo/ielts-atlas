(() => {
"use strict";
const WORDS = [
{id:"counterparts",word:"counterparts",pos:"noun (plural)",meaning:"People or things that have the same position or purpose as others in a different place, group or time.",example:"Students in rural areas often have fewer resources than their urban counterparts.",collocations:"their urban counterparts · male and female counterparts · foreign counterparts",use:"Very useful in Writing Task 1 and Task 2 for comparisons: compare one group with “their counterparts” instead of repeating the noun.",mistake:"Counterparts are equivalent people or things in another group, not opponents. Use it when the two groups clearly match.",skill:"Writing"},
{id:"in-fact",word:"in fact",pos:"phrase",meaning:"Used to add a more surprising or more detailed piece of information, or to correct what was just said.",example:"I don’t mind cooking. In fact, it’s one of my favourite ways to relax.",collocations:"in fact, … · and in fact · but in fact",use:"Natural in Speaking Part 1 and Part 3 when you want to strengthen or develop your answer.",mistake:"Use it to add something stronger or to correct an idea, not as a filler at the start of every sentence.",skill:"Speaking"},
{id:"to-the-point-where",word:"to the point where",pos:"phrase",meaning:"To such a degree that a particular result happens.",example:"I used my phone so much that it got to the point where I couldn’t focus on my studies.",collocations:"get to the point where · reach the point where · grow to the point where",use:"Helps you describe how a situation developed in Speaking Part 2 stories and Part 3 answers.",mistake:"Follow it with a full clause: to the point where I couldn’t sleep, not to the point where sleeping.",skill:"Speaking"},
{id:"necessary-evil",word:"necessary evil",pos:"noun phrase",meaning:"Something unpleasant that you have to accept because it is needed to achieve something.",example:"For many people, a long commute is a necessary evil if they want a well-paid job.",collocations:"a necessary evil · see something as a necessary evil · regarded as a necessary evil",use:"A natural, slightly informal way to give a balanced opinion in Speaking Part 3.",mistake:"It is not about something truly evil or wicked; it describes an unpleasant but useful thing. Usually used with “a”.",skill:"Speaking"},
{id:"basically",word:"basically",pos:"adverb",meaning:"Used to introduce the simplest or most important point; in the most important ways.",example:"Basically, I chose this university because it offers the course I wanted.",collocations:"basically, … · basically the same · basically means",use:"Useful in Speaking to summarise your main idea simply, especially after a longer explanation.",mistake:"Do not use it in every sentence; overusing it sounds like a filler and can lower your fluency score. Avoid it in formal essays.",skill:"Speaking"},
{id:"decisiveness",word:"decisiveness",pos:"noun",meaning:"The ability to make decisions quickly and confidently.",example:"Good leaders combine decisiveness with a willingness to listen to others.",collocations:"show decisiveness · lack of decisiveness · decisiveness and confidence",use:"Useful when describing people, leaders and qualities for success.",mistake:"Do not confuse it with decision, which is the choice itself. The adjective is decisive.",skill:"Both"},
{id:"concentrate",word:"concentrate",pos:"verb",meaning:"To give all your attention or effort to something.",example:"It is difficult to concentrate on homework when your phone keeps making noises.",collocations:"concentrate on · find it hard to concentrate · concentrate your efforts",use:"Common in topics about study, work, technology and health.",mistake:"The usual preposition is on: concentrate on your work, not concentrate in your work.",skill:"Both"},
{id:"realize",word:"realize",pos:"verb",meaning:"To become aware of or understand something; also, to achieve something you hoped for.",example:"I didn’t realize how much I enjoyed teaching until I tried it.",collocations:"realize that · suddenly realize · realize your dreams / potential",use:"British spelling is realise; both spellings are accepted in IELTS, but use one consistently.",mistake:"Realize means understand or become aware; it does not mean notice by seeing. Do not mix up realise and realize in one essay.",skill:"Both"},
{id:"decry",word:"decry",pos:"verb",meaning:"To criticise something strongly and publicly.",example:"Many scientists have decried the spread of false health information online.",collocations:"widely decried · decry the decision · decry the lack of",use:"A formal verb for essays when describing strong public criticism.",mistake:"Decry is formal and rarely used in everyday speech; criticise strongly is a safer alternative when speaking.",skill:"Writing"},
{id:"steward",word:"steward",pos:"noun",meaning:"A person responsible for taking care of something, such as land, money or resources; also, a person who looks after passengers or guests.",example:"Governments should act as responsible stewards of natural resources for future generations.",collocations:"stewards of the environment · responsible steward · stewardship of resources",use:"Useful in environment and government essays; the related noun stewardship means careful management.",mistake:"In everyday English a steward can also be someone who serves on a plane or ship; make the meaning clear from context.",skill:"Writing"},
{id:"facetious",word:"facetious",pos:"adjective",meaning:"Trying to be funny about a serious subject in a way that is not appropriate.",example:"His facetious comment during the serious meeting annoyed his colleagues.",collocations:"facetious remark · facetious comment · being facetious",use:"An advanced adjective for describing inappropriate humour or attitudes.",mistake:"It is negative. Facetious is not the same as funny or humorous; it means joking at the wrong time.",skill:"Writing"},
{id:"summarize",word:"summarize",pos:"verb",meaning:"To give a short statement of the main points of something.",example:"Writing Task 1 asks you to summarize the information by selecting the main features.",collocations:"summarize the main points · summarize the information · to summarize, …",use:"Key word in Writing Task 1 instructions; British spelling is summarise.",mistake:"A summary gives the main points only. Do not repeat every detail when you summarize.",skill:"Writing"},
{id:"expediency",word:"expediency",pos:"noun",meaning:"Doing what is useful or convenient in a situation, even if it is not completely fair or morally right.",example:"The decision was based on political expediency rather than on what was best for citizens.",collocations:"political expediency · for reasons of expediency · a matter of expediency",use:"A formal word for Task 2 essays about government, business and ethics.",mistake:"It usually has a negative meaning: it suggests choosing what is easy or useful over what is right.",skill:"Writing"},
{id:"considerate",word:"considerate",pos:"adjective",meaning:"Thinking about other people’s feelings and needs.",example:"My neighbour is very considerate; she always keeps the music low at night.",collocations:"considerate of others · kind and considerate · it was considerate of you",use:"Great for describing people in Speaking Part 1 and Part 2.",mistake:"Do not confuse considerate (kind to others) with considerable (large in amount).",skill:"Speaking"},
{id:"coordinate",word:"coordinate",pos:"verb",meaning:"To organise different people or things so that they work together effectively.",example:"The government needs to coordinate the work of different agencies during a crisis.",collocations:"coordinate efforts · coordinate with others · well coordinated",use:"Useful for discussing teamwork, organisations and planning.",mistake:"Use coordinate with someone when you work together: coordinate with other teams.",skill:"Both"},
{id:"put-down",word:"put down",pos:"phrasal verb",meaning:"To criticise someone in a way that makes them feel stupid or unimportant; also, to write something down.",example:"A good teacher encourages students instead of putting them down.",collocations:"put someone down · put your ideas down on paper · a put-down (noun)",use:"Informal and natural in Speaking when talking about people and relationships.",mistake:"The object can go in the middle: put him down. With a pronoun it must go in the middle: put her down, not put down her.",skill:"Speaking"},
{id:"inexplicable",word:"inexplicable",pos:"adjective",meaning:"Impossible to explain or understand.",example:"For some inexplicable reason, the bus never arrived.",collocations:"for some inexplicable reason · inexplicable behaviour · remain inexplicable",use:"Useful for describing strange events in Speaking Part 2 or unexplained trends in essays.",mistake:"Stress the second syllable: in-EX-pli-ca-ble (in-ex-PLIC-able is also heard). The opposite is explicable, which is rarely used.",skill:"Both"},
{id:"substantial",word:"substantial",pos:"adjective",meaning:"Large in amount, size, value or importance; considerable.",example:"The city needs substantial investment in public transport.",collocations:"substantial investment · substantial evidence · substantial increase",use:"Useful in formal writing when describing a significant amount, change or effect.",mistake:"Do not use it as a general synonym for good. It describes size, importance or extent.",skill:"Writing"},
{id:"compelling",word:"compelling",pos:"adjective",meaning:"So persuasive or interesting that it holds attention or makes people believe or consider something.",example:"There are compelling reasons to improve access to public libraries.",collocations:"compelling evidence · compelling argument · compelling reason",use:"Often describes evidence, arguments, reasons, stories or explanations.",mistake:"It does not simply mean positive or enjoyable. In an argument, it usually means convincing.",skill:"Both"},
{id:"broaden",word:"broaden",pos:"verb",meaning:"To make something wider or more varied, or to increase the range of someone's knowledge, experience or choices.",example:"Studying abroad can broaden a person's understanding of other cultures.",collocations:"broaden your horizons · broaden your knowledge · broaden your perspective",use:"Often used with horizons, knowledge, experience, perspective and understanding.",mistake:"Use broaden something, not broaden about something.",skill:"Both"},
{id:"convenient",word:"convenient",pos:"adjective",meaning:"Suitable for your needs or plans, especially because it is easy to use, reach or arrange.",example:"Online banking is convenient for people who cannot visit a branch easily.",collocations:"convenient location · convenient time · quick and convenient",use:"Natural in everyday speech and useful when discussing services, places and arrangements.",mistake:"Convenient means easy or suitable, not necessarily comfortable or enjoyable.",skill:"Speaking"},
{id:"contribute to",word:"contribute to",pos:"verb phrase",meaning:"To help cause a result or to add something that helps a person, group or activity succeed.",example:"Regular exercise can contribute to better mental well-being.",collocations:"contribute to growth · contribute to a problem · contribute to improving",use:"Follow it with a noun or an -ing form: contribute to success / contribute to solving a problem.",mistake:"The preposition to is required. Do not write contribute for or contribute something to when you mean help cause.",skill:"Writing"},
{id:"tend to",word:"tend to",pos:"verb phrase",meaning:"To behave or happen in a particular way often, although not always.",example:"People tend to check their phones while waiting for public transport.",collocations:"people tend to · tend to believe · tend to prefer",use:"Useful for making careful generalisations without saying something is always true.",mistake:"Use tend to + base verb: tend to spend, not tend spending.",skill:"Speaking"},
{id:"play a role in",word:"play a role in",pos:"verb phrase",meaning:"To have an effect or influence on something, or to be involved in making it happen.",example:"Teachers play an important role in helping students build confidence.",collocations:"play a major role · play an important role · play a role in shaping",use:"Follow with a noun or an -ing form: play a role in education / in shaping policy.",mistake:"Use in, not on, before the activity or result.",skill:"Both"},
{id:"allocate",word:"allocate",pos:"verb",meaning:"To decide how something such as time, money or resources will be used or shared for a particular purpose.",example:"The local council should allocate more funding to public transport.",collocations:"allocate resources · allocate funding · allocate time",use:"A precise formal verb for budgets, planning and distribution.",mistake:"Allocate is usually followed by something being distributed and to a recipient or purpose.",skill:"Writing"},
{id:"drawback",word:"drawback",pos:"noun",meaning:"A feature or condition that makes something less useful, pleasant or advantageous; a disadvantage.",example:"One drawback of remote work is the lack of face-to-face interaction.",collocations:"a major drawback · the main drawback · potential drawbacks",use:"Useful for balanced arguments when discussing disadvantages.",mistake:"A drawback is a disadvantage, not necessarily a reason to reject something completely.",skill:"Writing"},
{id:"maintain",word:"maintain",pos:"verb",meaning:"To keep something at the same level or in good condition; it can also mean to continue to say that something is true.",example:"It can be difficult to maintain a healthy balance between work and study.",collocations:"maintain a balance · maintain standards · maintain that",use:"Common with standards, relationships, balance, progress and an argument or position.",mistake:"Maintain does not mean gain. It means keep or continue.",skill:"Both"},
{id:"reliable",word:"reliable",pos:"adjective",meaning:"Able to be trusted or depended on because it works well or behaves consistently.",example:"Students need reliable sources when researching a topic.",collocations:"reliable source · reliable information · reliable service",use:"Useful when evaluating information, people, services and equipment.",mistake:"Reliable describes trustworthiness or consistency, not simply popularity.",skill:"Both"},
{id:"tackle",word:"tackle",pos:"verb",meaning:"To take action to deal with a problem or difficult task.",example:"Governments need long-term plans to tackle air pollution.",collocations:"tackle a problem · tackle inequality · tackle the issue",use:"A direct, natural verb for discussing problems and solutions.",mistake:"Tackle a problem means address it; it does not automatically mean solve it completely.",skill:"Writing"},
{id:"significant",word:"significant",pos:"adjective",meaning:"Important enough to matter or be noticed; also, large enough to have a clear effect.",example:"The new policy led to a significant reduction in waiting times.",collocations:"significant impact · significant difference · significant increase",use:"A versatile academic adjective for describing important effects or measurable changes.",mistake:"Do not confuse significant with specific. They have different meanings.",skill:"Writing"},
{id:"affordable",word:"affordable",pos:"adjective",meaning:"Inexpensive enough for a particular person or group to be able to pay for.",example:"Reliable public transport should be affordable for everyone.",collocations:"affordable housing · affordable prices · relatively affordable",use:"Useful in discussions about housing, education, healthcare and services.",mistake:"Affordable is relative to what people can pay; it does not mean free.",skill:"Both"},
{id:"outweigh",word:"outweigh",pos:"verb",meaning:"To be greater or more important than something else.",example:"For many students, the benefits of learning another language outweigh the difficulties.",collocations:"benefits outweigh drawbacks · costs outweigh benefits",use:"Especially useful for comparing advantages and disadvantages in an essay.",mistake:"The subject is the more important side: the benefits outweigh the costs.",skill:"Writing"},
{id:"widespread",word:"widespread",pos:"adjective",meaning:"Found, happening or known across a large area or among many people.",example:"The widespread use of smartphones has changed how people communicate.",collocations:"widespread use · widespread concern · widespread support",use:"Describes something common across a large area or group.",mistake:"Widespread describes how far something extends, not how intense it is.",skill:"Writing"},
{id:"engage in",word:"engage in",pos:"verb phrase",meaning:"To take part in an activity or become involved in it.",example:"Young people should have opportunities to engage in community projects.",collocations:"engage in discussion · engage in activities · actively engage in",use:"Often used with activities, discussions, research and community work.",mistake:"Use engage in an activity; engage with a person or issue has a different pattern.",skill:"Both"},
{id:"aware of",word:"aware of",pos:"adjective phrase",meaning:"Knowing about a situation, fact or condition; conscious that it exists.",example:"Many consumers are becoming more aware of the environmental impact of their choices.",collocations:"become aware of · fully aware of · raise awareness of",use:"Useful for discussing knowledge, public information and social issues.",mistake:"Use aware of + noun or -ing form, not aware about in standard formal usage.",skill:"Both"}
,{id:"respectively",word:"respectively",pos:"adverb",meaning:"In the same order as the people or things just mentioned.",example:"The two courses last six and eight weeks, respectively.",collocations:"A and B, respectively · listed respectively · correspond respectively",use:"Useful in formal writing when matching two or more items to details in the same order.",mistake:"Use it only when the order of the information is clear.",skill:"Writing"},
{id:"according-to",word:"according to",pos:"prepositional phrase",meaning:"As stated by a person, source, report or set of information.",example:"According to the latest report, public transport use has increased.",collocations:"according to the report · according to experts · according to research",use:"Useful for introducing information from a source or someone's opinion.",mistake:"Do not use according to me for your own opinion; say in my opinion instead.",skill:"Writing"},
{id:"regarding",word:"regarding",pos:"preposition",meaning:"About or concerning a particular subject.",example:"The school sent an email regarding the new examination rules.",collocations:"regarding the issue · regarding your request · information regarding",use:"A concise, formal way to introduce the subject of a message or discussion.",mistake:"Regarding is already a preposition, so do not add about after it.",skill:"Writing"},
{id:"in-terms-of",word:"in terms of",pos:"prepositional phrase",meaning:"When considering a particular aspect, feature or way of measuring something.",example:"In terms of cost, travelling by bus is usually the cheaper option.",collocations:"in terms of cost · in terms of quality · in terms of performance",use:"Useful for organising comparisons by one specific criterion.",mistake:"Follow it with the aspect being considered, not a complete unrelated clause.",skill:"Both"},
{id:"latter",word:"latter",pos:"adjective / pronoun",meaning:"The second of two people or things that have just been mentioned.",example:"Both online and in-person courses have benefits, but the latter offers face-to-face interaction.",collocations:"the latter option · the latter approach · the former and the latter",use:"Useful in formal writing to refer back to the second of two clearly named options.",mistake:"Use latter for the second item; do not use it when more than two items make the reference unclear.",skill:"Writing"},
{id:"former",word:"former",pos:"adjective / pronoun",meaning:"The first of two people or things that have just been mentioned; it can also mean something from an earlier time.",example:"Some prefer working from home, while others choose an office; the former value flexibility.",collocations:"the former option · the former approach · the former and the latter",use:"Useful in formal writing to refer back to the first of two clearly named options.",mistake:"Former refers to the first of two items, whereas latter refers to the second.",skill:"Writing"},
{id:"lead-the-pack",word:"lead the pack",pos:"idiom",meaning:"To be ahead of others or perform better than the competition.",example:"The company leads the pack in developing affordable electric vehicles.",collocations:"continue to lead the pack · lead the pack in technology · industry leaders",use:"Natural in speaking and suitable for less formal writing about competition, progress or performance.",mistake:"It means be ahead of competitors, not simply be included in a group.",skill:"Speaking"},
{id:"chief-among-them",word:"chief among them",pos:"phrase",meaning:"The most important one or ones in a group of things just mentioned.",example:"The plan has several advantages, chief among them its low cost.",collocations:"advantages, chief among them · reasons, chief among them · chief among these",use:"Useful in formal writing to introduce the most important example from a list.",mistake:"Them refers back to plural items; make sure the group is clear.",skill:"Writing"},
{id:"moreover",word:"moreover",pos:"linking adverb",meaning:"Used to add information that supports or strengthens the previous point.",example:"The library is free to use; moreover, it stays open late during exam periods.",collocations:"Moreover, · furthermore · in addition",use:"Useful in formal writing when adding a relevant supporting point.",mistake:"Do not overuse it or place it between two clauses with only a comma; use a full stop or semicolon before it.",skill:"Writing"}];
const QUESTIONS = [
{recent:true,q:"Choose the best word: “Young workers today earn less than their ______ did thirty years ago.”",o:["counterparts", "stewards", "coordinates", "put-downs"],a:0,why:"Counterparts are people in the same position in a different group or time — here, young workers in the past."},
{recent:true,q:"Complete the answer naturally: “I don’t mind exams. ______, I quite enjoy them.”",o:["In fact", "Basically", "To the point where", "In terms of"],a:0,why:"In fact adds a stronger, more surprising piece of information to the previous idea."},
{recent:true,q:"Complete the sentence: “I was so busy that it got ______ I forgot to eat lunch.”",o:["to the point where", "in fact", "according to", "chief among them"],a:0,why:"To the point where shows that the situation became so extreme that a result happened."},
{recent:true,q:"“Taxes are unpleasant, but we need them to pay for schools and hospitals.” Which expression describes taxes here?",o:["a necessary evil", "a facetious remark", "an inexplicable event", "a put-down"],a:0,why:"A necessary evil is something unpleasant that must be accepted because it is needed."},
{recent:true,q:"Which word is best for giving the simple main point in spoken English? “______, I moved to the city for work.”",o:["Basically", "Moreover", "Respectively", "Regarding"],a:0,why:"Basically introduces the simplest or most important point. It is natural in speaking but should not be overused."},
{recent:true,q:"A manager makes firm choices quickly and confidently. Which quality does this show?",o:["decisiveness", "expediency", "facetiousness", "stewardship"],a:0,why:"Decisiveness is the ability to make decisions quickly and confidently."},
{recent:true,q:"Choose the correct sentence.",o:["It is hard to concentrate on studying in a noisy room.", "It is hard to concentrate in studying in a noisy room.", "It is hard to concentrate at studying in a noisy room.", "It is hard to concentrate studying on a noisy room."],a:0,why:"The usual pattern is concentrate on something: concentrate on studying."},
{recent:true,q:"Complete the sentence: “She didn’t ______ that the shop had closed until she reached the door.”",o:["realize", "summarize", "coordinate", "decry"],a:0,why:"Realize means to become aware of something."},
{recent:true,q:"Many experts have publicly and strongly criticised the new law. Which verb fits? “Many experts have ______ the new law.”",o:["decried", "realized", "coordinated", "summarized"],a:0,why:"To decry something is to criticise it strongly and publicly."},
{recent:true,q:"Choose the best word: “Farmers can act as ______ of the land, protecting it for future generations.”",o:["stewards", "counterparts", "put-downs", "necessary evils"],a:0,why:"A steward is a person who takes care of or manages something, such as land or resources."},
{recent:true,q:"During a serious discussion about the accident, he made a joke. How would you describe his comment?",o:["facetious", "considerate", "decisive", "inexplicable"],a:0,why:"Facetious describes joking about a serious subject in an inappropriate way."},
{recent:true,q:"In Writing Task 1, what should you do with the main features of a chart?",o:["summarize them", "decry them", "put them down", "coordinate them"],a:0,why:"Summarize means to give a short statement of the main points, which is what Task 1 asks for."},
{recent:true,q:"The government chose the cheapest and quickest option, even though it was not the fairest. This decision was based on ______.",o:["expediency", "decisiveness", "stewardship", "concentration"],a:0,why:"Expediency means doing what is useful or convenient, even if it is not completely fair or right."},
{recent:true,q:"Which word describes a person who thinks about other people’s feelings?",o:["considerate", "considerable", "facetious", "decisive"],a:0,why:"Considerate means thinking about others’ feelings. Considerable means large in amount."},
{recent:true,q:"Choose the best verb: “The event organisers had to ______ the work of more than fifty volunteers.”",o:["coordinate", "decry", "realize", "put down"],a:0,why:"Coordinate means to organise people or things so they work together effectively."},
{recent:true,q:"Choose the correct sentence.",o:["He always puts her down in front of others.", "He always puts down her in front of others.", "He always puts her in front down of others.", "He always down puts her in front of others."],a:0,why:"With a pronoun, the object goes in the middle of the phrasal verb put down: put her down."},
{recent:true,q:"Nobody could understand or explain why the lights suddenly went out. The event was ______.",o:["inexplicable", "considerate", "facetious", "decisive"],a:0,why:"Inexplicable means impossible to explain or understand."},
{q:"The city plans to spend a large amount of money on repairing its roads. Which word best completes the sentence? “The project requires ______ investment.”",o:["convenient","substantial","reliable","widespread"],a:1,why:"Substantial means large or important in amount. “Substantial investment” is a natural collocation."},
{q:"Choose the best word: “The report presents ______ evidence that the new approach works.”",o:["compelling","affordable","convenient","widespread"],a:0,why:"Compelling evidence is convincing evidence that makes a claim persuasive."},
{q:"Complete the sentence: “Volunteering can ______ your understanding of other communities.”",o:["maintain","allocate","broaden","outweigh"],a:2,why:"Broaden means make wider or more varied. “Broaden your understanding” is a natural combination."},
{q:"A service is easy to access and use. Which adjective describes it most naturally?",o:["significant","convenient","compelling","substantial"],a:1,why:"Convenient describes something that is easy or suitable to use in a situation."},
{q:"Choose the grammatically correct sentence.",o:["Exercise can contribute better health.","Exercise can contribute for better health.","Exercise can contribute to better health.","Exercise can contributes to better health."],a:2,why:"The phrase is contribute to. The preposition to is followed here by the noun phrase “better health”."},
{q:"Complete the sentence: “When people are tired, they ______ make less careful decisions.”",o:["tend to","play a role in","contribute to","engage in"],a:0,why:"Tend to + base verb describes what usually happens. Here it is followed by “make”."},
{q:"Choose the correct completion: “Parents play an important role ______ children's early development.”",o:["on","at","for","in"],a:3,why:"The fixed expression is play a role in. It can be followed by a noun or an -ing form."},
{q:"The school has a limited budget and must decide how to distribute it between subjects. Which verb fits? “The school will ______ more funding to science.”",o:["tackle","allocate","maintain","broaden"],a:1,why:"Allocate means officially distribute money, time or resources for a particular purpose."},
{q:"Complete the sentence: “One ______ of living far from the city centre is the longer commute.”",o:["drawback","horizon","standard","role"],a:0,why:"A drawback is a disadvantage. A longer commute is a disadvantage of that location."},
{q:"Choose the best verb: “It can be difficult to ______ a healthy work-life balance.”",o:["outweigh","tackle","maintain","allocate"],a:2,why:"Maintain means keep something at a particular level or condition. “Maintain a balance” is a common collocation."},
{q:"Which adjective best describes information that can be trusted?",o:["reliable","widespread","affordable","significant"],a:0,why:"Reliable information is trustworthy and dependable."},
{q:"Complete the sentence: “The government needs to ______ the problem of plastic waste.”",o:["broaden","tackle","outweigh","maintain"],a:1,why:"Tackle a problem means make a determined effort to deal with it."},
{q:"A change is important and large enough to be noticed. Which adjective fits?",o:["convenient","significant","reliable","affordable"],a:1,why:"Significant describes something important or large enough to have a noticeable effect."},
{q:"Choose the best word: “The aim is to provide good-quality but ______ housing.”",o:["compelling","affordable","widespread","substantial"],a:1,why:"Affordable housing is housing that people can reasonably pay for."},
{q:"Complete the comparison: “In this case, the advantages ______ the disadvantages.”",o:["allocate","maintain","outweigh","engage"],a:2,why:"Outweigh means be more important or valuable than something else."},
{q:"Which adjective describes something that exists in many places or affects many people?",o:["widespread","convenient","compelling","reliable"],a:0,why:"Widespread means existing or happening across many places or among many people."},
{q:"Choose the correct phrase: “Students should ______ discussions rather than remain silent.”",o:["engage in","aware of","contribute to","play a role on"],a:0,why:"Engage in means take part in an activity. “Engage in discussions” is correct."},
{q:"Complete the sentence: “People are becoming more ______ the effects of air pollution.”",o:["aware of","aware to","aware for","aware with"],a:0,why:"The standard phrase is aware of + noun phrase: aware of the effects."}
,
{q:"The two teams scored 3 and 5 goals, ______.",o:["respectively","regarding","moreover","formerly"],a:0,why:"Respectively matches the two scores to the two teams in the same order."},
{q:"Choose the correct phrase to introduce information from a source: “______ the survey, most students prefer online resources.”",o:["In terms of","According to","Chief among","Respectively"],a:1,why:"According to introduces information reported by a source, such as a survey."},
{q:"Which word means “about” in a formal email? “I am writing ______ your recent application.”",o:["latter","moreover","regarding","respectively"],a:2,why:"Regarding means about or concerning a subject."},
{q:"Complete the sentence: “______ price, the second laptop is more affordable.”",o:["In terms of","According to","Chief among them","Respectively"],a:0,why:"In terms of introduces the particular aspect being compared: price."},
{q:"Two options have been mentioned: studying online and studying in a classroom. The second option is ______.",o:["the former","the latter","the chief","the respective"],a:1,why:"The latter refers to the second of two previously mentioned items."},
{q:"Two options have been mentioned: studying online and studying in a classroom. The first option is ______.",o:["the latter","the former","the moreover","the respective"],a:1,why:"The former refers to the first of two previously mentioned items."},
{q:"Complete the sentence: “Among local businesses, this shop continues to ______ because of its customer service.”",o:["lead the pack","draw the latter","regard the former","make respectively"],a:0,why:"Lead the pack means be ahead of competitors or perform better than others."},
{q:"Choose the most natural completion: “The proposal has several strengths, ______ its low cost.”",o:["respectively","chief among them","according to","in terms"],a:1,why:"Chief among them introduces the most important item in a group of strengths."},
{q:"Which linking adverb adds a further supporting point? “The course is affordable. ______, it offers flexible hours.”",o:["Latter","Former","Moreover","Regarding"],a:2,why:"Moreover adds another point that supports or strengthens the previous statement."},
{q:"A disadvantage of a plan is its high cost. Which word names this disadvantage?",o:["drawback","benefit","evidence","approach"],a:0,why:"A drawback is a disadvantage or feature that makes something less attractive."}];
const STORE="englisity-vocab-learning-v2", STATS="englisity-vocab-stats-v1";
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const fresh=()=>({saved:[],known:[],reviews:{}});
let state={...fresh(),...read(STORE,fresh())};state.saved=state.saved||[];state.known=state.known||[];state.reviews=state.reviews||{};
const $=id=>document.getElementById(id);
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
const addDays=(n)=>{const d=new Date();d.setDate(d.getDate()+n);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function saveState(){write(STORE,state);updateStats()}
const skillLabel=s=>s==="Both"?"Writing & Speaking":s;
const canSpeak="speechSynthesis" in window&&typeof SpeechSynthesisUtterance!=="undefined";
function speak(text){if(!canSpeak)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="en-GB";u.rate=.9;speechSynthesis.speak(u)}catch(e){}}
function speakButton(getText,label){const b=document.createElement("button");b.type="button";b.className="vocab-speak";b.textContent="🔊";b.title="Listen";b.setAttribute("aria-label",label||"Listen to pronunciation");b.addEventListener("click",e=>{e.stopPropagation();speak(typeof getText==="function"?getText():getText)});return b}
function wordDetails(w){return '<p class="word-example-line">“'+escapeHTML(w.example)+'”</p><p><strong>Common combinations:</strong> '+escapeHTML(w.collocations)+'</p><p><strong>How to use it:</strong> '+escapeHTML(w.use)+'</p><p><strong>Watch out:</strong> '+escapeHTML(w.mistake)+'</p>'}
function updateStats(){
 const due=state.saved.filter(id=>{const r=state.reviews[id];return !r||!r.due||r.due<=today()}).length;
 $("knownCount").textContent=state.known.length;
 $("savedCount").textContent=state.saved.length;
 $("dueCount").textContent=due;
}
function saveWord(id){
 if(!state.saved.includes(id))state.saved.push(id);
 if(!state.reviews[id])state.reviews[id]={level:0,due:today()};
 saveState();renderWords();updateDailySave();
}
function unsaveWord(id){state.saved=state.saved.filter(x=>x!==id);saveState();renderWords();updateDailySave()}
function updateDailySave(){
 const id=daily.id,button=$("saveDaily"),saved=state.saved.includes(id);
 button.textContent=saved?"✓ In review list":"＋ Review later";
 button.setAttribute("aria-pressed",String(saved));
}
const dayNumber=Math.floor((new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate())-new Date(new Date().getFullYear(),0,0))/86400000);
const daily=WORDS[dayNumber%WORDS.length];
$("dailyWordText").textContent=daily.word;$("dailyPos").textContent=daily.pos+" · "+skillLabel(daily.skill);
if(canSpeak)$("dailyWordText").after(speakButton(daily.word,"Listen to "+daily.word));
$("dailyDefinition").textContent=daily.meaning;$("dailyExample").textContent="“"+daily.example+"”";
$("dailyCollocations").innerHTML="<strong>Common combinations:</strong> "+escapeHTML(daily.collocations);
$("dailyUsage").innerHTML="<strong>How to use it:</strong> "+escapeHTML(daily.use);
$("dailyMistake").innerHTML="<strong>Watch out:</strong> "+escapeHTML(daily.mistake);
$("saveDaily").addEventListener("click",()=>state.saved.includes(daily.id)?unsaveWord(daily.id):saveWord(daily.id));
updateDailySave();
let activeFilter="All";
function renderWords(){
 const query=$("wordSearch").value.trim().toLowerCase();
 const filtered=WORDS.filter(w=>{
  const filterOK=activeFilter==="All"||(activeFilter==="Saved"?state.saved.includes(w.id):(w.skill===activeFilter||w.skill==="Both"));
  return filterOK&&[w.word,w.meaning,w.collocations,w.example].join(" ").toLowerCase().includes(query);
 });
 $("wordCountLabel").textContent=filtered.length+" of "+WORDS.length+" words";
 const list=$("wordList");list.innerHTML="";
 if(!filtered.length){list.innerHTML='<div class="vocab-empty">'+(activeFilter==="Saved"&&!query?'Your review list is empty. Use “＋ Add to review” on any word, or mark words in the flashcards.':'No matching words. Try another search or filter.')+'</div>';return}
 filtered.forEach(w=>{
  const card=document.createElement("article");card.className="vocab-item";
  const title=document.createElement("h3");title.textContent=w.word;if(canSpeak)title.append(speakButton(w.word,"Listen to "+w.word));
  const meta=document.createElement("div");meta.className="item-meta";meta.textContent=w.pos+" · "+skillLabel(w.skill);
  const p=document.createElement("p");p.textContent=w.meaning;
  const actions=document.createElement("div");actions.className="vocab-item-actions";
  const save=document.createElement("button");save.type="button";save.textContent=state.saved.includes(w.id)?"✓ Saved":"＋ Add to review";save.classList.toggle("saved",state.saved.includes(w.id));save.setAttribute("aria-pressed",String(state.saved.includes(w.id)));
  save.addEventListener("click",()=>state.saved.includes(w.id)?unsaveWord(w.id):saveWord(w.id));
  const example=document.createElement("button");example.type="button";example.textContent="Show details";example.setAttribute("aria-expanded","false");
  const detail=document.createElement("div");detail.className="vocab-item-detail";detail.hidden=true;detail.innerHTML=wordDetails(w);
  example.addEventListener("click",()=>{detail.hidden=!detail.hidden;example.textContent=detail.hidden?"Show details":"Hide details";example.setAttribute("aria-expanded",String(!detail.hidden))});
  actions.append(save,example);card.append(title,meta,p,actions,detail);list.append(card);
 });
}
$("wordSearch").addEventListener("input",renderWords);
document.querySelectorAll("[data-filter]").forEach(b=>b.addEventListener("click",()=>{activeFilter=b.dataset.filter;document.querySelectorAll("[data-filter]").forEach(x=>x.classList.toggle("active",x===b));renderWords()}));
renderWords();updateStats();
function shuffle(a){const x=a.slice();for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
// Flashcards use a small spaced-review schedule. “Got it” moves the next review further away.
let studyQueue=[],studyIndex=0,currentStudy=null,revealed=false,sessionKnown=0,sessionAgain=new Set(),sessionTotal=0;
function beginSession(queue,message){studyQueue=queue.slice();studyIndex=0;sessionKnown=0;sessionAgain=new Set();sessionTotal=studyQueue.length;renderStudy();if(message)$("studyMessage").textContent=message}
function startStudy(){
 const due=state.saved.filter(id=>{const r=state.reviews[id];return !r||!r.due||r.due<=today()});
 const ids=due.length?due:state.saved.length?state.saved:WORDS.map(w=>w.id);
 let queue=ids.map(id=>WORDS.find(w=>w.id===id)).filter(Boolean);
 if(!queue.length)queue=WORDS.slice();
 beginSession(queue);
}
function renderStudy(){
 if(studyIndex>=studyQueue.length){showStudyDone();return}
 currentStudy=studyQueue[studyIndex];revealed=false;
 $("studyCounter").textContent="Card "+(studyIndex+1)+" of "+studyQueue.length+(studyQueue.length>sessionTotal?" (including repeats)":"");
 $("studyWord").textContent=currentStudy.word;if(canSpeak)$("studyWord").append(speakButton(()=>currentStudy.word,"Listen to this word"));
 $("studyPrompt").hidden=false;$("studyPrompt").textContent="Can you explain this expression and make your own sentence?";
 $("studyAnswer").hidden=true;$("studyAnswer").innerHTML="<p><strong>"+escapeHTML(currentStudy.meaning)+"</strong></p><p>Example: “"+escapeHTML(currentStudy.example)+"”</p><p><strong>Common combinations:</strong> "+escapeHTML(currentStudy.collocations)+"</p><p><strong>Watch out:</strong> "+escapeHTML(currentStudy.mistake)+"</p>";
 $("revealStudy").hidden=false;$("revealStudy").disabled=false;$("againStudy").hidden=false;$("knowStudy").hidden=false;$("againStudy").disabled=true;$("knowStudy").disabled=true;$("nextStudy").hidden=true;
}
function showStudyDone(){
 currentStudy=null;
 $("studyCounter").textContent="Session complete";
 $("studyWord").textContent=sessionKnown+" of "+sessionTotal+" words known";
 $("studyPrompt").hidden=false;
 $("studyPrompt").textContent=sessionAgain.size?("Words to keep practising: "+[...sessionAgain].join(", ")+". They are in your review list for next time."):"Excellent. Each word will come back in a few days so it stays in your memory.";
 $("studyAnswer").hidden=true;
 ["revealStudy","againStudy","knowStudy","nextStudy"].forEach(id=>$(id).hidden=true);
 $("studyMessage").textContent="Start another session with the buttons below.";
}
$("revealStudy").addEventListener("click",()=>{if(!currentStudy)return;revealed=true;$("studyAnswer").hidden=false;$("studyPrompt").hidden=true;$("revealStudy").hidden=true;$("againStudy").disabled=false;$("knowStudy").disabled=false;$("knowStudy").focus()});
function markReview(known){
 if(!currentStudy||!revealed)return;
 const id=currentStudy.id;
 if(!state.saved.includes(id))state.saved.push(id);
 const old=state.reviews[id]||{level:0};
 if(known){old.level=Math.min((old.level||0)+1,4);state.known=[...new Set([...state.known,id])];old.due=addDays([1,3,7,14,30][old.level-1]||30)}
 else{old.level=0;old.due=today();state.known=state.known.filter(x=>x!==id)}
 state.reviews[id]=old;saveState();renderWords();
 if(known){if(!sessionAgain.has(currentStudy.word))sessionKnown++;$("studyMessage").textContent="Nice. This word will come back in "+([1,3,7,14,30][old.level-1]||30)+" day"+(old.level===1?"":"s")+"."}
 else{sessionAgain.add(currentStudy.word);studyQueue.splice(Math.min(studyIndex+4,studyQueue.length),0,currentStudy);$("studyMessage").textContent="No problem. You will see this word again in a few cards."}
 $("againStudy").disabled=true;$("knowStudy").disabled=true;$("nextStudy").hidden=false;$("nextStudy").focus();
}
$("againStudy").addEventListener("click",()=>markReview(false));$("knowStudy").addEventListener("click",()=>markReview(true));
$("nextStudy").addEventListener("click",()=>{studyIndex++;renderStudy()});
$("study").querySelector(".vocab-actions")?.remove();
$("study").insertAdjacentHTML("beforeend",'<div class="study-controls"><button class="vocab-btn" id="startAllStudy" type="button">Practise all words</button><button class="vocab-btn" id="startSavedStudy" type="button">Review my saved words</button></div>');
$("startAllStudy").addEventListener("click",()=>beginSession(shuffle(WORDS),"Full vocabulary practice started, in random order."));
$("startSavedStudy").addEventListener("click",()=>{const q=state.saved.map(id=>WORDS.find(w=>w.id===id)).filter(Boolean);if(!q.length){$("studyMessage").textContent="Your review list is empty. Save a few words from the vocabulary bank first.";return}beginSession(q,"Your saved-word review has started.")});
startStudy();
// Quiz: five questions selected at random. Answer can be changed until checked.
let quizSet=[],quizIndex=0,score=0,selected=null,checked=false,locked=false,missed=[];
function wordForQuestion(q){
 const ans=String(q.o[q.a]).toLowerCase().replace(/^the /,"").trim();
 const exact=WORDS.find(w=>w.word===ans);if(exact)return exact;
 const why=q.why.toLowerCase();
 return WORDS.filter(w=>new RegExp("\\b"+w.word.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\b").test(why)).sort((a,b)=>b.word.length-a.word.length)[0]||null;
}
function startQuiz(){
 const priority=QUESTIONS.filter(q=>q.recent);const regular=QUESTIONS.filter(q=>!q.recent);quizSet=shuffle([...shuffle(priority).slice(0,5),...shuffle(regular).slice(0,5)]).map(q=>{const order=shuffle(q.o.map((_,i)=>i));return {...q,o:order.map(i=>q.o[i]),a:order.indexOf(q.a)}});quizIndex=0;score=0;locked=false;missed=[];renderQuestion();
}
function renderQuestion(){
 selected=null;checked=false;
 const q=quizSet[quizIndex],area=$("quizArea");area.innerHTML="";
 $("quizProgress").textContent="Question "+(quizIndex+1)+" of 10 · "+score+" correct so far";
 const title=document.createElement("p");title.className="quiz-question";title.textContent=q.q;
 const options=document.createElement("div");options.className="quiz-options";
 q.o.forEach((option,i)=>{const b=document.createElement("button");b.type="button";b.className="vocab-option";b.textContent=String.fromCharCode(65+i)+". "+option;b.addEventListener("click",()=>{if(checked||locked)return;selected=i;options.querySelectorAll("button").forEach((x,j)=>x.classList.toggle("selected",j===i));submit.disabled=false});options.append(b)});
 const feedback=document.createElement("p");feedback.className="vocab-feedback";feedback.setAttribute("aria-live","polite");
 const submit=document.createElement("button");submit.type="button";submit.className="vocab-btn primary";submit.textContent=quizIndex===9?"Finish session":"Check answer";submit.disabled=true;
 submit.addEventListener("click",()=>{if(selected===null)return;if(checked){quizIndex++;if(quizIndex===10)showResult();else renderQuestion();return}checked=true;const right=selected===q.a;if(right)score++;else{const w=wordForQuestion(q);if(w&&!missed.includes(w))missed.push(w)}
  options.querySelectorAll("button").forEach((x,j)=>{x.classList.toggle("is-correct",j===q.a);x.classList.toggle("is-wrong",j===selected&&!right);x.setAttribute("aria-disabled","true")});
  feedback.className="vocab-feedback "+(right?"good":"bad");feedback.textContent=(right?"That’s right. ":"Not quite. The answer is "+String.fromCharCode(65+q.a)+". ")+q.why;submit.textContent=quizIndex===9?"See result":"Next question"});
 area.append(title,options,feedback,submit);
}
function showResult(){
 locked=true;const passed=score>=8;const result=document.createElement("div");result.className="vocab-result "+(passed?"is-passed":"needs-practice");
 const h=document.createElement("h3");h.textContent="You scored "+score+"/10";
 const p=document.createElement("p");p.textContent=passed?"Good work. You passed this practice session. Your streak has been updated for today.":"You need 8/10 to pass this session. Review the explanations and try another set. Your streak has not changed.";
 result.append(h,p);
 const toAdd=missed.filter(w=>!state.saved.includes(w.id));
 if(missed.length){const m=document.createElement("div");m.className="quiz-missed";m.innerHTML="<p><strong>Words to review:</strong> "+missed.map(w=>escapeHTML(w.word)).join(", ")+"</p>";
  if(toAdd.length){const add=document.createElement("button");add.type="button";add.className="vocab-btn";add.textContent="＋ Add "+(toAdd.length===1?"this word":"these "+toAdd.length+" words")+" to my review list";add.addEventListener("click",()=>{toAdd.forEach(w=>{if(!state.saved.includes(w.id))state.saved.push(w.id);if(!state.reviews[w.id])state.reviews[w.id]={level:0,due:today()}});saveState();renderWords();add.disabled=true;add.textContent="✓ Added. Review them in the flashcards above."});m.append(add)}
  else{const ok=document.createElement("p");ok.className="study-status";ok.textContent="These words are already in your review list.";m.append(ok)}
  result.append(m)}
 const retry=document.createElement("button");retry.type="button";retry.className="vocab-btn primary";retry.textContent="Practise another set";retry.addEventListener("click",startQuiz);result.append(retry);$("quizArea").replaceChildren(result);
 $("quizProgress").textContent=passed?"Session passed":"Session not passed";
 if(passed){
  const date=today();
  const stats=read(STATS,{passed:0,days:[]});stats.days=stats.days||[];if(!stats.days.includes(date)){stats.passed=(stats.passed||0)+1;stats.days.push(date)}write(STATS,stats);
  // features.js owns streak storage and increments it once per local calendar day.
  window.dispatchEvent(new CustomEvent("englisity:quiz-passed",{detail:{score}}));
 }
}
startQuiz();
})();