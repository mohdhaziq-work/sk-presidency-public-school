/* SKPPS — Scroll animations, slider, nav toggle */
(function(){
  var currentSlide=0,totalSlides=document.querySelectorAll('.hero-slide').length||0,autoSlide;

  function goTo(i){
    currentSlide=((i%totalSlides)+totalSlides)%totalSlides;
    document.querySelectorAll('.hero-slide').forEach(function(s,idx){s.classList.toggle('active',idx===currentSlide)});
    document.querySelectorAll('.hero-dot').forEach(function(d,idx){d.classList.toggle('active',idx===currentSlide)});
  }

  if(totalSlides>1){
    document.querySelectorAll('.hero-dot').forEach(function(dot){dot.addEventListener('click',function(){goTo(parseInt(this.dataset.index));resetAuto()})});
    function nextSlide(){goTo(currentSlide+1)}function resetAuto(){clearInterval(autoSlide);autoSlide=setInterval(nextSlide,4500)}
    autoSlide=setInterval(nextSlide,4500);
    // Touch swipe
    var touchX=0,touchY=0,hero=document.querySelector('.hero');
    if(hero){hero.addEventListener('touchstart',function(e){touchX=e.touches[0].clientX;touchY=e.touches[0].clientY});hero.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>50){if(dx<0)goTo(currentSlide+1);else goTo(currentSlide-1);resetAuto()}})}
  }

  // Scroll reveal
  var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('visible')}})},{threshold:0.15});
  document.querySelectorAll('.reveal').forEach(function(el){observer.observe(el)});

  // Back to top
  var btt=document.querySelector('.back-to-top');
  if(btt){window.addEventListener('scroll',function(){btt.classList.toggle('visible',window.scrollY>400)});btt.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})})}

  // Nav toggle mobile
  var toggle=document.querySelector('.nav-toggle'),list=document.querySelector('.nav-list');
  if(toggle&&list){toggle.addEventListener('click',function(){var open=list.classList.toggle('open');toggle.setAttribute('aria-expanded',open)});document.addEventListener('click',function(e){if(!e.target.closest('.nav')){list.classList.remove('open');toggle.setAttribute('aria-expanded','false')}})}
})();
