<script lang="ts">
  // @ts-nocheck
  import gsap from 'gsap'
  import Icon from 'svelte-awesome';
  import { swipe } from 'svelte-hammer'

  import screenshotLight from '../assets/screenshot-light.jpg'
  import screenshotDark from '../assets/screenshot-dark.jpg'

  import {faArrowLeft, faArrowRight} from '@fortawesome/free-solid-svg-icons'

  const animation = gsap.timeline({defaults: {duration: .75, ease: 'power2.inOut'}})

  const slides = [
    "g#one",
    "g#two"
  ]
  let currentSlide = 0

  export function nextScreenshot() {
    const slide = slides[Math.abs(currentSlide)%slides.length]
    const slideNext = slides[Math.abs(currentSlide + 1)%slides.length]

    animation
      // Slides
      .set(slideNext, {
        x: '100%'
      })
      .to(slide, {
        x: '-100%'
      })
      .to(slideNext, {
        x: 0
      }, '<')
      // Menu bubbles
      .to("#bubbles span:nth-of-type(2)", {
        y: 10,
        x: -15,
        opacity: 0
      }, '<')
      .to("#bubbles span:nth-of-type(3)", {
        width: '0.75rem',
        height: '0.75rem',
        border: '2px rgba(0, 0, 0, .2) solid',
        y: 4,
        x: -20.25
      }, '<')
      .to("#bubbles span:nth-of-type(4)", {
        width: '1rem',
        height: '1rem',
        backgroundColor: 'white',
        border: '2px rgba(0, 0, 0, .4) solid',
        y: 2,
        x: -20.25
      }, '<')
      .to("#bubbles span:nth-of-type(5)", {
        width: '1.25rem',
        height: '1.25rem',
        backgroundColor: '#512da8',
        borderColor: 'transparent',
        y: -2,
        x: -20.5
      }, '<')
      .to("#bubbles span:nth-of-type(6)", {
        width: '1rem',
        height: '1rem',
        border: '2px rgba(0, 0, 0, .4) solid',
        y: -4,
        x: -20.25
      }, '<')
      .fromTo("#bubbles span:nth-of-type(7)", {
        y: 10,
        x: 15,
      }, {
        opacity: 1,
        y: 0,
        x: -0.25
      }, '<')
      .set("#bubbles span", {clearProps:"all"})

      currentSlide += 1
  }

  export function previousScreenshot() {
    const slide = slides[Math.abs(currentSlide)%slides.length]
    const slidePrev = slides[Math.abs(currentSlide - 1)%slides.length]

    animation
      // Slides
      .set(slidePrev, {
        x: '-100%'
      })
      .to(slide, {
        x: '100%'
      })
      .to(slidePrev, {
        x: 0
      }, '<')
      // Menu bubbles
      .to("#bubbles span:nth-of-type(6)", {
        y: 10,
        x: 15,
        opacity: 0
      }, '<')
      .to("#bubbles span:nth-of-type(5)", {
        width: '0.75rem',
        height: '0.75rem',
        border: '2px rgba(0, 0, 0, .2) solid',
        y: 4,
        x: 20.5
      }, '<')
      .to("#bubbles span:nth-of-type(4)", {
        width: '1rem',
        height: '1rem',
        backgroundColor: 'white',
        border: '2px rgba(0, 0, 0, .4) solid',
        y: 2,
        x: 20.75
      }, '<')
      .to("#bubbles span:nth-of-type(3)", {
        width: '1.25rem',
        height: '1.25rem',
        backgroundColor: '#512da8',
        borderColor: 'transparent',
        y: -2,
        x: 20.25
      }, '<')
      .to("#bubbles span:nth-of-type(2)", {
        width: '1rem',
        height: '1rem',
        border: '2px rgba(0, 0, 0, .4) solid',
        y: -4,
        x: 20.25
      }, '<')
      .fromTo("#bubbles span:nth-of-type(1)", {
        y: 10,
        x: -15,
      }, {
        opacity: 1,
        y: 0,
        x: -2
      }, '<')
      .set("#bubbles span", {clearProps:"all"})

    currentSlide -= 1
  }

  function handleKeydown(event) {
    switch (event.keyCode) {
      case 39:
        nextScreenshot()
        break;
      case 37:
        previousScreenshot()
        break;
    }
	}

</script>

<svelte:window on:keydown={handleKeydown}/>

<div class="xl:-mt-4 -mt-24 overflow-hidden">
  <div 
    class="xl:scale-90 scale-[.85]"
    use:swipe
    on:swipeleft={nextScreenshot}
    on:swiperight={previousScreenshot}
  >
    <svg width="365" height="789" viewBox="0 0 365 789" fill="none" xmlns="http://www.w3.org/2000/svg" class="mx-auto">
      <rect x="355.032" y="139.932" width="9.76171" height="43.4034" rx="4" fill="black"/>
      <rect x="355.032" y="184.369" width="9.76171" height="43.4034" rx="4" fill="black"/>
      <mask id="mask0" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="362" height="789">
        <rect width="362" height="789" rx="63" fill="#FF0000"/>
      </mask>
      <g mask="url(#mask0)">
        <g id="two">
          <image x="3.25%" y="1.2%" width="93%" height="96.5%" mask="url(#mask0)" xlink:href="{screenshotDark}" />
        </g>
        <g id="one">
          <image x="3.25%" y="1.2%" width="93%" height="96.5%" mask="url(#mask0)" xlink:href="{screenshotLight}" />
        </g>
        
        <path fill-rule="evenodd" clip-rule="evenodd" d="M-0.226929 63.6215C-0.226929 28.5515 28.203 0.121521 63.2731 0.121521H298.92C333.99 0.121521 362.42 28.5514 362.42 63.6215V725.716C362.42 760.786 333.99 789.216 298.92 789.216H63.2731C28.203 789.216 -0.226929 760.786 -0.226929 725.716V63.6215ZM63.2731 13.1215C35.3827 13.1215 12.7731 35.7311 12.7731 63.6215V725.716C12.7731 753.606 35.3827 776.216 63.2731 776.216H298.92C326.81 776.216 349.42 753.606 349.42 725.716V63.6215C349.42 35.7311 326.81 13.1215 298.92 13.1215H63.2731Z" fill="black"/>
        <circle cx="181.299" cy="27.0926" r="8.41" fill="#282828" stroke="black" stroke-width="2"/>
        <rect x="131.401" y="4.03796" width="99.392" height="5.16707" rx="2.58354" fill="#282828"/>
        <path d="M19.9175 763.895C31.2095 773.036 31.2095 773.036 47.4618 773.036H314.731C330.983 773.036 330.983 773.036 342.275 763.895" stroke="black" stroke-width="12" stroke-linecap="round"/>
      </g>
    </svg>
  </div>
  <div class="grid grid-flow-col w-full justify-items-center items-center xl:-mt-4 -mt-10">
    <button on:click|preventDefault={previousScreenshot} class="justify-self-end text-borderDark" >
      <Icon data={faArrowLeft} scale="1.75" />
    </button>
    <div class="mx-5 w-28 h-7 relative" id="bubbles">
      <span class="rounded-full border-black border-opacity-20 border-2 h-3 w-3 inline-block absolute top-3.5 left-0.5 opacity-0" />
      <span class="rounded-full border-black border-opacity-20 border-2 h-3 w-3 inline-block relative top-1.5" />
      <span class="rounded-full border-black border-opacity-40 border-2 h-4 w-4 inline-block relative top-0.5 mx-1" />
      <span class="rounded-full border-black border-opacity-0 border-2 bg-primaryLight h-5 w-5 inline-block" />
      <span class="rounded-full border-black border-opacity-40 border-2 bg-white h-4 w-4 inline-block relative top-0.5 mx-1" />
      <span class="rounded-full border-black border-opacity-20 border-2 h-3 w-3 inline-block relative top-1.5" />
      <span class="rounded-full border-black border-opacity-20 border-2 h-3 w-3 inline-block absolute top-3.5 right-0.5 opacity-0" />
    </div>
    <button on:click|preventDefault={nextScreenshot} class="justify-self-start text-borderDark" >
      <Icon data={faArrowRight} scale="1.75" />
    </button>
  </div>
</div>