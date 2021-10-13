<script lang="ts">
  import Logo from '../assets/Logo.svg';
  import LogoDark from '../assets/Logo-dark.svg'
  import { theme } from '../store'

  let scrollY
</script>

<svelte:window bind:scrollY={scrollY}/>

<nav
  class="fixed top-0 w-[100%] flex justify-center items-center cursor-pointer z-10"
  style="height: {scrollY > 0 ? 10 : 35}vh;"
  on:click={() => {
    window.scrollTo(0, 0)
    history.replaceState(null, null, ' ');
  }}>
  <div class="absolute w-[100%] h-[100%] bg-primaryLight dark:bg-primaryDark transition-all " style="filter: brightness({scrollY > 0 ? .75 : 1});" />
  <div class="rounded-[25%] bg-white mx-auto {scrollY > 0 ? 'p-1' : 'p-3'} transition-all z-20" style="height: {scrollY > 0 ? 7.5 : 20}vh;">
    <img src={$theme === 'dark' ? LogoDark : Logo} alt="Logo" class="block h-[100%] w-auto" />
  </div>
</nav>
