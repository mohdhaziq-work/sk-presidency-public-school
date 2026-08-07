/* SKPPS v3 — Premium Interactive Features */
(function(){
  // Hero slider
  var slide=0,total=document.querySelectorAll('.hero-slide').length,auto;
  if(total>1){
    function upDots(){document.querySelectorAll('.hero-dot').forEach(function(d,i){d.classList.toggle('active',i===slide)})}
    window.goTo=function(i){slide=((i%total)+total)%total;document.querySelectorAll('.hero-slide').forEach(function(s,idx){s.classList.toggle('active',idx===slide)});upDots();clearInterval(auto);auto=setInterval(next,5000)}
    window.heroMove=function(d){goTo(slide+d)};function next(){goTo(slide+1)}
    upDots();auto=setInterval(next,5000);
    var hero=document.getElementById('heroSlider')||document.querySelector('.hero');
    if(hero){var tx;hero.addEventListener('touchstart',function(e){tx=e.touches[0].clientX});hero.addEventListener('touchend',function(e){var d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>50)goTo(slide+(d<0?1:-1))})}
  }

  // Scroll reveal
  var ob=new IntersectionObserver(function(e){e.forEach(function(e){if(e.isIntersecting)e.target.classList.add('visible')})},{threshold:.12});
  document.querySelectorAll('.reveal').forEach(function(el){ob.observe(el)});

  // Back to top + Scroll progress
  var btt=document.querySelector('.back-to-top'),sp=document.getElementById('scrollBar');
  if(btt){window.addEventListener('scroll',function(){btt.classList.toggle('show',window.scrollY>500);if(sp){var h=document.documentElement,sh=h.scrollHeight-h.clientHeight;sp.style.width=sh>0?Math.round(window.scrollY/sh*100)+'%':'0%'}});btt.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})})}

  // Nav mobile
  var t=document.querySelector('.nav-toggle'),l=document.querySelector('.nav-list');
  if(t&&l){t.addEventListener('click',function(){l.classList.toggle('open')});document.addEventListener('click',function(e){if(!e.target.closest('.nav'))l.classList.remove('open')})}

  // Sidebar toggle for inner pages
  var sbHead=document.querySelector('.sidebar-head');
  if(sbHead){sbHead.addEventListener('click',function(){document.querySelector('.sidebar-links').classList.toggle('collapsed')})}
})();
